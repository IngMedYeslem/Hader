const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Données de test en mémoire
const mockShops = [
  {
    _id: '1',
    name: 'TechStore Marrakech',
    email: 'tech@marrakech.com',
    address: 'Gueliz, Marrakech',
    phone: '+212661234567',
    whatsapp: '+212661234567'
  },
  {
    _id: '2',
    name: 'Fashion Store Casablanca',
    email: 'fashion@casa.com',
    address: 'Maarif, Casablanca',
    phone: '+212662345678',
    whatsapp: '+212662345678'
  },
  {
    _id: '3',
    name: 'SportWorld Rabat',
    email: 'sport@rabat.com',
    address: 'Agdal, Rabat',
    phone: '+212663456789',
    whatsapp: '+212663456789'
  }
];

const mockProducts = [
  // TechStore Marrakech
  { _id: '1', name: 'iPhone 15 Pro', price: 12000, images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300'], videos: ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'], shopId: '1' },
  { _id: '2', name: 'MacBook Air M2', price: 15000, images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300'], videos: [], shopId: '1' },
  { _id: '3', name: 'iPad Pro', price: 8500, images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300'], videos: ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'], shopId: '1' },
  { _id: '4', name: 'AirPods Pro', price: 2200, images: ['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300'], shopId: '1' },
  
  // Fashion Store Casablanca
  { _id: '5', name: 'Robe élégante', price: 450, images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300'], shopId: '2' },
  { _id: '6', name: 'Sac à main cuir', price: 650, images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300'], shopId: '2' },
  { _id: '7', name: 'Veste en jean', price: 380, images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300'], shopId: '2' },
  { _id: '8', name: 'Chaussures talons', price: 520, images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300'], shopId: '2' },
  
  // SportWorld Rabat
  { _id: '9', name: 'Chaussures Nike', price: 800, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300'], shopId: '3' },
  { _id: '10', name: 'Maillot de foot', price: 120, images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300'], shopId: '3' },
  { _id: '11', name: 'Raquette tennis', price: 450, images: ['https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=300'], shopId: '3' },
  { _id: '12', name: 'Sac de sport', price: 180, images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300'], shopId: '3' },
  
  // Produits supplémentaires TechStore
  { _id: '13', name: 'Apple Watch', price: 3200, images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300'], shopId: '1' },
  { _id: '14', name: 'Casque Beats', price: 1800, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'], shopId: '1' },
  
  // Produits supplémentaires Fashion Store
  { _id: '15', name: 'Pantalon jean', price: 280, images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=300'], shopId: '2' },
  { _id: '16', name: 'Collier doré', price: 150, images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300'], shopId: '2' },
  
  // Produits supplémentaires SportWorld
  { _id: '17', name: 'Ballon football', price: 85, images: ['https://images.unsplash.com/photo-1614632537190-23e4b2e69c88?w=300'], shopId: '3' },
  { _id: '18', name: 'Gants boxe', price: 220, images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300'], shopId: '3' }
];

// Routes API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/debug/products', (req, res) => {
  console.log('📊 Récupération de tous les produits:', mockProducts.length);
  res.json(mockProducts);
});

app.get('/api/shops/:shopId', (req, res) => {
  const shop = mockShops.find(s => s._id === req.params.shopId);
  if (shop) {
    res.json(shop);
  } else {
    res.status(404).json({ error: 'Boutique non trouvée' });
  }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌟 Serveur simple démarré sur http://0.0.0.0:${PORT}`);
  console.log(`📊 API disponible sur http://192.168.100.121:${PORT}/api`);
  console.log(`🔍 Debug produits: http://192.168.100.121:${PORT}/api/debug/products`);
  console.log(`📦 ${mockProducts.length} produits disponibles`);
  console.log(`🏪 ${mockShops.length} boutiques disponibles`);
});