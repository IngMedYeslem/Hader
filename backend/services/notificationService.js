const mongoose = require('mongoose');

// Schéma pour stocker les notifications
const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, enum: ['shop_validated', 'new_order', 'low_stock', 'review', 'product_approval', 'product_rejection', 'order_update'], default: 'shop_validated' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  data: { type: Object, default: {} },
  read: { type: Boolean, default: false },
  sent: { type: Boolean, default: false }
}, { timestamps: true });

// Vérifier si le modèle existe déjà
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

class NotificationService {
  async sendShopValidationNotification(userId, shopName) {
    try {
      console.log(`🔔 Envoi notification pour userId: ${userId}, shopName: ${shopName}`);
      
      if (mongoose.connection.readyState !== 1) {
        console.error('❌ MongoDB non connecté');
        return;
      }
      
      const notificationData = {
        userId: userId.toString(),
        title: 'Boutique validée ✅',
        body: `Votre boutique "${shopName}" a été validée`,
        type: 'shop_validated',
        data: { type: 'shop_validated', shopName },
        read: false
      };
      
      const notification = new Notification(notificationData);
      await notification.save();
      console.log(`✅ Notification sauvegardée`);
      
    } catch (error) {
      console.error('❌ Erreur notification:', error);
    }
  }
  
  async getUserNotifications(userId) {
    try {
      const notifications = await Notification.find({ userId: userId.toString() }).sort({ createdAt: -1 });
      console.log(`📨 ${notifications.length} notifications pour ${userId}`);
      return notifications;
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      return [];
    }
  }
  
  async markAsRead(notificationId) {
    try {
      await Notification.findByIdAndUpdate(notificationId, { read: true });
    } catch (error) {
      console.error('Erreur marquage lu:', error);
    }
  }
  
  async sendOrderNotification(shopId, orderId, orderNumber) {
    try {
      const notification = new Notification({
        userId: shopId,
        title: 'Nouvelle commande 🛒',
        body: `Commande #${orderNumber} reçue`,
        type: 'new_order',
        orderId,
        data: { orderNumber }
      });
      await notification.save();
    } catch (error) {
      console.error('Erreur notification commande:', error);
    }
  }
  
  async sendLowStockNotification(shopId, productId, productName, stock) {
    try {
      const notification = new Notification({
        userId: shopId,
        title: 'Stock faible ⚠️',
        body: `${productName} - Stock: ${stock}`,
        type: 'low_stock',
        productId,
        data: { productName, stock }
      });
      await notification.save();
    } catch (error) {
      console.error('Erreur notification stock:', error);
    }
  }
  
  async sendOrderStatusNotification(userId, orderId, title, body) {
    try {
      const notification = new Notification({
        userId: userId.toString(),
        title,
        body,
        type: 'order_update',
        orderId,
        data: { orderId }
      });
      await notification.save();
    } catch (error) {
      console.error('Erreur notification statut commande:', error);
    }
  }

  async sendReviewNotification(shopId, productId, rating) {
    try {
      const notification = new Notification({
        userId: shopId,
        title: 'Nouvel avis ⭐',
        body: `Note: ${rating}/5`,
        type: 'review',
        productId,
        data: { rating }
      });
      await notification.save();
    } catch (error) {
      console.error('Erreur notification avis:', error);
    }
  }
}

module.exports = new NotificationService();