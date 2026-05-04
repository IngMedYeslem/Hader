const mongoose = require('mongoose');
const Product = require('./backend/models/Product');

// Test de stockage vidéo
async function testVideoStorage() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    console.log('✅ Connexion MongoDB établie');

    // Créer un produit test avec vidéo
    const testProduct = new Product({
      name: 'Produit Test Vidéo',
      description: 'Test de stockage vidéo',
      price: 100,
      category: 'Test',
      stock: 10,
      images: ['http://192.168.0.146:3000/uploads/test_image.jpg'],
      videos: ['http://192.168.0.146:3000/uploads/test_video.mp4'],
      shopId: '507f1f77bcf86cd799439011' // ID de test
    });

    const savedProduct = await testProduct.save();
    console.log('✅ Produit test créé:', savedProduct._id);
    console.log('📹 Vidéos stockées:', savedProduct.videos);

    // Vérifier la récupération
    const retrievedProduct = await Product.findById(savedProduct._id);
    console.log('✅ Produit récupéré:', retrievedProduct.name);
    console.log('📹 Vidéos récupérées:', retrievedProduct.videos);

    // Nettoyer
    await Product.findByIdAndDelete(savedProduct._id);
    console.log('✅ Produit test supprimé');

    await mongoose.disconnect();
    console.log('✅ Test terminé avec succès');
  } catch (error) {
    console.error('❌ Erreur test:', error);
  }
}

testVideoStorage();