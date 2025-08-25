import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import ProductThumbnail from './ProductThumbnail';
import { useTranslation } from '../translations';

export default function ShopTableView({ products, onProductPress, onEditProduct }) {
  const { t } = useTranslation();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ minWidth: '100%' }}>
        {/* En-tête du tableau */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: '#2C3E50',
          paddingVertical: 12,
          paddingHorizontal: 10
        }}>
          <Text style={{ color: '#C8A55F', fontWeight: 'bold', width: 60, textAlign: 'center' }}>Image</Text>
          <Text style={{ color: '#C8A55F', fontWeight: 'bold', width: 120, paddingLeft: 10 }}>Nom</Text>
          <Text style={{ color: '#C8A55F', fontWeight: 'bold', width: 80, textAlign: 'center' }}>Prix</Text>
          <Text style={{ color: '#C8A55F', fontWeight: 'bold', width: 100, textAlign: 'center' }}>Catégorie</Text>
          <Text style={{ color: '#C8A55F', fontWeight: 'bold', width: 80, textAlign: 'center' }}>Stock</Text>
          <Text style={{ color: '#C8A55F', fontWeight: 'bold', width: 60, textAlign: 'center' }}>Actions</Text>
        </View>

        {/* Lignes du tableau */}
        <ScrollView style={{ maxHeight: 400 }}>
          {products.map((product, index) => (
            <TouchableOpacity
              key={product._id}
              style={{
                flexDirection: 'row',
                backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
                paddingVertical: 10,
                paddingHorizontal: 10,
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(200, 165, 95, 0.2)'
              }}
              onPress={() => onProductPress(product)}
            >
              <View style={{ width: 60, alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden' }}>
                  <ProductThumbnail product={product} style={{ width: '100%', height: '100%' }} />
                </View>
              </View>
              
              <Text style={{ 
                width: 120, 
                paddingLeft: 10, 
                fontSize: 12, 
                color: '#2C3E50',
                fontWeight: '500'
              }} numberOfLines={2}>
                {product.name}
              </Text>
              
              <Text style={{ 
                width: 80, 
                textAlign: 'center', 
                fontSize: 12, 
                color: '#C8A55F',
                fontWeight: 'bold'
              }}>
                {product.price} MRU
              </Text>
              
              <Text style={{ 
                width: 100, 
                textAlign: 'center', 
                fontSize: 11, 
                color: '#7F8C8D'
              }}>
                {product.category || 'N/A'}
              </Text>
              
              <Text style={{ 
                width: 80, 
                textAlign: 'center', 
                fontSize: 11, 
                color: product.stock > 0 ? '#27AE60' : '#E74C3C',
                fontWeight: 'bold'
              }}>
                {product.stock || 0}
              </Text>
              
              <View style={{ width: 60, alignItems: 'center' }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(200, 165, 95, 0.2)',
                    borderRadius: 15,
                    width: 30,
                    height: 30,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  onPress={() => onEditProduct(product)}
                >
                  <Text style={{ fontSize: 12 }}>✏️</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Résumé statistique */}
        <View style={{
          backgroundColor: 'rgba(44, 62, 80, 0.9)',
          padding: 15,
          flexDirection: 'row',
          justifyContent: 'space-around'
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#C8A55F', fontSize: 16, fontWeight: 'bold' }}>
              {products.length}
            </Text>
            <Text style={{ color: '#C8A55F', fontSize: 10 }}>Produits</Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#C8A55F', fontSize: 16, fontWeight: 'bold' }}>
              {products.reduce((sum, p) => sum + (p.stock || 0), 0)}
            </Text>
            <Text style={{ color: '#C8A55F', fontSize: 10 }}>Stock Total</Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#C8A55F', fontSize: 16, fontWeight: 'bold' }}>
              {Math.round(products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length) || 0} MRU
            </Text>
            <Text style={{ color: '#C8A55F', fontSize: 10 }}>Prix Moyen</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}