const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { upload, processUploads } = require('./upload');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');
const Role = require('./models/Role');
const { convertVideoFromBase64 } = require('./videoConverter');
const notificationService = require('./services/notificationService');
const notificationRoutes = require('./routes/notifications');
const reactivationRoutes = require('./routes/reactivation');
const shopRoutes = require('./routes/shops');
const productRoutes = require('./routes/products');

// Fonction pour envoyer des notifications push Expo
async function sendExpoPushNotification(expoPushToken, { title, body, data }) {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data
    };
    
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });
    
    const result = await response.json();
    console.log('📤 Résultat notification Expo:', result);
  } catch (error) {
    console.error('❌ Erreur notification Expo:', error);
  }
}

// Le modèle Shop est déjà défini plus bas

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Routes de notifications
app.use('/api', notificationRoutes);
app.use('/api', reactivationRoutes);
app.use('/api', shopRoutes);
app.use('/api/products', productRoutes);

// Middleware de debug pour upload
const debugUpload = (req, res, next) => {
  console.log('🔍 DEBUG UPLOAD:');
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Content-Length:', req.get('Content-Length'));
  
  let totalSize = 0;
  req.on('data', chunk => {
    totalSize += chunk.length;
  });
  
  req.on('end', () => {
    console.log('📊 Total données reçues:', totalSize, 'bytes');
  });
  
  next();
};

app.use('/api/upload-media', debugUpload);

// Route d'upload média
const uploadRoutes = require('./routes/upload');
app.use('/api', uploadRoutes);

// Configuration des headers pour les fichiers statiques
app.use('/uploads', (req, res, next) => {
  // Headers pour les images
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    res.setHeader('Content-Type', req.path.endsWith('.jpg') || req.path.endsWith('.jpeg') ? 'image/jpeg' : 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  next();
}, express.static('uploads'));

// Route spécifique pour les vidéos avec streaming mobile optimisé
app.get('/uploads/*.mp4', (req, res) => {
  const videoPath = path.join(__dirname, req.path);
  if (!fs.existsSync(videoPath)) {
    return res.status(404).send('Vidéo non trouvée');
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Headers communs pour mobile
  const commonHeaders = {
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Range, Content-Range',
    'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length'
  };

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 1024 * 1024, fileSize - 1); // Chunks de 1MB max
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    
    res.writeHead(206, {
      ...commonHeaders,
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Content-Length': chunksize
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      ...commonHeaders,
      'Content-Length': fileSize
    });
    fs.createReadStream(videoPath).pipe(res);
  }
});



