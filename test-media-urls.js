// Test des URLs de médias
const testUrls = [
  '/uploads/img_123.jpg',
  '/uploads/vid_456.mp4',
  'http://192.168.0.138:3000/uploads/img_789.jpg',
  'http://localhost:3000/uploads/vid_012.mp4'
];

// Simuler getMediaUrl
const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;
  
  console.log('🔗 Construction URL pour:', mediaPath);
  
  if (mediaPath.startsWith('http')) {
    if (mediaPath.includes('localhost')) {
      const correctedUrl = mediaPath.replace('localhost', '192.168.0.138');
      console.log('✅ URL corrigée:', correctedUrl);
      return correctedUrl;
    }
    console.log('✅ URL déjà complète:', mediaPath);
    return mediaPath;
  }
  
  const baseUrl = 'http://192.168.0.138:3000';
  const cleanPath = mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`;
  const fullUrl = `${baseUrl}${cleanPath}`;
  
  console.log('✅ URL construite:', fullUrl);
  return fullUrl;
};

console.log('=== Test des URLs de médias ===');
testUrls.forEach(url => {
  const result = getMediaUrl(url);
  console.log(`${url} → ${result}`);
});

console.log('\n=== Test avec données produit ===');
const mockProduct = {
  images: ['/uploads/img_123.jpg', '/uploads/img_456.jpg'],
  videos: ['/uploads/vid_789.mp4']
};

console.log('Images:');
mockProduct.images.forEach(img => {
  console.log(`  ${img} → ${getMediaUrl(img)}`);
});

console.log('Vidéos:');
mockProduct.videos.forEach(vid => {
  console.log(`  ${vid} → ${getMediaUrl(vid)}`);
});