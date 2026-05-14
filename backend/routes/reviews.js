const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const Shop = require('../models/Shop');

// Rate limiting simple (in-memory)
const rateLimit = new Map();
const RATE_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

const checkRateLimit = (key) => {
  const now = Date.now();
  const entry = rateLimit.get(key) || { count: 0, start: now };
  if (now - entry.start > RATE_WINDOW_MS) {
    rateLimit.set(key, { count: 1, start: now });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count++;
  rateLimit.set(key, entry);
  return true;
};

// POST /api/reviews - Submit shop review after delivery
router.post('/reviews', async (req, res) => {
  try {
    const { orderId, customerPhone, rating, comment, customerName } = req.body;

    if (!orderId || !customerPhone || !rating) {
      return res.status(400).json({ error: 'بيانات ناقصة' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'التقييم يجب أن يكون بين 1 و 5' });
    }

    // Rate limiting per phone
    if (!checkRateLimit(customerPhone)) {
      return res.status(429).json({ error: 'محاولات كثيرة، حاول لاحقاً' });
    }

    // Verify order exists and belongs to this phone
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'الطلبية غير موجودة' });

    if (order.phoneNumber !== customerPhone) {
      return res.status(403).json({ error: 'غير مصرح' });
    }

    if (order.status.toLowerCase() !== 'delivered') {
      return res.status(400).json({ error: 'لا يمكن التقييم قبل التسليم' });
    }

    // Prevent duplicate review per order
    const existing = await Review.findOne({ orderId });
    if (existing) {
      return res.status(400).json({ error: 'تم تقييم هذه الطلبية مسبقاً' });
    }

    const review = await Review.create({
      orderId,
      shopId: order.shopId,
      customerName: customerName || order.customerName || '',
      customerPhone,
      rating,
      comment: comment || ''
    });

    // Update shop averageRating
    const shop = await Shop.findById(order.shopId);
    if (shop) {
      const newTotal = shop.totalRatings + 1;
      const newAvg = ((shop.averageRating * shop.totalRatings) + rating) / newTotal;
      shop.averageRating = Math.round(newAvg * 10) / 10;
      shop.totalRatings = newTotal;
      await shop.save();
    }

    // Mark order as reviewed
    order.reviewSubmitted = true;
    await order.save();

    res.json({ success: true, review, averageRating: shop?.averageRating });
  } catch (error) {
    console.error('خطأ في التقييم:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/shops/:shopId/reviews
router.get('/shops/:shopId/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ shopId: req.params.shopId }).sort({ createdAt: -1 });
    const shop = await Shop.findById(req.params.shopId).select('averageRating totalRatings');
    res.json({
      reviews,
      averageRating: shop?.averageRating || 0,
      totalRatings: shop?.totalRatings || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/:orderId/can-review
router.get('/orders/:orderId/can-review', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ canReview: false });
    const existing = await Review.findOne({ orderId: req.params.orderId });
    res.json({
      canReview: order.status.toLowerCase() === 'delivered' && !existing,
      alreadyReviewed: !!existing
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
