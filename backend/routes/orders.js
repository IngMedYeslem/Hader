const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const notificationService = require('../services/notificationService');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateOrderNumber = () => `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

// Valid status transitions: who can move to which status
const STATUS_TRANSITIONS = {
  pending:    { next: ['confirmed', 'cancelled'] },
  confirmed:  { next: ['preparing', 'cancelled'] },
  preparing:  { next: ['on_the_way', 'cancelled'] },
  on_the_way: { next: ['delivered', 'cancelled'] },
  delivered:  { next: [] },
  cancelled:  { next: [] },
  // legacy states kept for backward compat
  ready:      { next: ['on_the_way', 'cancelled'] },
  picked_up:  { next: ['on_the_way', 'delivered', 'cancelled'] },
  failed:     { next: [] },
  no_answer:  { next: ['on_the_way', 'cancelled'] },
  unavailable:{ next: ['cancelled'] },
};

const STATUS_NOTIFICATIONS = {
  confirmed:  { title: 'تم تأكيد طلبك ✅',       body: (n) => `طلبك #${n} تم قبوله من المتجر` },
  preparing:  { title: 'جاري تحضير طلبك 👨‍🍳',    body: (n) => `المتجر بدأ في تحضير طلبك #${n}` },
  ready:      { title: 'طلبك جاهز 📦',            body: (n) => `طلبك #${n} جاهز وينتظر المندوب` },
  picked_up:  { title: 'المندوب استلم طلبك 🛵',   body: (n) => `طلبك #${n} في يد المندوب` },
  on_the_way: { title: 'المندوب في الطريق إليك 🚀', body: (n) => `طلبك #${n} في الطريق` },
  delivered:  { title: 'تم توصيل طلبك 🎉',        body: (n) => `تم توصيل طلبك #${n} بنجاح` },
  cancelled:  { title: 'تم إلغاء الطلب ❌',        body: (n) => `طلبك #${n} تم إلغاؤه` },
  failed:     { title: 'فشل التوصيل ⚠️',           body: (n) => `تعذر توصيل طلبك #${n}` },
  no_answer:  { title: 'لم يتم الرد 📵',           body: (n) => `المندوب لم يتمكن من الوصول إليك` },
  unavailable:{ title: 'منتجات غير متوفرة 😔',     body: (n) => `بعض منتجات طلبك #${n} غير متوفرة` },
};

async function pushStatusHistory(order, newStatus, changedBy, changedById, note = '') {
  order.statusHistory = order.statusHistory || [];
  order.statusHistory.push({ status: newStatus, changedBy, changedById, note, timestamp: new Date() });

  // Set timestamps for key stages
  if (newStatus === 'preparing') order.prepStartedAt = new Date();
  if (newStatus === 'ready')     order.readyAt = new Date();
  if (newStatus === 'picked_up') order.pickedUpAt = new Date();
  if (newStatus === 'delivered') order.deliveredAt = new Date();
}

