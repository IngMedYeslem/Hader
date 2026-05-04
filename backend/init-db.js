const mongoose = require('mongoose');

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/hader', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const shopSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  address: { type: String, required: true },
  phone: { type: String, required: true },
  whatsapp: { type: String, required: true },
  location: {
    latitude: Number,
    longitude: Number
  },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  images: [String],
  videos: [String],
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  createdAt: { type: Date, default: Date.now }
});

const Shop = mongoose.model('Shop', shopSchema);
const Product = mongoose.model('Product', productSchema);

async function initDatabase() {
  try {
    console.log('🔄 Initialisation de la base de données...');
    
    // Créer des boutiques de test
    const shops = await Shop.find();
    if (shops.length === 0) {
      console.log('📦 Création des boutiques de test...');
      
      const testShops = [
        {
          name: 'TechStore Marrakech',
          email: 'tech@marrakech.com',
          password: '123456',
          address: 'Gueliz, Marrakech',
          phone: '+212661234567',
          whatsapp: '+212661234567'
        },
        {
          name: 'Fashion Store Casablanca',
          email: 'fashion@casa.com',
          password: '123456',
          address: 'Maarif, Casablanca',
          phone: '+212662345678',
          whatsapp: '+212662345678'
        },
        {
          name: 'SportWorld Rabat',
          email: 'sport@rabat.com',
          password: '123456',
          address: 'Agdal, Rabat',
          phone: '+212663456789',
          whatsapp: '+212663456789'
        }
      ];
      
      const createdShops = await Shop.insertMany(testShops);
      console.log(`✅ ${createdShops.length} boutiques créées`);
      
      // Créer des produits de test
      console.log('📱 Création des produits de test...');
      
      const testProducts = [
        {
          name: 'iPhone 15 Pro',
          price: 12000,
          images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300'],
          shopId: createdShops[0]._id
        },
        {
          name: 'MacBook Air M2',
          price: 15000,
          images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300'],
          shopId: createdShops[0]._id
        },
        {
          name: 'Robe élégante',
          price: 450,
          images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300'],
          shopId: createdShops[1]._id
        },
        {
          name: 'Chaussures Nike',
          price: 800,
          images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300'],
          shopId: createdShops[2]._id
        },
        {
          name: 'Sac à main cuir',
          price: 650,
          images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300'],
          shopId: createdShops[1]._id
        }
      ];
      
      const createdProducts = await Product.insertMany(testProducts);
      console.log(`✅ ${createdProducts.length} produits créés`);
    } else {
      console.log(`✅ Base de données déjà initialisée (${shops.length} boutiques trouvées)`);
    }
    
    // Afficher un résumé
    const totalShops = await Shop.countDocuments();
    const totalProducts = await Product.countDocuments();
    
    console.log('\n📊 Résumé de la base de données:');
    console.log(`   Boutiques: ${totalShops}`);
    console.log(`   Produits: ${totalProducts}`);
    
    console.log('\n🌐 Serveur prêt à démarrer!');
    console.log('   Utilisez: node server.js');
    
  } catch (error) {
    console.error('❌ Erreur initialisation:', error);
  } finally {
    mongoose.connection.close();
  }
}

initDatabase();