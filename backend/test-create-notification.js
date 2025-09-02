const mongoose = require('mongoose');
const notificationService = require('./services/notificationService');

async function testCreateNotification() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connecté à MongoDB');
    
    const targetUserId = '68b4becec913b09d6199ff62';
    const shopName = 'Test Boutique';
    
    console.log(`🔔 Test création notification pour userId: ${targetUserId}`);
    
    // Créer une notification de test
    await notificationService.sendShopValidationNotification(targetUserId, shopName);
    
    // Vérifier immédiatement
    const notifications = await notificationService.getUserNotifications(targetUserId);
    console.log(`📨 Notifications trouvées après création: ${notifications.length}`);
    
    if (notifications.length > 0) {
      console.log('✅ Notification créée avec succès !');
      notifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title}: ${notif.body}`);
      });
    } else {
      console.log('❌ Aucune notification trouvée après création');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

testCreateNotification();