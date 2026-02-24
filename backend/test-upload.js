const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testImageUpload() {
  try {
    console.log('🧪 Test d\'upload d\'image...');
    
    // Créer une image de test simple (1x1 pixel rouge en base64)
    const testImageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A';
    
    // Convertir en blob
    const [header, base64Data] = testImageBase64.split(',');
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    console.log(`📊 Taille du blob: ${blob.size} bytes`);
    
    // Créer FormData
    const formData = new FormData();
    formData.append('media', blob, 'test.jpg');
    
    // Envoyer la requête
    const response = await fetch('http://localhost:3000/api/upload-media', {
      method: 'POST',
      body: formData,
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload réussi:', result);
      
      // Vérifier que le fichier existe et n'est pas vide
      const uploadPath = path.join(__dirname, 'uploads', result.filename);
      if (fs.existsSync(uploadPath)) {
        const stats = fs.statSync(uploadPath);
        console.log(`📁 Fichier créé: ${result.filename}, taille: ${stats.size} bytes`);
        
        if (stats.size === 0) {
          console.error('❌ PROBLÈME: Fichier vide créé!');
        } else {
          console.log('✅ Fichier correctement sauvegardé');
        }
      } else {
        console.error('❌ PROBLÈME: Fichier non trouvé sur le disque');
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Erreur upload:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erreur test:', error);
  }
}

// Lancer le test
testImageUpload();