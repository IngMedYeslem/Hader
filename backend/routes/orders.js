const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const notificationService = require('../services/notificationService');

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate unique order number
const generateOrderNumber = () => `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

// Create guest order with soft OTP
router.post('/orders/guest', async (req, res) => {
  try {
    const { phoneNumber, deviceId, items, shippingAddress, paymentMethod, customerName, notes, totalAmount: clientTotal, deliveryFee } = req.body;
    
    if (!phoneNumber || !items || items.length === 0) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    let calcTotal = 0;
    const orderItems = [];
    let shopId = null;

    for (const item of items) {
      // Support both productId and direct item data (from frontend)
      if (item.productId) {
        try {
          const product = await Product.findById(item.productId);
          if (product) {
            shopId = product.shopId;
            calcTotal += product.price * item.quantity;
            orderItems.push({
              productId: product._id,
              name: product.name,
              price: product.price,
              quantity: item.quantity
            });
          } else {
            // Product not found, use client data
            calcTotal += (item.price || 0) * item.quantity;
            orderItems.push({
              productId: item.productId,
              name: item.name || 'Produit',
              price: item.price || 0,
              quantity: item.quantity
            });
          }
        } catch (e) {
          calcTotal += (item.price || 0) * item.quantity;
          orderItems.push({
            productId: item.productId,
            name: item.name || 'Produit',
            price: item.price || 0,
            quantity: item.quantity
          });
        }
      }
    }

    // Use shopId from request body if not found from products
    if (!shopId && req.body.shopId) shopId = req.body.shopId;

    const softOtp = generateOTP();
    const orderNumber = generateOrderNumber();
    const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const order = new Order({
      orderNumber,
      phoneNumber,
      customerName: customerName || '',
      notes: notes || '',
      paymentMethod: paymentMethod || 'cash',
      deviceId: deviceId || 'app',
      softOtp,
      otpExpiresAt,
      otpStatus: 'verified', // Auto-verify for app orders
      shopId,
      items: orderItems,
      totalAmount: clientTotal || calcTotal,
      deliveryFee: deliveryFee || 0,
      shippingAddress,
      status: 'pending'
    });

    await order.save();

    // Notify shop
    if (shopId) {
      try {
        await notificationService.sendOrderNotification(shopId, order._id, order.orderNumber);
      } catch (e) { console.log('Notification error:', e); }
    }

    res.json({
      success: true,
      orderId: order._id,
      orderNumber,
      softOtp,
      expiresAt: otpExpiresAt
    });
  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP and confirm order
router.post('/orders/:orderId/verify', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }

    if (order.otpStatus === 'verified') {
      return res.status(400).json({ error: 'Commande déjà vérifiée' });
    }

    if (new Date() > order.otpExpiresAt) {
      order.otpStatus = 'expired';
      await order.save();
      return res.status(400).json({ error: 'OTP expiré' });
    }

    if (order.softOtp !== otp) {
      return res.status(400).json({ error: 'OTP invalide' });
    }

    // Update order status
    order.otpStatus = 'verified';
    order.status = 'confirmed';
    await order.save();

    // Update product stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
        
        // Check low stock
        if (product.stock < 5) {
          await notificationService.sendLowStockNotification(
            order.shopId,
            product._id,
            product.name,
            product.stock
          );
        }
      }
    }

    // Notify shop
    await notificationService.sendOrderNotification(
      order.shopId,
      order._id,
      order.orderNumber
    );

    res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount
      }
    });
  } catch (error) {
    console.error('Erreur vérification OTP:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get order by order number
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

// Get orders by phone number
router.get('/orders/phone/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const orders = await Order.find({ phoneNumber, otpStatus: 'verified' })
      .populate('shopId', 'name phone whatsapp')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (for shop)
router.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingLink } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }

    order.status = status;
    if (trackingLink) order.trackingLink = trackingLink;
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get shop orders
router.get('/shops/:shopId/orders', async (req, res) => {
  try {
    const { shopId } = req.params;
    const orders = await Order.find({ shopId, otpStatus: 'verified' })
      .populate('items.productId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload payment receipt for an order
router.put('/orders/:orderId/receipt', async (req, res) => {
  try {
    const { receiptUrl } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { paymentReceiptUrl: receiptUrl, paymentStatus: 'receipt_uploaded' },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });

    // Notify shop about receipt upload
    if (order.shopId) {
      try {
        const notificationService = require('../services/notificationService');
        await notificationService.sendOrderNotification(
          order.shopId, order._id,
          `${order.orderNumber} - إيصال دفع مرفوع`
        );
      } catch (e) {}
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm or reject payment receipt (shop action)
router.put('/orders/:orderId/payment-status', async (req, res) => {
  try {
    const { paymentStatus } = req.body; // 'confirmed' | 'rejected'
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { paymentStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get shop bank accounts
router.get('/shops/:shopId/bank-accounts', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId).select('bankAccounts name');
    if (!shop) return res.status(404).json({ error: 'Boutique introuvable' });
    res.json(shop.bankAccounts || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update shop bank accounts
router.put('/shops/:shopId/bank-accounts', async (req, res) => {
  try {
    const { bankAccounts } = req.body;
    const shop = await Shop.findByIdAndUpdate(
      req.params.shopId,
      { bankAccounts },
      { new: true }
    ).select('bankAccounts');
    if (!shop) return res.status(404).json({ error: 'Boutique introuvable' });
    res.json({ success: true, bankAccounts: shop.bankAccounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
