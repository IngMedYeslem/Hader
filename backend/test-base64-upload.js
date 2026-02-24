const fetch = require('node-fetch');

async function testBase64Upload() {
  try {
    // Image 1x1 pixel rouge en base64
    const testImageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A';
    
    console.log('🧪 Test upload base64...');
    console.log('📊 Taille base64:', testImageBase64.length);
    
    // Convertir en blob comme le fait le client
    const [header, base64Data] = testImageBase64.split(',');
    const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
    
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    console.log('📎 Blob créé:', blob.size, 'bytes, type:', blob.type);
    
    // Créer FormData
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('media', blob, 'test.jpg');
    
    // Envoyer
    const response = await fetch('http://192.168.0.138:3000/api/upload-media', {
      method: 'POST',
      body: formData,
    });
    
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Résultat:', result);
    } else {
      const error = await response.text();
      console.error('❌ Erreur:', error);
    }
    
  } catch (error) {
    console.error('❌ Erreur test:', error);
  }
}

testBase64Upload();