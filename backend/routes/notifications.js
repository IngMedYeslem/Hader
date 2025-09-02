const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Route pour marquer une notification comme lue
router.put('/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const mongoose = require('mongoose');
    const notificationSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      title: { type: String, required: true },
      body: { type: String, required: true },
      data: { type: Object, default: {} },
      read: { type: Boolean, default: false },
      sent: { type: Boolean, default: false }
    }, { timestamps: true });
    
    const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
    
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur marquage notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Envoyer notification push via Expo
router.post('/send', async (req, res) => {
  try {
    const { userId, title, body, data = {} } = req.body;
    
    const user = await User.findById(userId);
    if (!user || !user.expoPushToken) {
      return res.status(404).json({ error: 'Token Expo non trouvé' });
    }

    const message = {
      to: user.expoPushToken,
      title,
      body,
      data,
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) throw new Error('Erreur Expo Push');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur notification:', error);
    res.status(500).json({ error: 'Erreur envoi notification' });
  }
});

module.exports = router;