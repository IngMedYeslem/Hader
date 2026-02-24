const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

async function convertBase64ToUrls() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    console.log('✅ Connexion MongoDB établie');

    const products = await Product.find();
    console.log(`📦 ${products.length} produits trouvés`);

    let convertedCount = 0;
    
    for (const product of products) {
      let needsUpdate = false;
      
      // Convertir les images base64 en fichiers
      if (product.images) {
        const newImages = [];
        
        for (let i = 0; i < product.images.length; i++) {
          const img = product.images[i];
          
          if (img.startsWith('data:image/')) {
            try {
              console.log(`Conversion image ${i + 1} du produit "${product.name}"`);
              
              const base64String = img.split(',')[1];
              const buffer = Buffer.from(base64String, 'base64');
              const id = Date.now().toString().slice(-8);
              const filename = `converted_img_${id}_${i}.jpg`;
              const imagePath = path.join('uploads', filename);
              
              fs.writeFileSync(imagePath, buffer);
              const imageUrl = `/uploads/${filename}`;
              newImages.push(imageUrl);
              needsUpdate = true;
              
              console.log(`✅ Image convertie: ${imageUrl}`);
            } catch (error) {
              console.error(`❌ Erreur conversion image ${i + 1}:`, error);
              // Garder l'image originale en cas d'erreur
              newImages.push(img);
            }
          } else {
            // Déjà une URL
            newImages.push(img);
          }
        }
        
        product.images = newImages;
      }
      
      // Convertir les vidéos base64 en fichiers
      if (product.videos) {
        const newVideos = [];
        
        for (let i = 0; i < product.videos.length; i++) {
          const vid = product.videos[i];
          
          if (vid.startsWith('data:video/')) {
            try {
              console.log(`Conversion vidéo ${i + 1} du produit "${product.name}"`);
              
              const base64String = vid.split(',')[1];
              const buffer = Buffer.from(base64String, 'base64');
              const id = Date.now().toString().slice(-8);
              const filename = `converted_vid_${id}_${i}.mp4`;
              const videoPath = path.join('uploads', filename);
              
              fs.writeFileSync(videoPath, buffer);
              const videoUrl = `/uploads/${filename}`;
              newVideos.push(videoUrl);
              needsUpdate = true;
              
              console.log(`✅ Vidéo convertie: ${videoUrl}`);
            } catch (error) {
              console.error(`❌ Erreur conversion vidéo ${i + 1}:`, error);
              // Garder la vidéo originale en cas d'erreur
              newVideos.push(vid);
            }
          } else {
            // Déjà une URL
            newVideos.push(vid);
          }
        }
        
        product.videos = newVideos;
      }
      
      if (needsUpdate) {
        await product.save();
        convertedCount++;
        console.log(`✅ Produit "${product.name}" converti`);
      }
    }
    
    console.log(`🔄 ${convertedCount} produits convertis vers URLs`);
    await mongoose.disconnect();
    console.log('✅ Conversion terminée');
    
  } catch (error) {
    console.error('❌ Erreur conversion:', error);
  }
}

convertBase64ToUrls();