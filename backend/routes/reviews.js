const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const notificationService = require('../services/notificationService');

// Submit review
router.post('/reviews', async (req, res) => {
  try {
    const { orderId, productId, phoneNumber, rating, comment } = req.body;

    if (!orderId || !productId || !phoneNumber || !rating) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    // Verify order
    const order = await Order.findById(orderId);
    if (!order || order.phoneNumber !== phoneNumber) {
      return res.status(403).json({ error: 'Commande non autorisée' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'Commande non livrée' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ orderId, productId });
    if (existingReview) {
      return res.status(400).json({ error: 'Avis déjà soumis' });
    }

    const review = new Review({
      orderId,
      productId,
      shopId: order.shopId,
      phoneNumber,
      rating,
      comment
    });

    await review.save();

    // Mark order as reviewed
    order.reviewSubmitted = true;
    await order.save();

    // Notify shop
    await notificationService.sendReviewNotification(
      order.shopId,
      productId,
      rating
    );

    res.json({ success: true, review });
  } catch (error) {
    console.error('Erreur soumission avis:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get product reviews
router.get('/products/:productId/reviews', async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      reviews,
      avgRating: avgRating.toFixed(1),
      totalReviews: reviews.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
