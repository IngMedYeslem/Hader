import React, { useState, useEffect } from 'react';
import { Text, View, Image, ScrollView, ImageBackground, TouchableOpacity, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SimpleNavbar from "./SimpleNavbar";
import AddProduct from "./AddProduct";
import styles from "./styles";
import { useTranslation } from '../translations';
import { productAPI } from '../services/api';
import { syncService } from '../services/syncService';

const { width } = Dimensions.get('window');
const itemWidth = (width - 60) / 2;

function ShopDashboard({ shop, onLogout }) {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Essayer l'API d'abord
      const shopProducts = await productAPI.getByShop(shop._id);
      setProducts(shopProducts);
    } catch (error) {
      // Fallback local
      try {
        const localProducts = await AsyncStorage.getItem(`products_${shop._id}`);
        const products = localProducts ? JSON.parse(localProducts) : [];
        setProducts(products);
      } catch (localError) {
        console.error('Erreur chargement produits locaux:', localError);
        setProducts([]);
      }
    }
  };

  const handleSync = async () => {
    try {
      console.log('🔄 Synchronisation manuelle démarrée...');
      const result = await syncService.syncAll();
      
      if (result.shops > 0 || result.products > 0) {
        Alert.alert(
          'Synchronisation réussie', 
          `${result.shops} boutiques et ${result.products} produits synchronisés avec MongoDB`
        );
        loadProducts(); // Recharger les produits
      } else {
        Alert.alert('Synchronisation', 'Aucune donnée locale à synchroniser');
      }
    } catch (error) {
      console.error('❌ Synchronisation échouée:', error);
      Alert.alert('Erreur', 'Synchronisation échouée. Vérifiez votre connexion.');
    }
  };

  if (showAddProduct) {
    return <AddProduct 
      onBack={() => setShowAddProduct(false)} 
      onAdd={async (newProduct) => {
        try {
          // Essayer l'API d'abord
          const product = await productAPI.create({ ...newProduct, shopId: shop._id });
          setProducts([...products, product]);
        } catch (error) {
          // Fallback local
          try {
            const localProduct = {
              _id: Date.now().toString(),
              ...newProduct,
              shopId: shop._id,
              createdAt: new Date().toISOString()
            };
            
            const updatedProducts = [...products, localProduct];
            setProducts(updatedProducts);
            
            // Sauvegarder localement
            await AsyncStorage.setItem(`products_${shop._id}`, JSON.stringify(updatedProducts));
            
            // Essayer de synchroniser immédiatement
            setTimeout(() => handleSync(), 1000);
          } catch (localError) {
            console.error('Erreur ajout produit local:', localError);
          }
        }
      }} 
    />;
  }

  return (
    <View style={styles.wrapper}>
      <SimpleNavbar />
      <ImageBackground 
        source={require('../../assets/b2.jpeg')} 
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.shopHeader}>
          <Text style={styles.shopTitle}>{shop.name}</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.syncBtn} onPress={handleSync}>
              <Text style={styles.syncText}>↻</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutText}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.alibabaGrid}>
            {products.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Aucun produit dans votre boutique</Text>
                <Text style={styles.emptySubText}>Appuyez sur + pour ajouter des produits</Text>
              </View>
            ) : (
              products.map((product) => (
                <TouchableOpacity key={product.id} style={[styles.alibabaCard, { width: itemWidth }]}>
                  <View style={styles.imageContainer}>
                    {product.images ? (
                      <Image 
                        source={{ uri: product.images }} 
                        style={styles.alibabaImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>📷</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.alibabaProductName} numberOfLines={2}>{product.name}</Text>
                    <Text style={styles.alibabaPrice}>{product.price} €</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
        
        <TouchableOpacity 
          style={styles.floatingBtn} 
          onPress={() => setShowAddProduct(true)}
        >
          <Text style={styles.floatingBtnText}>+</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

export default ShopDashboard;