const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const upload = require('./upload');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Route de santé pour vérifier la connectivité
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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

mongoose.connect('mongodb://localhost:27017/ecommerce', {
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
  images: [String], // Tableau d'images
  videos: [String], // Tableau de vidéos
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  createdAt: { type: Date, default: Date.now }
});

const Shop = mongoose.model('Shop', shopSchema);
const Product = mongoose.model('Product', productSchema);

// Routes Boutiques
app.get('/api/shops/:shopId', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId);
    if (shop) {
      res.json(shop);
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
      res.json(shop);
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
    
    // Validation des champs obligatoires
    if (!name || !email || !password || !address || !phone || !whatsapp) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires sauf la localisation' });
    }
    
    // Vérifier si l'email existe déjà
    const existingShop = await Shop.findOne({ email });
    if (existingShop) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    const shopData = { name, email, password, address, phone, whatsapp };
    if (location && location.latitude && location.longitude) {
      shopData.location = location;
    }
    
    const shop = new Shop(shopData);
    await shop.save();
    res.json(shop);
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

app.post('/api/products', async (req, res) => {
  try {
    const { name, price, images, videos, shopId } = req.body;
    
    console.log('=== Début création produit ===');
    console.log('Données reçues:', { name, price, shopId });
    console.log('Nombre d\'images reçues:', images?.length || 0);
    console.log('Nombre de vidéos reçues:', videos?.length || 0);
    
    // S'assurer que images et videos sont des tableaux
    const imageArray = Array.isArray(images) ? images : (images ? [images] : []);
    const videoArray = Array.isArray(videos) ? videos : (videos ? [videos] : []);
    
    // Vérifier le type des images
    imageArray.forEach((img, index) => {
      if (img.startsWith('data:')) {
        console.log(`Image ${index + 1}: Base64 (${img.substring(0, 50)}...)`);
      } else if (img.startsWith('file://')) {
        console.log(`Image ${index + 1}: Fichier local (${img})`);
      } else {
        console.log(`Image ${index + 1}: URL (${img})`);
      }
    });
    
    const product = new Product({
      name,
      price,
      images: imageArray,
      videos: videoArray,
      shopId
    });
    
    const savedProduct = await product.save();
    console.log('Produit sauvegardé avec', savedProduct.images.length, 'images');
    
    res.json(savedProduct);
  } catch (error) {
    console.error('Erreur sauvegarde produit:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/upload-video', upload.single('video'), (req, res) => {
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

app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});