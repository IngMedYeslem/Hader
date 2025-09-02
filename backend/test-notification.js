const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
const notificationService = require('./services/notificationService');

async function testNotification() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion MongoDB établie');

    // Trouver un utilisateur avec le rôle AJOUT-PROD
    const shopRole = await Role.findOne({ name: 'AJOUT-PROD' });
    if (!shopRole) {
      console.log('❌ Rôle AJOUT-PROD non trouvé');
      return;
    }

    const shopUser = await User.findOne({ 
      roles: shopRole._id,
      isApproved: false 
    }).populate('roles', 'name');

    if (!shopUser) {
      console.log('❌ Aucun utilisateur boutique non approuvé trouvé');
      
      // Créer un utilisateur de test
      const testUser = new User({
        username: 'boutique-test',
        email: 'test@boutique.com',
        password: '123456',
        roles: [shopRole._id],
        isApproved: false
      });
      
      await testUser.save();
      console.log('✅ Utilisateur de test créé:', testUser.username);
      
      // Approuver et envoyer notification
      testUser.isApproved = true;
      testUser.approvedAt = new Date();
      await testUser.save();
      
      await notificationService.sendShopValidationNotification(testUser._id, testUser.username);
      console.log('✅ Notification envoyée pour:', testUser.username);
      
    } else {
      console.log('✅ Utilisateur trouvé:', shopUser.username);
      
      // Approuver et envoyer notification
      shopUser.isApproved = true;
      shopUser.approvedAt = new Date();
      await shopUser.save();
      
      await notificationService.sendShopValidationNotification(shopUser._id, shopUser.username);
      console.log('✅ Notification envoyée pour:', shopUser.username);
    }

    // Vérifier les notifications en base
    const notifications = await notificationService.getUserNotifications(shopUser?._id || testUser._id);
    console.log('📱 Notifications en base:', notifications.length);
    notifications.forEach(notif => {
      console.log(`- ${notif.title}: ${notif.body}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
}

testNotification();