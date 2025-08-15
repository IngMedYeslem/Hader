import React from 'react';
import { View, Image, Text, Platform } from 'react-native';
import { Video } from 'expo-av';
import styles from './styles';

const ProductThumbnail = ({ product, style }) => {
  // Vérifier et nettoyer les données
  const videos = Array.isArray(product.videos) ? product.videos.filter(v => v && v.trim()) : [];
  const images = Array.isArray(product.images) ? product.images.filter(i => i && i.trim()) : [];
  
  const hasVideos = videos.length > 0;
  const hasImages = images.length > 0;
  const totalMedia = videos.length + images.length;

  console.log('ProductThumbnail:', {
    productName: product.name,
    hasVideos,
    hasImages,
    videosCount: videos.length,
    imagesCount: images.length,
    firstVideo: videos[0]?.substring(0, 50),
    firstImage: images[0]?.substring(0, 50),
    isLocalFile: images[0]?.startsWith('file://') || videos[0]?.startsWith('file://')
  });
  
  // Filtrer les URLs locales non converties
  const validImages = images.filter(img => !img.startsWith('file://'));
  const validVideos = videos.filter(vid => !vid.startsWith('file://'));
  
  const hasValidVideos = validVideos.length > 0;
  const hasValidImages = validImages.length > 0;

  if (hasValidVideos) {
    const videoUri = validVideos[0];
    

    
    return (
      <View style={style}>
        <View style={styles.alibabaImage}>
          {Platform.OS === 'web' ? (
            <video
              src={videoUri}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              muted
              playsInline
              onError={(error) => console.log('Erreur vidéo web:', error)}
            />
          ) : (
            <Video
              source={{ uri: videoUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              shouldPlay={false}
              isMuted={true}
              useNativeControls={false}
              pointerEvents="none"
              onError={(error) => console.log('Erreur vidéo mobile:', error)}
            />
          )}
        </View>
        {(validVideos.length + validImages.length) > 1 && (
          <View style={styles.imageCount}>
            <Text style={styles.imageCountText}>+{(validVideos.length + validImages.length) - 1}</Text>
          </View>
        )}
        <View style={[styles.imageCount, { top: 5, right: 5, bottom: 'auto' }]}>
          <Text style={styles.imageCountText}>🎥</Text>
        </View>
      </View>
    );
  }
  
  if (hasValidImages) {
    const imageUri = validImages[0];
    return (
      <View style={style}>
        <Image 
          source={{ uri: imageUri }} 
          style={styles.alibabaImage}
          resizeMode="cover"
          onError={(error) => {
            console.log('Erreur image:', error);
            console.log('URI problématique:', imageUri);
          }}
          onLoad={() => console.log('Image chargée:', imageUri.substring(0, 50))}
        />
        {validImages.length > 1 && (
          <View style={styles.imageCount}>
            <Text style={styles.imageCountText}>+{validImages.length - 1}</Text>
          </View>
        )}
      </View>
    );
  }
  
  return (
    <View style={[style, styles.placeholderImage]}>
      <Text style={styles.placeholderText}>📷</Text>
    </View>
  );
};

export default ProductThumbnail;