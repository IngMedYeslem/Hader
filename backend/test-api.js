const mongoose = require('mongoose');
const notificationService = require('./services/notificationService');

async function testAPI() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hader');
    console.log('✅ Connexion MongoDB établie');

    const userId = '68b4b4ed9123f8409ffa6d20';
    console.log(`🔍 Test pour userId: ${userId}`);
    
    const notifications = await notificationService.getUserNotifications(userId);
    console.log(`📨 Résultat: ${notifications.length} notifications`);
    
    notifications.forEach(notif => {
      console.log(`- ${notif.title}: ${notif.body}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testAPI();