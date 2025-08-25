import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import ProductThumbnail from './ProductThumbnail';
import styles from './styles';
import { useTranslation } from '../translations';

const { width } = Dimensions.get('window');
const itemWidth = (width - 60) / 2;

export default function ShopCategoryView({ products, onProductPress, onEditProduct }) {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Grouper les produits par catégorie
  const categories = ['all', ...new Set(products.map(p => p.category || 'autres'))];
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => (p.category || 'autres') === selectedCategory);

  return (
    <View style={{ flex: 1 }}>
      {/* Barre de catégories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={{ 
          backgroundColor: 'rgba(44, 62, 80, 0.9)',
          maxHeight: 60
        }}
        contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 10 }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={{
              backgroundColor: selectedCategory === category ? '#C8A55F' : 'rgba(255,255,255,0.2)',
              paddingHorizontal: 15,
              paddingVertical: 8,
              borderRadius: 20,
              marginRight: 10
            }}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={{
              color: selectedCategory === category ? '#2C3E50' : '#C8A55F',
              fontWeight: 'bold',
              fontSize: 12
            }}>
              {category === 'all' ? t('all') : category} ({category === 'all' ? products.length : products.filter(p => (p.category || 'autres') === category).length})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grille de produits */}
      <ScrollView style={styles.scrollContainer}>
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          padding: 15
        }}>
          {filteredProducts.map((product) => (
            <TouchableOpacity 
              key={product._id}
              style={[styles.globalCard, { width: itemWidth, marginBottom: 15 }]}
              onPress={() => onProductPress(product)}
              onLongPress={() => onEditProduct(product)}
            >
              <View style={styles.imageContainer}>
                <ProductThumbnail product={product} style={{ width: '100%', height: '100%' }} />
                
                {/* Badge catégorie */}
                <View style={{
                  position: 'absolute',
                  top: 5,
                  left: 5,
                  backgroundColor: 'rgba(200, 165, 95, 0.9)',
                  borderRadius: 8,
                  paddingHorizontal: 6,
                  paddingVertical: 2
                }}>
                  <Text style={{ color: '#2C3E50', fontSize: 8, fontWeight: 'bold' }}>
                    {product.category || 'autres'}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onPress={() => onEditProduct(product)}
                >
                  <Text style={{ color: 'white', fontSize: 12 }}>✏️</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.productInfo}>
                <Text style={styles.globalProductName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.globalPrice}>
                  {product.price} MRU
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}