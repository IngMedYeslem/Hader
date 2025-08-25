import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import ProductThumbnail from './ProductThumbnail';
import styles from './styles';
import { useTranslation } from '../translations';

const { width } = Dimensions.get('window');
const cardWidth = (width - 45) / 3;

export default function ShopCardView({ products, onProductPress, onEditProduct }) {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 15
      }}>
        {products.map((product) => (
          <TouchableOpacity 
            key={product._id}
            style={{
              width: cardWidth,
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: 10,
              marginBottom: 15,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2
            }}
            onPress={() => onProductPress(product)}
            onLongPress={() => onEditProduct(product)}
          >
            <View style={{ height: cardWidth, position: 'relative' }}>
              <ProductThumbnail product={product} style={{ width: '100%', height: '100%' }} />
              <TouchableOpacity 
                style={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: 10,
                  width: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onPress={() => onEditProduct(product)}
              >
                <Text style={{ color: 'white', fontSize: 10 }}>✏️</Text>
              </TouchableOpacity>
            </View>
            
            <View style={{ padding: 8 }}>
              <Text style={{ 
                fontSize: 12, 
                fontWeight: 'bold', 
                color: '#2C3E50',
                textAlign: 'center'
              }} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={{ 
                fontSize: 11, 
                fontWeight: 'bold', 
                color: '#C8A55F',
                textAlign: 'center',
                marginTop: 3
              }}>
                {product.price} MRU
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}