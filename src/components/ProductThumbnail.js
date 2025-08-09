import React from 'react';
import { View, Image, Text } from 'react-native';
import { Video } from 'expo-av';
import styles from './styles';

const ProductThumbnail = ({ product, style }) => {
  // Priorité : vidéo en premier, puis images
  const hasVideos = product.videos && product.videos.length > 0;
  const hasImages = product.images && product.images.length > 0;
  
  const totalMedia = (product.videos?.length || 0) + (product.images?.length || 0);

  if (hasVideos) {
    return (
      <View style={style}>
        <View style={styles.alibabaImage}>
          <Video
            source={{ uri: product.videos[0] }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            shouldPlay={false}
            isMuted={true}
            useNativeControls={false}
            pointerEvents="none"
            paused={true}
          />
        </View>
        {totalMedia > 1 && (
          <View style={styles.imageCount}>
            <Text style={styles.imageCountText}>+{totalMedia - 1}</Text>
          </View>
        )}
        <View style={[styles.imageCount, { top: 5, right: 5, bottom: 'auto' }]}>
          <Text style={styles.imageCountText}>🎥</Text>
        </View>
      </View>
    );
  }
  
  if (hasImages) {
    return (
      <View style={style}>
        <Image 
          source={{ uri: Array.isArray(product.images) ? product.images[0] : product.images }} 
          style={styles.alibabaImage}
          resizeMode="cover"
        />
        {Array.isArray(product.images) && product.images.length > 1 && (
          <View style={styles.imageCount}>
            <Text style={styles.imageCountText}>+{product.images.length - 1}</Text>
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