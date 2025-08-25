import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import ShopListView from './ShopListView';
import ShopCardView from './ShopCardView';
import ShopCategoryView from './ShopCategoryView';
import ShopTableView from './ShopTableView';
import { useTranslation } from '../translations';

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
            backgroundColor: viewMode === key ? '#C8A55F' : 'transparent',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 15,
            alignItems: 'center'
          }}
          onPress={() => setViewMode(key)}
        >
          <Text style={{ fontSize: 16, marginBottom: 2 }}>{icon}</Text>
          <Text style={{
            color: viewMode === key ? '#2C3E50' : '#C8A55F',
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
          <View style={{ flex: 1 }}>
            {/* Vue grille par défaut (existante) */}
            {products.map((product) => (
              <TouchableOpacity 
                key={product._id}
                onPress={() => onProductPress(product)}
                onLongPress={() => onEditProduct(product)}
              >
                <Text>{product.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
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