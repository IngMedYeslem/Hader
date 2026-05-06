import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import ProductThumbnail from './ProductThumbnail';
import styles from './styles';
import { useTranslation } from '../translations';

export default function ShopListView({ products, onProductPress, onEditProduct }) {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.scrollContainer}>
      {products.map((product) => (
        <TouchableOpacity 
          key={product._id}
          style={{
            flexDirection: 'row',
            backgroundColor: 'rgba(255,255,255,0.9)',
            margin: 10,
            borderRadius: 12,
            padding: 15,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}
          onPress={() => onProductPress(product)}
          onLongPress={() => onEditProduct(product)}
        >
          <View style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden' }}>
            <ProductThumbnail product={product} style={{ width: '100%', height: '100%' }} />
          </View>
          
          <View style={{ flex: 1, marginLeft: 15, justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={{ fontSize: 14, color: '#7F8C8D', marginVertical: 5 }} numberOfLines={2}>
              {product.description}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF6B35' }}>
              {product.price} MRU
            </Text>
          </View>
          
          <TouchableOpacity 
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => onEditProduct(product)}
          >
            <Text style={{ fontSize: 16 }}>✏️</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}