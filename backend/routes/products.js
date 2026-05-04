const express = require('express');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const router = express.Router();

// Récupérer tous les produits publics (catalogue public)
router.get('/public', async (req, res) => {
  try {
    const products = await Product.find({ stock: { $gt: 0 } }).limit(100);
    const productsWithShop = await Promise.all(
      products.map(async (product) => {
        const shop = await Shop.findById(product.shopId);
        return {
          ...product.toObject(),
          shopName: shop?.name || 'Boutique inconnue'
        };
      })
    );
    res.json(productsWithShop);
  } catch (error) {
    console.error('❌ Erreur catalogue public:', error);
    res.status(500).json({ error: error.message });
  }
});

// Créer un produit
router.post('/', async (req, res) => {
  try {
    console.log('📦 Création produit:', req.body.name);
    console.log('Images reçues:', req.body.images?.length || 0);
    console.log('Vidéos reçues:', req.body.videos?.length || 0);
    
    const product = new Product(req.body);
    const savedProduct = await product.save();
    
    console.log('✅ Produit sauvegardé:', savedProduct._id);
    console.log('Images sauvegardées:', savedProduct.images?.length || 0);
    console.log('Vidéos sauvegardées:', savedProduct.videos?.length || 0);
    
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('❌ Erreur création produit:', error);
    res.status(400).json({ error: error.message });
  }
});

// Récupérer les produits d'une boutique
router.get('/:shopId', async (req, res) => {
  try {
    const products = await Product.find({ shopId: req.params.shopId });
    console.log(`📦 ${products.length} produits trouvés pour boutique ${req.params.shopId}`);
    res.json(products);
  } catch (error) {
    console.error('❌ Erreur récupération produits:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un produit
router.put('/:id', async (req, res) => {
  try {
    console.log('📦 Mise à jour produit:', req.params.id);
    console.log('Images à sauvegarder:', req.body.images?.length || 0);
    console.log('Vidéos à sauvegarder:', req.body.videos?.length || 0);
    
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    console.log('✅ Produit mis à jour:', product._id);
    res.json(product);
  } catch (error) {
    console.error('❌ Erreur mise à jour produit:', error);
    res.status(400).json({ error: error.message });
  }
});

// Supprimer un média d'un produit
router.delete('/:id/media', async (req, res) => {
  try {
    const { mediaType, mediaIndex } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    if (mediaType === 'images' && product.images) {
      product.images.splice(mediaIndex, 1);
    } else if (mediaType === 'videos' && product.videos) {
      product.videos.splice(mediaIndex, 1);
    }
    
    await product.save();
    console.log(`✅ ${mediaType} supprimé du produit ${req.params.id}`);
    res.json(product);
  } catch (error) {
    console.error('❌ Erreur suppression média:', error);
    res.status(400).json({ error: error.message });
  }
});

// Supprimer un produit
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    console.log('✅ Produit supprimé:', req.params.id);
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression produit:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;