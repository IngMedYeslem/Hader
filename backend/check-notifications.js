const mongoose = require('mongoose');

async function checkNotifications() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    console.log('✅ Connexion MongoDB établie');

    // Lister toutes les collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections disponibles:', collections.map(c => c.name));

    // Vérifier si la collection notifications existe
    const notificationCollection = collections.find(c => c.name === 'notifications');
    if (notificationCollection) {
      console.log('✅ Collection notifications trouvée');
      
      // Compter les notifications
      const count = await mongoose.connection.db.collection('notifications').countDocuments();
      console.log(`📊 Nombre de notifications: ${count}`);
      
      // Afficher les notifications
      const notifications = await mongoose.connection.db.collection('notifications').find().toArray();
      console.log('📋 Notifications:');
      notifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title} - ${notif.body} (${notif.createdAt})`);
      });
    } else {
      console.log('❌ Collection notifications non trouvée');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkNotifications();