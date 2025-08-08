import React, { useState, useEffect } from 'react';
import { Text, View, Image, ScrollView, ImageBackground, TouchableOpacity, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SimpleNavbar from "./SimpleNavbar";
import AddProduct from "./AddProduct";
import ImageGallery from "./ImageGallery";
import styles from "./styles";
import { useTranslation } from '../translations';
import { useNavigation } from '../NavigationContext';
import { productAPI } from '../services/api';
import { syncService } from '../services/syncService';
import { imageService } from '../services/imageService';

const { width } = Dimensions.get('window');
const itemWidth = (width - 60) / 2;

function ShopDashboard({ shop, onLogout }) {
  const [products, setProducts] = useState([]);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { t } = useTranslation();
  const { currentPage, navigateTo } = useNavigation();
  
  const showAddProduct = currentPage === 'addProduct';

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
      onBack={() => navigateTo('dashboard')} 
      onAdd={async (newProduct) => {
        try {
          // S'assurer que images est un tableau
          const imageArray = Array.isArray(newProduct.images) ? newProduct.images : (newProduct.images ? [newProduct.images] : []);
          
          // Traiter les images locales (file://)
          console.log('📱 Images avant traitement:', imageArray);
          const processedImages = await imageService.processImages(imageArray);
          console.log('✅ Images après traitement:', processedImages.length);
          
          // Essayer l'API d'abord
          const product = await productAPI.create({ 
            ...newProduct, 
            images: processedImages,
            shopId: shop._id 
          });
          
          // Mettre à jour la liste avec le nouveau produit
          setProducts(prevProducts => [...prevProducts, product]);
          
        } catch (error) {
          // Fallback local
          try {
            const imageArray = Array.isArray(newProduct.images) ? newProduct.images : (newProduct.images ? [newProduct.images] : []);
            const processedImages = await imageService.processImages(imageArray);
            
            const localProduct = {
              _id: Date.now().toString() + Math.random(),
              ...newProduct,
              images: processedImages,
              shopId: shop._id,
              createdAt: new Date().toISOString()
            };
            
            // Mettre à jour la liste avec le nouveau produit
            setProducts(prevProducts => {
              const updatedProducts = [...prevProducts, localProduct];
              // Sauvegarder localement
              AsyncStorage.setItem(`products_${shop._id}`, JSON.stringify(updatedProducts));
              return updatedProducts;
            });
            
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
                <TouchableOpacity 
                  key={product._id || product.id || `product-${Date.now()}-${Math.random()}`} 
                  style={[styles.alibabaCard, { width: itemWidth }]}
                  onPress={() => {
                    if (product.images && product.images.length > 0) {
                      setSelectedProduct(product);
                      setGalleryVisible(true);
                    }
                  }}
                >
                  <View style={styles.imageContainer}>
                    {product.images && product.images.length > 0 ? (
                      <>
                        <Image 
                          source={{ uri: Array.isArray(product.images) ? product.images[0] : product.images }} 
                          style={styles.alibabaImage}
                          resizeMode="cover"
                        />
                        {Array.isArray(product.images) && product.images.length > 1 && (
                          <View style={styles.imageCount}>
                            <Text style={styles.imageCountText}>+{product.images.length - 1}</Text>
                          </View>
                        )}
                      </>
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
          onPress={() => navigateTo('addProduct')}
        >
          <Text style={styles.floatingBtnText}>+</Text>
        </TouchableOpacity>

        <ImageGallery
          visible={galleryVisible}
          images={selectedProduct ? (Array.isArray(selectedProduct.images) ? selectedProduct.images : [selectedProduct.images]) : []}
          productName={selectedProduct?.name}
          onClose={() => {
            setGalleryVisible(false);
            setSelectedProduct(null);
          }}
        />
      </ImageBackground>
    </View>
  );
}

export default ShopDashboard;