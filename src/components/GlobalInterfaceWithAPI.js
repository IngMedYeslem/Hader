import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ImageBackground, RefreshControl } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_ALL_PRODUCTS_WITH_SHOPS } from '../graphql/getAllProductsWithShops';
import { useTranslation, formatPrice } from '../translations';
import { fetchProductsWithShops } from '../services/apiService';
import GlobalNavbar from './GlobalNavbar';
import styles from './styles';

export default function GlobalInterfaceWithAPI({ onShopLogin }) {
  const { t } = useTranslation();
  const [apiProducts, setApiProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { loading, error, data } = useQuery(GET_ALL_PRODUCTS_WITH_SHOPS, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network'
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const products = await fetchProductsWithShops();
      setApiProducts(products);
    } catch (error) {
      console.log('Erreur chargement produits:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  // Données de fallback si l'API n'est pas disponible
  const mockProducts = [
    {
      id: '1',
      name: 'Smartphone Samsung Galaxy',
      price: 2500,
      images: ['https://via.placeholder.com/150'],
      shop: { username: 'TechStore', profileImage: 'https://via.placeholder.com/50' }
    },
    {
      id: '2', 
      name: 'Laptop Dell Inspiron',
      price: 4500,
      images: ['https://via.placeholder.com/150'],
      shop: { username: 'ElectroShop', profileImage: 'https://via.placeholder.com/50' }
    }
  ];

  const products = apiProducts.length > 0 ? apiProducts : (data?.productsWithShops || mockProducts);

  if (loading && !data) return (
    <ImageBackground 
      source={require('../../assets/b2.jpeg')} 
      style={styles.background}
      resizeMode="cover"
    >
      <GlobalNavbar onShopLogin={onShopLogin} />
      <Text style={styles.loadingText}>{t('loadingProducts')}</Text>
    </ImageBackground>
  );

  return (
    <ImageBackground 
      source={require('../../assets/b2.jpeg')} 
      style={styles.background}
      resizeMode="cover"
    >
      <GlobalNavbar onShopLogin={onShopLogin} />
      
      {error && (
        <View style={{ padding: 10, backgroundColor: 'rgba(255,0,0,0.1)', margin: 10, borderRadius: 5 }}>
          <Text style={{ color: 'red', fontSize: 12, textAlign: 'center' }}>
            Serveur non disponible - Affichage des données de démonstration
          </Text>
        </View>
      )}
      
      <ScrollView 
        style={styles.wrapper} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.globalGrid}>
          {products.map((product) => (
            <View key={product.id} style={[styles.globalCard, { width: '48%' }]}>
              <View style={styles.imageContainer}>
                {product.images && product.images.length > 0 ? (
                  <Image 
                    source={{ uri: product.images[0] }} 
                    style={styles.globalImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text style={styles.placeholderText}>📷</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.productInfo}>
                <Text style={styles.globalProductName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.globalPrice}>
                  {formatPrice(product.price)}
                </Text>
                <View style={styles.shopInfo}>
                  <Text style={styles.shopName}>
                    Boutique: {product.shop?.username || 'Non spécifiée'}
                  </Text>
                  {product.shop?.profileImage && (
                    <Image 
                      source={{ uri: product.shop.profileImage }} 
                      style={styles.shopAvatar}
                    />
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}