import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ImageBackground, RefreshControl } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_ALL_PRODUCTS_WITH_SHOPS } from '../graphql/getAllProductsWithShops';
import { useTranslation, formatPrice } from '../translations';
import { fetchProductsWithShops } from '../services/apiService';
import { getMediaUrl } from '../services/api';
import { getServerStatus } from '../services/serverCheck';
import GlobalNavbar from './GlobalNavbar';
import styles from './styles';

export default function GlobalInterfaceWithAPI({ onShopLogin }) {
  const { t } = useTranslation();
  const [apiProducts, setApiProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [serverStatus, setServerStatus] = useState({ isAvailable: true, message: '' });
  const { loading, error, data } = useQuery(GET_ALL_PRODUCTS_WITH_SHOPS, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network'
  });

  useEffect(() => {
    checkServerAndLoadProducts();
  }, []);

  const checkServerAndLoadProducts = async () => {
    const status = await getServerStatus();
    setServerStatus(status);
    
    if (status.isAvailable) {
      try {
        const products = await fetchProductsWithShops();
        setApiProducts(products);
      } catch (error) {
        console.log('Erreur chargement produits:', error);
        setServerStatus({ isAvailable: false, message: 'Serveur non disponible' });
        setApiProducts([]);
      }
    } else {
      setApiProducts([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkServerAndLoadProducts();
    setRefreshing(false);
  };

  const products = serverStatus.isAvailable ? (apiProducts.length > 0 ? apiProducts : (data?.productsWithShops || [])) : [];

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
      
      <View style={{ padding: 10, backgroundColor: serverStatus.isAvailable ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)', margin: 10, borderRadius: 5 }}>
        <Text style={{ color: serverStatus.isAvailable ? 'green' : 'red', fontSize: 12, textAlign: 'center' }}>
          {serverStatus.message}
        </Text>
      </View>
      
      <ScrollView 
        style={styles.wrapper} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {!serverStatus.isAvailable ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', marginBottom: 10 }}>
              🔌 Connexion au serveur impossible
            </Text>
            <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
              Veuillez vérifier votre connexion et réessayer
            </Text>
          </View>
        ) : products.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
              Aucun produit disponible
            </Text>
          </View>
        ) : (
          <View style={styles.globalGrid}>
            {products.map((product) => (
              <View key={product.id} style={[styles.globalCard, { width: '48%' }]}>
                <View style={styles.imageContainer}>
                  {product.images && product.images.length > 0 ? (
                    <Image 
                      source={{ uri: getMediaUrl(product.images[0]) }} 
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
        )}
      </ScrollView>
    </ImageBackground>
  );
}