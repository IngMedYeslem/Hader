import React from 'react';
import { View, Image, Text, Platform } from 'react-native';
import { getMediaUrl } from '../services/api';

const ProductThumbnail = ({ product, style }) => {
  const images = Array.isArray(product.images)
    ? product.images.filter(i => i && i.trim() && !i.startsWith('file://'))
    : [];

  const firstImage = images.length > 0 ? getMediaUrl(images[0]) : null;

  return (
    <View style={[{ overflow: 'hidden', backgroundColor: '#FFF0EB' }, style]}>
      {firstImage ? (
        Platform.OS === 'web' ? (
          <img
            src={firstImage}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt={product.name}
          />
        ) : (
          <Image
            source={{ uri: firstImage }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        )
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 32 }}>🛋️</Text>
        </View>
      )}

      {/* طبقة اسم المنتج والسعر */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.55)', padding: 6 }}>
        <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={{ color: '#FF6B35', fontSize: 10, fontWeight: 'bold' }}>
          {product.price} MRU
        </Text>
      </View>

      {images.length > 1 && (
        <View style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2 }}>
          <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>+{images.length - 1}</Text>
        </View>
      )}
    </View>
  );
};

export default ProductThumbnail;
