const mongoose = require('mongoose');

// Schéma pour stocker les notifications
const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: { type: Object, default: {} },
  read: { type: Boolean, default: false },
  sent: { type: Boolean, default: false }
}, { timestamps: true });

// Vérifier si le modèle existe déjà
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

class NotificationService {
  async sendShopValidationNotification(userId, shopName) {
    try {
      console.log(`🔔 Début envoi notification pour userId: ${userId}, shopName: ${shopName}`);
      
      // Vérifier la connexion MongoDB
      if (mongoose.connection.readyState !== 1) {
        console.error('❌ MongoDB non connecté');
        return;
      }
      
      const User = require('../models/User');
      const user = await User.findById(userId);
      
      if (!user) {
        console.error(`❌ Utilisateur non trouvé pour ID: ${userId}`);
        return;
      }
      
      console.log(`✅ Utilisateur trouvé: ${user.username}`);
      
      // Créer la notification avec try/catch séparé
      try {
        const notificationData = {
          userId: userId,
          title: 'Boutique validée ✅',
          body: `Votre boutique "${shopName}" a été validée par l'administrateur`,
          data: {
            type: 'shop_validated',
            shopName,
            timestamp: new Date().toISOString()
          },
          read: false,
          sent: false
        };
        
        console.log('💾 Données notification:', JSON.stringify(notificationData, null, 2));
        
        const notification = new Notification(notificationData);
        const saved = await notification.save();
        
        console.log(`✅ Notification RÉELLEMENT sauvegardée avec ID: ${saved._id}`);
        
        // Vérification immédiate avec plusieurs méthodes
        const check1 = await Notification.findById(saved._id);
        const check2 = await Notification.find({ userId: new mongoose.Types.ObjectId(userId) });
        const checkAll = await Notification.find();
        
        console.log(`🔍 Vérification par ID: ${check1 ? 'TROUVÉE' : 'NON TROUVÉE'}`);
        console.log(`🔍 Vérification par userId: ${check2.length} notifications`);
        console.log(`🔍 Total notifications en base: ${checkAll.length}`);
        
        if (!check1) {
          console.error('❌ PROBLÈME: Notification sauvegardée mais non retrouvée!');
          console.error('❌ État connexion MongoDB:', mongoose.connection.readyState);
        }
        
        console.log(`Notification sauvegardée pour ${shopName} (${userId})`);
        
      } catch (saveError) {
        console.error('❌ Erreur sauvegarde notification:', saveError);
        console.error('Stack:', saveError.stack);
      }
      
    } catch (error) {
      console.error('❌ Erreur générale notification:', error);
    }
  }
  
  async getUserNotifications(userId) {
    try {
      console.log(`💾 Service: Recherche notifications pour userId: ${userId}`);
      
      // Vérifier d'abord toutes les notifications
      const allNotifications = await Notification.find();
      console.log(`📊 Total notifications en base: ${allNotifications.length}`);
      
      // Vérifier si userId est un ObjectId valide
      let query;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        query = { userId: new mongoose.Types.ObjectId(userId) };
      } else {
        // Si ce n'est pas un ObjectId, chercher par string
        query = { userId: userId };
      }
      
      const notifications = await Notification.find(query).sort({ createdAt: -1 });
      console.log(`📨 Service: Trouvé ${notifications.length} notifications pour ${userId}`);
      
      return notifications;
    } catch (error) {
      console.error('❌ Service: Erreur récupération notifications:', error);
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
}

module.exports = new NotificationService();