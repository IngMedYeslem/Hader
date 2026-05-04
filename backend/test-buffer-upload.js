const fetch = require('node-fetch');
const FormData = require('form-data');

async function testBufferUpload() {
  try {
    const testImageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A';
    
    console.log('🧪 Test upload avec Buffer...');
    
    // Convertir base64 en Buffer (Node.js)
    const [header, base64Data] = testImageBase64.split(',');
    const buffer = Buffer.from(base64Data, 'base64');
    
    console.log('📊 Buffer créé:', buffer.length, 'bytes');
    
    // Créer FormData avec Buffer
    const formData = new FormData();
    formData.append('media', buffer, {
      filename: 'test.jpg',
      contentType: 'image/jpeg'
    });
    
    // Envoyer
    const response = await fetch('http://192.168.0.146:3000/api/upload-media', {
      method: 'POST',
      body: formData,
    });
    
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Résultat:', result);
      
      // Vérifier le fichier créé
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, 'uploads', result.filename);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log('📁 Fichier créé:', result.filename, '- Taille:', stats.size, 'bytes');
      }
    } else {
      const error = await response.text();
      console.error('❌ Erreur:', error);
    }
    
  } catch (error) {
    console.error('❌ Erreur test:', error);
  }
}

testBufferUpload();