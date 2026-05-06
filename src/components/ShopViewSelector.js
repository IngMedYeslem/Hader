import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ScrollView, Dimensions } from 'react-native';
import ShopListView from './ShopListView';
import ShopCardView from './ShopCardView';
import ShopCategoryView from './ShopCategoryView';
import ShopTableView from './ShopTableView';
import ProductThumbnail from './ProductThumbnail';
import { useTranslation } from '../translations';
import styles from './styles';

const { width } = Dimensions.get('window');
const itemWidth = (width - 60) / 2;

export default function ShopViewSelector({ products, onProductPress, onEditProduct }) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('grid'); // 'list', 'cards', 'grid', 'category', 'table'

  const ViewModeSelector = () => (
    <View style={{
      flexDirection: 'row',
      backgroundColor: 'rgba(44, 62, 80, 0.9)',
      paddingHorizontal: 15,
      paddingVertical: 10,
      justifyContent: 'space-around'
    }}>
      {[
        { key: 'list', icon: '☰', label: 'Liste' },
        { key: 'cards', icon: '⊞', label: 'Cartes' },
        { key: 'grid', icon: '▦', label: 'Grille' },
        { key: 'category', icon: '📂', label: 'Catégories' },
        { key: 'table', icon: '📊', label: 'Tableau' }
      ].map(({ key, icon, label }) => (
        <TouchableOpacity
          key={key}
          style={{
            backgroundColor: viewMode === key ? '#FF6B35' : 'transparent',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 15,
            alignItems: 'center'
          }}
          onPress={() => setViewMode(key)}
        >
          <Text style={{ fontSize: 16, marginBottom: 2 }}>{icon}</Text>
          <Text style={{
            color: viewMode === key ? 'white' : '#FF6B35',
            fontSize: 10,
            fontWeight: 'bold'
          }}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderView = () => {
    const props = { products, onProductPress, onEditProduct };
    
    switch (viewMode) {
      case 'list':
        return <ShopListView {...props} />;
      case 'cards':
        return <ShopCardView {...props} />;
      case 'category':
        return <ShopCategoryView {...props} />;
      case 'table':
        return <ShopTableView {...props} />;
      default:
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
                    width: itemWidth,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: 12,
                    marginBottom: 15,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
                  }}
                  onPress={() => onProductPress(product)}
                  onLongPress={() => onEditProduct(product)}
                >
                  <View style={{ height: itemWidth, position: 'relative' }}>
                    <ProductThumbnail product={product} style={{ width: '100%', height: '100%' }} />
                    <TouchableOpacity 
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        borderRadius: 15,
                        width: 30,
                        height: 30,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                      onPress={() => onEditProduct(product)}
                    >
                      <Text style={{ color: 'white', fontSize: 12 }}>✏️</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={{ padding: 12 }}>
                    <Text style={{ 
                      fontSize: 14, 
                      fontWeight: 'bold', 
                      color: '#333',
                      textAlign: 'center'
                    }} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={{ 
                      fontSize: 13, 
                      fontWeight: 'bold', 
                      color: '#FF6B35',
                      textAlign: 'center',
                      marginTop: 5
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
  };

  return (
    <View style={{ flex: 1 }}>
      <ViewModeSelector />
      {renderView()}
    </View>
  );
}