// Route de login admin
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Créer automatiquement le premier admin s'il n'existe pas
    if (username === 'admin' && password === 'admin123') {
      let adminUser = await User.findOne({ username: 'admin' });
      
      if (!adminUser) {
        // Créer les rôles
        let adminRole = await Role.findOne({ name: 'ADMIN' });
        if (!adminRole) {
          adminRole = new Role({ name: 'ADMIN' });
          await adminRole.save();
        }
        
        let userRole = await Role.findOne({ name: 'USER' });
        if (!userRole) {
          userRole = new Role({ name: 'USER' });
          await userRole.save();
        }

        // Créer le compte admin
        adminUser = new User({
          username: 'admin',
          email: 'admin@example.com',
          password: 'admin123',
          roles: [adminRole._id, userRole._id],
          isApproved: true
        });
        await adminUser.save();
        console.log('✅ Compte admin créé automatiquement');
      }
      
      return res.json({
        success: true,
        user: {
          username: 'admin',
          email: 'admin@example.com',
          roles: ['ADMIN', 'USER']
        }
      });
    }
    
    const user = await User.findOne({ username }).populate('roles', 'name');
    
    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    // Comparaison simple du mot de passe (temporaire)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const roles = user.roles.map(role => role.name);
    const isAdmin = roles.includes('ADMIN');
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Accès refusé : droits administrateur requis' });
    }

    res.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        roles: roles
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes d'administration - Gestion des comptes utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find()
      .populate('roles', 'name')
      .populate('approvedBy', 'username')
      .populate('linkedShopId', 'name email');
    
    const formattedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles.map(role => role.name),
      isApproved: user.isApproved,
      isRejected: user.isRejected,
      rejectionReason: user.rejectionReason,
      approvedAt: user.approvedAt,
      rejectedAt: user.rejectedAt,
      approvedBy: user.approvedBy?.username,
      linkedShop: user.linkedShopId ? {
        id: user.linkedShopId._id,
        name: user.linkedShopId.name,
        email: user.linkedShopId.email
      } : null
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/:userId/approve', async (req, res) => {
  try {
    console.log(`🔔 Approbation utilisateur ID: ${req.params.userId}`);
    
    const user = await User.findById(req.params.userId).populate('roles', 'name').populate('linkedShopId', 'name');
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    console.log(`✅ Utilisateur trouvé: ${user.username}`);
    console.log(`🏠 LinkedShopId: ${user.linkedShopId ? user.linkedShopId._id : 'AUCUN'}`);
    console.log(`🏠 Nom boutique: ${user.linkedShopId ? user.linkedShopId.name : 'AUCUN'}`);

    user.isApproved = true;
    user.isRejected = false;
    user.approvedAt = new Date();
    await user.save();

    // Envoyer notification push
    if (user.linkedShopId) {
      console.log(`🔔 Envoi notification pour boutique: ${user.linkedShopId.name}`);
      
      // Sauvegarder en base
      await notificationService.sendShopValidationNotification(user._id, user.linkedShopId.name);
      
      // Envoyer notification push Expo si token disponible
      if (user.expoPushToken && user.expoPushToken.startsWith('ExponentPushToken')) {
        await sendExpoPushNotification(user.expoPushToken, {
          title: 'Boutique validée ✅',
          body: `Votre boutique "${user.linkedShopId.name}" a été validée`,
          data: { type: 'shop_validated', shopName: user.linkedShopId.name }
        });
      }
      
      console.log('✅ Notification envoyée');
    } else {
      console.log('⚠️ Pas de boutique liée - aucune notification envoyée');
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles.map(role => role.name),
      isApproved: user.isApproved,
      approvedAt: user.approvedAt
    });
  } catch (error) {
    console.error('❌ Erreur approbation:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/:userId/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    user.isRejected = true;
    user.rejectionReason = reason || 'Compte rejeté par l\'administrateur';
    user.rejectedAt = new Date();
    await user.save();

    res.json({ message: `Utilisateur ${user.username} rejeté` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: `Utilisateur ${user.username} supprimé` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour convertir une boutique en compte utilisateur
app.post('/api/shops/:shopId/convert-to-user', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Boutique non trouvée' });
    }

    // Vérifier si un utilisateur avec ce nom existe déjà
    const existingUser = await User.findOne({ username: shop.name });
    if (existingUser) {
      return res.status(400).json({ error: 'Un utilisateur avec ce nom existe déjà' });
    }

    // Créer les rôles nécessaires
    let shopRole = await Role.findOne({ name: 'AJOUT-PROD' });
    if (!shopRole) {
      shopRole = new Role({ name: 'AJOUT-PROD' });
      await shopRole.save();
    }
    
    let userRole = await Role.findOne({ name: 'USER' });
    if (!userRole) {
      userRole = new Role({ name: 'USER' });
      await userRole.save();
    }

    // Créer le compte utilisateur
    const newUser = new User({
      username: shop.name,
      email: shop.email,
      password: '123456',
      roles: [shopRole._id, userRole._id],
      isApproved: false,
      linkedShopId: shop._id
    });
    
    await newUser.save();
    
    res.json({ 
      message: `Boutique ${shop.name} convertie en compte utilisateur`,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        roles: ['AJOUT-PROD', 'USER']
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer les boutiques
app.get('/api/shops', async (req, res) => {
  try {
    const shops = await Shop.find();
    res.json(shops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour lier un utilisateur à une boutique
app.post('/api/users/:userId/link-shop/:shopId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Boutique non trouvée' });
    }

    // Ajouter l'ID de la boutique à l'utilisateur
    user.linkedShopId = req.params.shopId;
    await user.save();

    res.json({ message: `Utilisateur ${user.username} lié à la boutique ${shop.name}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour enregistrer le token Expo
app.post('/api/users/expo-token', async (req, res) => {
  try {
    const { userId, expoPushToken } = req.body;
    
    // Chercher par userId d'abord, puis par linkedShopId
    let user = await User.findById(userId);
    if (!user) {
      user = await User.findOne({ linkedShopId: userId });
    }
    
    if (!user) {
      console.log('Utilisateur non trouvé pour ID:', userId);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    user.expoPushToken = expoPushToken;
    await user.save();
    
    console.log('Token Expo enregistré pour utilisateur:', user.username);
    res.json({ message: 'Token Expo enregistré' });
  } catch (error) {
    console.error('Erreur enregistrement token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer les notifications en attente
app.get('/api/users/:userId/notifications', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`📱 API: Récupération notifications pour userId: ${userId}`);
    const notifications = await notificationService.getUserNotifications(userId);
    console.log(`📨 API: Trouvé ${notifications.length} notifications`);
    res.json(notifications);
  } catch (error) {
    console.error('❌ API: Erreur notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour tester les notifications
app.get('/api/test/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔍 Test récupération pour userId: ${userId}`);
    
    const notifications = await notificationService.getUserNotifications(userId);
    
    res.json({
      userId,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('❌ Erreur test notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour délier un utilisateur d'une boutique
app.delete('/api/users/:userId/unlink-shop', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    user.linkedShopId = null;
    await user.save();

    res.json({ message: `Utilisateur ${user.username} délié de sa boutique` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Route de santé pour vérifier la connectivité
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Route de debug pour créer des comptes de test
app.post('/api/debug/create-test-users', async (req, res) => {
  try {
    // Créer les rôles
    const roles = ['ADMIN', 'USER', 'AJOUT-PROD'];
    const createdRoles = {};
    
    for (const roleName of roles) {
      let role = await Role.findOne({ name: roleName });
      if (!role) {
        role = new Role({ name: roleName });
        await role.save();
      }
      createdRoles[roleName] = role;
    }

    // Créer des comptes boutiques de test
    const shopRole = createdRoles['AJOUT-PROD'];
    const userRole = createdRoles.USER;

    const testShops = [
      { username: 'boutique1', email: 'boutique1@test.com', password: '123456', approved: false },
      { username: 'boutique2', email: 'boutique2@test.com', password: '123456', approved: true },
      { username: 'boutique3', email: 'boutique3@test.com', password: '123456', approved: false }
    ];

    const createdUsers = [];
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
        createdUsers.push(shop.username);
      }
    }

    res.json({ 
      message: 'Comptes de test créés', 
      users: createdUsers,
      totalUsers: await User.countDocuments()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour convertir les boutiques en comptes utilisateurs
app.post('/api/debug/convert-shops-to-users', async (req, res) => {
  try {
    // Récupérer toutes les boutiques
    const shops = await Shop.find();
    
    // Créer les rôles nécessaires
    let shopRole = await Role.findOne({ name: 'AJOUT-PROD' });
    if (!shopRole) {
      shopRole = new Role({ name: 'AJOUT-PROD' });
      await shopRole.save();
    }
    
    let userRole = await Role.findOne({ name: 'USER' });
    if (!userRole) {
      userRole = new Role({ name: 'USER' });
      await userRole.save();
    }

    const convertedUsers = [];
    
    for (const shop of shops) {
      // Vérifier si un utilisateur avec ce nom existe déjà
      const existingUser = await User.findOne({ username: shop.name });
      
      if (!existingUser) {
        // Créer un compte utilisateur pour cette boutique
        const newUser = new User({
          username: shop.name,
          email: shop.email,
          password: '123456', // Mot de passe par défaut
          roles: [shopRole._id, userRole._id],
          isApproved: false, // En attente d'approbation
          linkedShopId: shop._id
        });
        
        await newUser.save();
        convertedUsers.push(shop.name);
      }
    }
    
    res.json({
      message: `${convertedUsers.length} boutiques converties en comptes utilisateurs`,
      convertedShops: convertedUsers,
      totalShops: shops.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour créer un admin
app.post('/api/admin/create', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet utilisateur existe déjà' });
    }

    // Créer les rôles si nécessaire
    let adminRole = await Role.findOne({ name: 'ADMIN' });
    if (!adminRole) {
      adminRole = new Role({ name: 'ADMIN' });
      await adminRole.save();
    }
    
    let userRole = await Role.findOne({ name: 'USER' });
    if (!userRole) {
      userRole = new Role({ name: 'USER' });
      await userRole.save();
    }

    // Créer le compte admin
    const adminUser = new User({
      username,
      email,
      password,
      roles: [adminRole._id, userRole._id],
      isApproved: true
    });

    await adminUser.save();
    
    res.json({ 
      message: `Compte admin ${username} créé avec succès`,
      user: {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        roles: ['ADMIN', 'USER']
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route de débogage pour vérifier les produits en base
app.get('/api/debug/products', async (req, res) => {
  try {
    const products = await Product.find();
    console.log('Produits en base:', products.length);
    products.forEach(p => {
      console.log(`Produit ${p.name}: ${p.images?.length || 0} images`);
      console.log('Images:', p.images);
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour corriger les URLs des produits existants
app.post('/api/debug/fix-urls', async (req, res) => {
  try {
    const products = await Product.find();
    let updatedCount = 0;
    
    for (const product of products) {
      let updated = false;
      
      // Corriger les URLs d'images
      if (product.images) {
        product.images = product.images.map(img => {
          if (img.includes('localhost:3000') || img.includes('192.168.0.138:3000') || img.includes('192.168.1.126:3000')) {
            updated = true;
            return img.replace(/http:\/\/[^:]+:3000/, 'http://192.168.0.138:3000');
          }
          return img;
        });
      }
      
      // Corriger les URLs de vidéos et ajouter .mp4 si manquant
      if (product.videos) {
        product.videos = product.videos.map(vid => {
          let correctedVid = vid;
          if (vid.includes('localhost:3000') || vid.includes('192.168.0.138:3000') || vid.includes('192.168.1.126:3000')) {
            updated = true;
            correctedVid = vid.replace(/http:\/\/[^:]+:3000/, 'http://192.168.0.138:3000');
          }
          // Ajouter .mp4 si manquant
          if (correctedVid.includes('/uploads/vid_') && !correctedVid.endsWith('.mp4')) {
            correctedVid += '.mp4';
            updated = true;
          }
          return correctedVid;
        });
      }
      
      if (updated) {
        await product.save();
        updatedCount++;
        console.log(`Produit ${product.name} mis à jour`);
      }
    }
    
    res.json({ 
      message: `${updatedCount} produits mis à jour avec les nouvelles URLs`,
      totalProducts: products.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

mongoose.connect('mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('✅ Connexion MongoDB établie');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur MongoDB:', err);
});

const Shop = require('./models/Shop');
const Product = require('./models/Product');

// Route pour récupérer les notifications d'un utilisateur
app.get('/api/users/:userId/notifications', async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await notificationService.getUserNotifications(userId);
    res.json(notifications);
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    res.status(500).json({ error: error.message });
  }
});



// Routes Boutiques
app.get('/api/shops/:shopId', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId);
    if (shop) {
      // Vérifier le statut d'approbation via le compte utilisateur lié
      const user = await User.findOne({ linkedShopId: req.params.shopId }).populate('roles', 'name');
      
      res.json({
        ...shop.toObject(),
        isApproved: user ? user.isApproved : false,
        approvedAt: user ? user.approvedAt : null,
        userRoles: user ? user.roles.map(role => role.name) : []
      });
    } else {
      res.status(404).json({ error: 'Boutique non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/shops/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const shop = await Shop.findOne({ email, password });
    if (shop) {
      // Vérifier le statut d'approbation
      const user = await User.findOne({ linkedShopId: shop._id }).populate('roles', 'name');
      
      // Permettre la connexion même si non approuvée
      res.json({
        ...shop.toObject(),
        isApproved: user ? user.isApproved : false,
        isRejected: user ? user.isRejected : false,
        rejectionReason: user ? user.rejectionReason : null,
        approvedAt: user ? user.approvedAt : null,
        userRoles: user ? user.roles.map(role => role.name) : []
      });
    } else {
      res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/shops/register', async (req, res) => {
  try {
    const { name, email, password, address, phone, whatsapp, location } = req.body;
    
    console.log('=== INSCRIPTION BOUTIQUE ===');
    console.log('Données reçues:', { name, email, address, phone, whatsapp });
    console.log('Location reçue:', location);
    console.log('Type de location:', typeof location);
    if (location) {
      console.log('Latitude:', location.latitude, 'Type:', typeof location.latitude);
      console.log('Longitude:', location.longitude, 'Type:', typeof location.longitude);
    }
    
    // Validation des champs obligatoires
    if (!name || !email || !password || !address || !phone || !whatsapp) {
      console.log('ERREUR: Champs manquants');
      return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }
    
    // Validation stricte de la localisation
    if (!location) {
      console.log('ERREUR: Pas de location');
      return res.status(400).json({ error: 'La localisation est obligatoire pour créer une boutique' });
    }
    
    if (location.latitude === undefined || location.latitude === null || location.latitude === '') {
      console.log('ERREUR: Latitude manquante ou vide');
      return res.status(400).json({ error: 'La latitude est obligatoire' });
    }
    
    if (location.longitude === undefined || location.longitude === null || location.longitude === '') {
      console.log('ERREUR: Longitude manquante ou vide');
      return res.status(400).json({ error: 'La longitude est obligatoire' });
    }
    
    if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      console.log('ERREUR: Coordonnées pas numériques');
      return res.status(400).json({ error: 'Les coordonnées doivent être des nombres' });
    }
    
    if (isNaN(location.latitude) || isNaN(location.longitude)) {
      console.log('ERREUR: Coordonnées NaN');
      return res.status(400).json({ error: 'Les coordonnées doivent être des nombres valides' });
    }
    
    // Vérifier que les coordonnées sont dans des plages valides
    if (location.latitude < -90 || location.latitude > 90 || location.longitude < -180 || location.longitude > 180) {
      console.log('ERREUR: Coordonnées hors limites');
      return res.status(400).json({ error: 'Coordonnées GPS invalides' });
    }
    
    console.log('Validation OK, création de la boutique...');
    
    // Vérifier si l'email existe déjà
    const existingShop = await Shop.findOne({ email });
    if (existingShop) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    // Créer la boutique
    const shopData = { 
      name, 
      email, 
      password, 
      address, 
      phone, 
      whatsapp,
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    };
    
    const shop = new Shop(shopData);
    await shop.save();
    
    // Créer automatiquement un compte utilisateur pour cette boutique
    let shopRole = await Role.findOne({ name: 'AJOUT-PROD' });
    if (!shopRole) {
      shopRole = new Role({ name: 'AJOUT-PROD' });
      await shopRole.save();
    }
    
    let userRole = await Role.findOne({ name: 'USER' });
    if (!userRole) {
      userRole = new Role({ name: 'USER' });
      await userRole.save();
    }

    const user = new User({
      username: name,
      email: email,
      password: password,
      roles: [shopRole._id, userRole._id],
      isApproved: false, // En attente d'approbation
      linkedShopId: shop._id
    });
    
    await user.save();
    
    res.json({ 
      shop: shop,
      message: 'Boutique créée avec succès. En attente d\'approbation par un administrateur.'
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Cet email est déjà utilisé' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Routes Produits
app.get('/api/products/:shopId', async (req, res) => {
  try {
    const products = await Product.find({ shopId: req.params.shopId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour mettre à jour un produit
app.put('/api/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, price, category, stock, images, videos } = req.body;
    
    console.log('=== Mise à jour produit ===');
    console.log('ID produit:', productId);
    console.log('Données reçues:', { name, description, price, category, stock });
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    // Mettre à jour les champs
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;
    
    if (images) product.images = images;
    if (videos) product.videos = videos;
    
    const updatedProduct = await product.save();
    console.log('Produit mis à jour:', updatedProduct.name);
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Erreur mise à jour produit:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, category, stock, images, videos, shopId } = req.body;
    
    console.log('=== Création produit ===');
    console.log('Données:', { name, price, shopId });
    console.log('URLs images:', images?.length || 0);
    console.log('URLs vidéos:', videos?.length || 0);
    
    // Valider que ce sont bien des URLs et non du base64
    const validImages = (images || []).filter(img => {
      if (img.startsWith('data:')) {
        console.log('⚠️ Image base64 détectée, ignorée');
        return false;
      }
      return img.startsWith('http') || img.startsWith('/uploads/');
    });
    
    const validVideos = (videos || []).filter(vid => {
      if (vid.startsWith('data:')) {
        console.log('⚠️ Vidéo base64 détectée, ignorée');
        return false;
      }
      return vid.startsWith('http') || vid.startsWith('/uploads/');
    });
    
    const product = new Product({
      name,
      description,
      price,
      category,
      stock: stock || 0,
      images: validImages,
      videos: validVideos,
      shopId
    });
    
    const savedProduct = await product.save();
    console.log('✅ Produit sauvegardé avec', savedProduct.images.length, 'URLs images et', savedProduct.videos.length, 'URLs vidéos');
    
    res.json(savedProduct);
  } catch (error) {
    console.error('❌ Erreur sauvegarde produit:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload', upload.single('image'), processUploads, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload-video', upload.single('video'), processUploads, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune vidéo uploadée' });
    }
    res.json({ videoUrl: `/uploads/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour supprimer un média d'un produit
app.delete('/api/products/:productId/media', async (req, res) => {
  try {
    const { productId } = req.params;
    const { mediaType, mediaIndex } = req.body;
    
    console.log(`Suppression ${mediaType}[${mediaIndex}] du produit ${productId}`);
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    if (mediaType === 'images' && product.images && product.images[mediaIndex]) {
      product.images.splice(mediaIndex, 1);
    } else if (mediaType === 'videos' && product.videos && product.videos[mediaIndex]) {
      product.videos.splice(mediaIndex, 1);
    } else {
      return res.status(400).json({ error: 'Média non trouvé' });
    }
    
    await product.save();
    console.log(`Média supprimé. Reste ${product.images?.length || 0} images et ${product.videos?.length || 0} vidéos`);
    
    res.json({ 
      message: 'Média supprimé avec succès',
      product: product
    });
  } catch (error) {
    console.error('Erreur suppression média:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour supprimer un produit complet
app.delete('/api/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    console.log(`=== Suppression produit ${productId} ===`);
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    // Supprimer les fichiers médias du serveur
    if (product.images) {
      product.images.forEach(imageUrl => {
        if (imageUrl.includes('/uploads/')) {
          const filename = imageUrl.split('/uploads/')[1];
          const filePath = path.join(__dirname, 'uploads', filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Image supprimée: ${filename}`);
          }
        }
      });
    }
    
    if (product.videos) {
      product.videos.forEach(videoUrl => {
        if (videoUrl.includes('/uploads/')) {
          const filename = videoUrl.split('/uploads/')[1];
          const filePath = path.join(__dirname, 'uploads', filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Vidéo supprimée: ${filename}`);
          }
        }
      });
    }
    
    // Supprimer le produit de la base de données
    await Product.findByIdAndDelete(productId);
    
    console.log(`Produit ${product.name} supprimé avec succès`);
    
    res.json({ 
      success: true,
      message: `Produit "${product.name}" supprimé avec succès`
    });
  } catch (error) {
    console.error('Erreur suppression produit:', error);
    res.status(500).json({ error: error.message });
  }
});



app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
  console.log('API REST disponible sur http://localhost:3000/api');
});