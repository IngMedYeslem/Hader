const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const upload = require('./upload');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Route de santé pour vérifier la connectivité
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

mongoose.connect('mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const shopSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  images: String,
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  createdAt: { type: Date, default: Date.now }
});

const Shop = mongoose.model('Shop', shopSchema);
const Product = mongoose.model('Product', productSchema);

// Routes Boutiques
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
    const { name, email, password } = req.body;
    
    // Vérifier si l'email existe déjà
    const existingShop = await Shop.findOne({ email });
    if (existingShop) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    const shop = new Shop({ name, email, password });
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
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (error) {
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

app.listen(3000, () => {
  console.log('Serveur démarré sur le port 3000');
});