// ── Create guest order ──
router.post('/orders/guest', async (req, res) => {
  try {
    const { phoneNumber, deviceId, items, shippingAddress, paymentMethod, customerName, notes, totalAmount: clientTotal, deliveryFee } = req.body;

    if (!phoneNumber || !items || items.length === 0)
      return res.status(400).json({ error: 'Données manquantes' });

    let calcTotal = 0;
    const orderItems = [];
    let shopId = null;

    for (const item of items) {
      if (item.productId) {
        try {
          const product = await Product.findById(item.productId);
          if (product) {
            shopId = product.shopId;
            calcTotal += product.price * item.quantity;
            orderItems.push({ productId: product._id, name: product.name, price: product.price, quantity: item.quantity });
          } else {
            calcTotal += (item.price || 0) * item.quantity;
            orderItems.push({ productId: item.productId, name: item.name || 'Produit', price: item.price || 0, quantity: item.quantity });
          }
        } catch {
          calcTotal += (item.price || 0) * item.quantity;
          orderItems.push({ productId: item.productId, name: item.name || 'Produit', price: item.price || 0, quantity: item.quantity });
        }
      }
    }

    if (!shopId && req.body.shopId) shopId = req.body.shopId;

    const softOtp = generateOTP();
    const orderNumber = generateOrderNumber();
    const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const order = new Order({
      orderNumber, phoneNumber, customerName: customerName || '', notes: notes || '',
      paymentMethod: paymentMethod || 'cash', deviceId: deviceId || 'app',
      softOtp, otpExpiresAt, otpStatus: 'verified', shopId,
      items: orderItems, totalAmount: clientTotal || calcTotal,
      deliveryFee: deliveryFee || 0, shippingAddress, status: 'pending',
      statusHistory: [{ status: 'pending', changedBy: 'system', note: 'تم إنشاء الطلب', timestamp: new Date() }]
    });

    await order.save();

    if (shopId) {
      try { await notificationService.sendOrderNotification(shopId, order._id, order.orderNumber); } catch {}
    }

    res.json({ success: true, orderId: order._id, orderNumber, softOtp, expiresAt: otpExpiresAt });
  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── Verify OTP ──
router.post('/orders/:orderId/verify', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });
    if (order.otpStatus === 'verified') return res.status(400).json({ error: 'Commande déjà vérifiée' });
    if (new Date() > order.otpExpiresAt) {
      order.otpStatus = 'expired';
      await order.save();
      return res.status(400).json({ error: 'OTP expiré' });
    }
    if (order.softOtp !== req.body.otp) return res.status(400).json({ error: 'OTP invalide' });

    order.otpStatus = 'verified';
    // Keep status as 'pending' — shop must manually accept the order
    await pushStatusHistory(order, 'pending', 'system', null, 'تم التحقق من OTP - في انتظار موافقة المتجر');
    await order.save();

    // Notify shop of new order
    await notificationService.sendOrderNotification(order.shopId, order._id, order.orderNumber);
    res.json({ success: true, order: { orderNumber: order.orderNumber, status: order.status, totalAmount: order.totalAmount } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Update order status (main endpoint) ──
router.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { status: newStatus, changedBy = 'store', changedById, note = '', trackingLink, estimatedPrepTime, driverId } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });

    const transition = STATUS_TRANSITIONS[order.status];
    if (!transition || !transition.next.includes(newStatus))
      return res.status(400).json({ error: `لا يمكن الانتقال من ${order.status} إلى ${newStatus}` });

    order.status = newStatus;
    if (trackingLink) order.trackingLink = trackingLink;
    if (estimatedPrepTime) order.estimatedPrepTime = estimatedPrepTime;
    if (driverId) order.driverId = driverId;

    await pushStatusHistory(order, newStatus, changedBy, changedById, note);
    await order.save();

    // Deduct stock only when shop confirms the order
    if (newStatus === 'confirmed') {
      for (const item of order.items) {
        try {
          const product = await Product.findById(item.productId);
          if (product) {
            product.stock = Math.max(0, (product.stock || 0) - item.quantity);
            await product.save();
            if (product.stock < 5)
              await notificationService.sendLowStockNotification(order.shopId, product._id, product.name, product.stock);
          }
        } catch {}
      }
    }

    // Notify customer
    const notif = STATUS_NOTIFICATIONS[newStatus];
    if (notif && order.userId) {
      try {
        await notificationService.sendOrderStatusNotification(
          order.userId, order._id, notif.title, notif.body(order.orderNumber)
        );
      } catch {}
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Update driver GPS location ──
router.put('/orders/:orderId/location', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { driverLocation: { lat, lng, updatedAt: new Date() } },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Get orders by shop with tab filtering ──
router.get('/shops/:shopId/orders', async (req, res) => {
  try {
    const { tab } = req.query; // new | preparing | ready | delivering | completed | cancelled
    const tabFilters = {
      new:        { status: 'pending' },
      preparing:  { status: { $in: ['confirmed', 'preparing'] } },
      ready:      { status: 'ready' },
      delivering: { status: { $in: ['picked_up', 'on_the_way', 'no_answer'] } },
      completed:  { status: 'delivered' },
      cancelled:  { status: { $in: ['cancelled', 'failed', 'unavailable'] } },
    };

    const filter = { shopId: req.params.shopId, otpStatus: 'verified' };
    if (tab && tabFilters[tab]) Object.assign(filter, tabFilters[tab]);

    const orders = await Order.find(filter)
      .populate('items.productId', 'name')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Get order counts per tab (for badges) ──
router.get('/shops/:shopId/orders/counts', async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const base = { shopId, otpStatus: 'verified' };
    const [newC, preparingC, readyC, deliveringC, completedC, cancelledC] = await Promise.all([
      Order.countDocuments({ ...base, status: 'pending' }),
      Order.countDocuments({ ...base, status: { $in: ['confirmed', 'preparing'] } }),
      Order.countDocuments({ ...base, status: 'ready' }),
      Order.countDocuments({ ...base, status: { $in: ['picked_up', 'on_the_way', 'no_answer'] } }),
      Order.countDocuments({ ...base, status: 'delivered' }),
      Order.countDocuments({ ...base, status: { $in: ['cancelled', 'failed', 'unavailable'] } }),
    ]);
    res.json({ new: newC, preparing: preparingC, ready: readyC, delivering: deliveringC, completed: completedC, cancelled: cancelledC });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Get order by number ──
router.get('/orders/number/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('shopId', 'name phone whatsapp');
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Get orders by phone ──
router.get('/orders/phone/:phoneNumber', async (req, res) => {
  try {
    const orders = await Order.find({ phoneNumber: req.params.phoneNumber, otpStatus: 'verified' })
      .populate('shopId', 'name phone whatsapp')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Payment receipt ──
router.put('/orders/:orderId/receipt', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { paymentReceiptUrl: req.body.receiptUrl, paymentStatus: 'receipt_uploaded' },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });
    if (order.shopId) {
      try { await notificationService.sendOrderNotification(order.shopId, order._id, `${order.orderNumber} - إيصال دفع مرفوع`); } catch {}
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/orders/:orderId/payment-status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { paymentStatus: req.body.paymentStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Bank accounts ──
router.get('/shops/:shopId/bank-accounts', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId).select('bankAccounts name');
    if (!shop) return res.status(404).json({ error: 'Boutique introuvable' });
    res.json(shop.bankAccounts || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/shops/:shopId/bank-accounts', async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(
      req.params.shopId,
      { bankAccounts: req.body.bankAccounts },
      { new: true }
    ).select('bankAccounts');
    if (!shop) return res.status(404).json({ error: 'Boutique introuvable' });
    res.json({ success: true, bankAccounts: shop.bankAccounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
