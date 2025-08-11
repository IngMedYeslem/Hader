const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Role = require('./models/Role');

async function initAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    console.log('✅ Connexion à MongoDB réussie');

    // Créer les rôles
    const roles = ['ADMIN', 'USER', 'AJOUT-PROD'];
    const createdRoles = {};
    
    for (const roleName of roles) {
      let role = await Role.findOne({ name: roleName });
      if (!role) {
        role = new Role({ name: roleName });
        await role.save();
        console.log(`✅ Rôle ${roleName} créé`);
      }
      createdRoles[roleName] = role;
    }

    // Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Un compte admin existe déjà');
      return;
    }

    // Créer le compte admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      roles: [createdRoles.ADMIN._id, createdRoles.USER._id],
      isApproved: true
    });

    await adminUser.save();
    console.log('✅ Compte administrateur créé avec succès');
    console.log('📧 Username: admin');
    console.log('🔑 Password: admin123');

    // Créer quelques comptes boutiques de test
    const shopRole = createdRoles['AJOUT-PROD'];
    const userRole = createdRoles.USER;

    const testShops = [
      { username: 'boutique1', email: 'boutique1@test.com', approved: false },
      { username: 'boutique2', email: 'boutique2@test.com', approved: true }
    ];

    for (const shop of testShops) {
      const existingShop = await User.findOne({ username: shop.username });
      if (!existingShop) {
        const shopPassword = await bcrypt.hash('123456', 10);
        const shopUser = new User({
          username: shop.username,
          email: shop.email,
          password: shopPassword,
          roles: [shopRole._id, userRole._id],
          isApproved: shop.approved,
          approvedAt: shop.approved ? new Date() : null
        });
        await shopUser.save();
        console.log(`✅ Boutique ${shop.username} créée (${shop.approved ? 'approuvée' : 'en attente'})`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

initAdmin();