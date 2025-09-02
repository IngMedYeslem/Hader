const mongoose = require('mongoose');

async function checkNotifications() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    console.log('✅ Connecté à MongoDB');
    
    // Récupérer le modèle Notification
    const notificationSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      title: { type: String, required: true },
      body: { type: String, required: true },
      data: { type: Object, default: {} },
      read: { type: Boolean, default: false },
      sent: { type: Boolean, default: false }
    }, { timestamps: true });
    
    const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
    
    // Chercher toutes les notifications
    const allNotifications = await Notification.find();
    console.log(`📨 Total notifications en base: ${allNotifications.length}`);
    
    allNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ID: ${notif._id}`);
      console.log(`   UserId: ${notif.userId}`);
      console.log(`   Title: ${notif.title}`);
      console.log(`   Read: ${notif.read}`);
      console.log(`   CreatedAt: ${notif.createdAt}`);
      console.log('---');
    });
    
    // Chercher spécifiquement pour l'utilisateur
    const userId = '68b4c64409541cf567ad7765';
    const userNotifications = await Notification.find({ userId: new mongoose.Types.ObjectId(userId) });
    console.log(`📨 Notifications pour ${userId}: ${userNotifications.length}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkNotifications();