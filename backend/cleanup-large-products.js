const mongoose = require('mongoose');
const Product = require('./models/Product');

async function cleanupLargeProducts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hader');
    console.log('✅ Connexion MongoDB établie');

    const products = await Product.find();
    console.log(`📦 ${products.length} produits trouvés`);

    let cleanedCount = 0;
    
    for (const product of products) {
      let needsUpdate = false;
      
      // Nettoyer les images base64 trop volumineuses
      if (product.images) {
        const cleanImages = product.images.filter(img => {
          if (img.startsWith('data:image/')) {
            const base64String = img.split(',')[1];
            const sizeInBytes = (base64String.length * 3) / 4;
            const sizeInMB = sizeInBytes / (1024 * 1024);
            
            if (sizeInMB > 5) {
              console.log(`🗑️ Image trop volumineuse supprimée: ${sizeInMB.toFixed(2)}MB`);
              needsUpdate = true;
              return false;
            }
          }
          return true;
        });
        
        if (cleanImages.length !== product.images.length) {
          product.images = cleanImages;
        }
      }
      
      // Nettoyer les vidéos base64 trop volumineuses
      if (product.videos) {
        const cleanVideos = product.videos.filter(vid => {
          if (vid.startsWith('data:video/')) {
            const base64String = vid.split(',')[1];
            const sizeInBytes = (base64String.length * 3) / 4;
            const sizeInMB = sizeInBytes / (1024 * 1024);
            
            if (sizeInMB > 20) {
              console.log(`🗑️ Vidéo trop volumineuse supprimée: ${sizeInMB.toFixed(2)}MB`);
              needsUpdate = true;
              return false;
            }
          }
          return true;
        });
        
        if (cleanVideos.length !== product.videos.length) {
          product.videos = cleanVideos;
        }
      }
      
      if (needsUpdate) {
        await product.save();
        cleanedCount++;
        console.log(`✅ Produit "${product.name}" nettoyé`);
      }
    }
    
    console.log(`🧹 ${cleanedCount} produits nettoyés`);
    await mongoose.disconnect();
    console.log('✅ Nettoyage terminé');
    
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error);
  }
}

cleanupLargeProducts();