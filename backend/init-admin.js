const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schémas
const roleSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: String,
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  isApproved: { type: Boolean, default: false },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Role = mongoose.model('Role', roleSchema);
const User = mongoose.model('User', userSchema);

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

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

initAdmin();