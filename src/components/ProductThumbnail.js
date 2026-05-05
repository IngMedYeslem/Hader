import React from 'react';
import { View, Image, Text, Platform } from 'react-native';
import { getMediaUrl } from '../services/api';
import styles from './styles';

const ProductThumbnail = ({ product, style }) => {
  const images = Array.isArray(product.images)
    ? product.images.filter(i => i && i.trim() && !i.startsWith('file://'))
    : [];

  const firstImage = images.length > 0 ? getMediaUrl(images[0]) : null;

  return (
    <View style={style}>
      {firstImage ? (
        <View style={styles.alibabaImage}>
          {Platform.OS === 'web' ? (
            <img
              src={firstImage}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              alt="Product"
            />
          ) : (
            <Image
              source={{ uri: firstImage }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          )}
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', padding: 8 }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={{ color: '#C8A55F', fontSize: 11 }}>
              {product.price} MRU
            </Text>
          </View>
        </View>
      ) : (
        <View style={[styles.alibabaImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>📷</Text>
        </View>
      )}

      {images.length > 1 && (
        <View style={styles.imageCount}>
          <Text style={styles.imageCountText}>+{images.length - 1}</Text>
        </View>
      )}
    </View>
  );
};

export default ProductThumbnail;
