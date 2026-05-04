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
    const { phoneNumber, deviceId, items, shippingAddress } = req.body;
    
    if (!phoneNumber || !items || items.length === 0) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    // Calculate total and validate products
    let totalAmount = 0;
    const orderItems = [];
    let shopId = null;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Produit ${item.productId} introuvable` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Stock insuffisant pour ${product.name}` });
      }
      
      shopId = product.shopId;
      totalAmount += product.price * item.quantity;
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
    }

    // Generate OTP and order number
    const softOtp = generateOTP();
    const orderNumber = generateOrderNumber();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const order = new Order({
      orderNumber,
      phoneNumber,
      deviceId,
      softOtp,
      otpExpiresAt,
      shopId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: 'pending'
    });

    await order.save();

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

module.exports = router;
