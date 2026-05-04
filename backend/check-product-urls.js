const mongoose = require('mongoose');
const Product = require('./models/Product');

async function checkProductUrls() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hader');
    console.log('✅ Connexion MongoDB établie');

    const products = await Product.find();
    console.log(`📦 ${products.length} produits trouvés`);

    products.forEach((product, index) => {
      console.log(`\n--- Produit ${index + 1}: ${product.name} ---`);
      console.log('ID:', product._id);
      
      if (product.images && product.images.length > 0) {
        console.log(`📸 Images (${product.images.length}):`);
        product.images.forEach((img, i) => {
          console.log(`  ${i + 1}. ${img}`);
        });
      } else {
        console.log('📸 Aucune image');
      }
      
      if (product.videos && product.videos.length > 0) {
        console.log(`🎬 Vidéos (${product.videos.length}):`);
        product.videos.forEach((vid, i) => {
          console.log(`  ${i + 1}. ${vid}`);
        });
      } else {
        console.log('🎬 Aucune vidéo');
      }
    });

    await mongoose.disconnect();
    console.log('\n✅ Vérification terminée');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkProductUrls();