const express = require('express');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const router = express.Router();
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, default: 'shop_validated' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  data: { type: Object, default: {} },
  read: { type: Boolean, default: false },
  sent: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

// Récupérer les notifications d'un utilisateur
router.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📨 Récupération notifications pour userId: ${userId}`);
    
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    console.log(`✅ ${notifications.length} notifications trouvées`);
    
    res.json(notifications);
  } catch (error) {
    console.error('❌ Erreur récupération notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Marquer une notification comme lue
router.put('/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur marquage notification:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;