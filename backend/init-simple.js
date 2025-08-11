const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');

async function initData() {
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

    // Créer quelques comptes boutiques de test
    const shopRole = createdRoles['AJOUT-PROD'];
    const userRole = createdRoles.USER;

    const testShops = [
      { username: 'boutique1', email: 'boutique1@test.com', password: '123456', approved: false },
      { username: 'boutique2', email: 'boutique2@test.com', password: '123456', approved: true },
      { username: 'boutique3', email: 'boutique3@test.com', password: '123456', approved: false }
    ];

    for (const shop of testShops) {
      const existingShop = await User.findOne({ username: shop.username });
      if (!existingShop) {
        const shopUser = new User({
          username: shop.username,
          email: shop.email,
          password: shop.password,
          roles: [shopRole._id, userRole._id],
          isApproved: shop.approved,
          approvedAt: shop.approved ? new Date() : null
        });
        await shopUser.save();
        console.log(`✅ Boutique ${shop.username} créée (${shop.approved ? 'approuvée' : 'en attente'})`);
      }
    }

    // Créer quelques boutiques de test
    const testShopsData = [
      { name: 'Tech Store', email: 'tech@store.com', address: 'Casablanca', phone: '+212661234567', whatsapp: '+212661234567' },
      { name: 'Fashion Shop', email: 'fashion@shop.com', address: 'Rabat', phone: '+212662345678', whatsapp: '+212662345678' }
    ];

    for (const shopData of testShopsData) {
      const existingShop = await mongoose.connection.db.collection('shops').findOne({ name: shopData.name });
      if (!existingShop) {
        await mongoose.connection.db.collection('shops').insertOne(shopData);
        console.log(`✅ Boutique ${shopData.name} créée`);
      }
    }

    console.log('🔑 Compte admin: admin / admin123');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

initData();