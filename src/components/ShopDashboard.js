import React, { useState, useEffect } from 'react';
import { Text, View, Image, ScrollView, ImageBackground, TouchableOpacity, Dimensions, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SimpleNavbar from "./SimpleNavbar";
import AddProduct from "./AddProduct";
import MediaGallery from "./MediaGallery";
import EditProduct from "./EditProduct";
import ShopInfo from "./ShopInfo";
import ProductThumbnail from "./ProductThumbnail";
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
  const [editVisible, setEditVisible] = useState(false);
  const [shopInfoVisible, setShopInfoVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { t } = useTranslation();
  const { currentPage, navigateTo } = useNavigation();

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditVisible(true);
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts(products.map(p => 
      p._id === updatedProduct._id ? updatedProduct : p
    ));
  };
  
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
    if (!shop.isApproved) {
      Alert.alert(
        'Compte non approuvé',
        'Votre compte est en attente d\'approbation par un administrateur. Vous ne pouvez pas ajouter de produits pour le moment.',
        [{ text: 'OK', onPress: () => navigateTo('dashboard') }]
      );
      return null;
    }
    
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
          {shop.isApproved ? (
            <TouchableOpacity onPress={() => setShopInfoVisible(true)}>
              <Text style={styles.shopTitle}>{shop.name} ℹ️</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.shopTitle}>{shop.name}</Text>
          )}
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.syncBtn} onPress={handleSync}>
              <Text style={styles.syncText}>↻</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutText}>{t('logout')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.globalGrid}>
            {products.length === 0 ? (
              <View style={styles.centeredContainer}>
                {shop.isApproved ? (
                  <>
                    <Text style={styles.emptyText}>{t('noProductsInShop')}</Text>
                    <Text style={styles.emptySubText}>{t('tapPlusToAdd')}</Text>
                  </>
                ) : (
                  <View style={styles.card}>
                    <Text style={[styles.authTitle, { fontSize: 20, marginBottom: 20 }]}>
                      ⏳ {t('accountWaitingApproval')}
                    </Text>
                    <Text style={[styles.colorText, { textAlign: 'center', fontSize: 16, marginBottom: 15 }]}>
                      {t('accountValidatedIn24h')}
                    </Text>
                    <Text style={[styles.colorText, { textAlign: 'center', fontSize: 14, marginBottom: 20 }]}>
                      {t('contactAdminAfter24h')}
                    </Text>
                    
                    <Text style={[styles.authTitle, { fontSize: 16, marginBottom: 15 }]}>
                      📞 {t('contactAdmin')}
                    </Text>
                    
                    <TouchableOpacity 
                      style={[styles.submitBtn, { backgroundColor: '#25D366', marginBottom: 10 }]}
                      onPress={() => {
                        const whatsappUrl = `whatsapp://send?phone=+22246251999&text=${encodeURIComponent('Bonjour, je souhaite faire valider mon compte boutique.')}`;
                        Linking.openURL(whatsappUrl).catch(() => {
                          Alert.alert('Erreur', 'WhatsApp n\'est pas installé');
                        });
                      }}
                    >
                      <Text style={styles.submitText}>
                        📱 {t('contactWhatsApp')}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.submitBtn, { backgroundColor: '#007AFF' }]}
                      onPress={() => {
                        const phoneUrl = `tel:+22236251999`;
                        Linking.openURL(phoneUrl).catch(() => {
                          Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application téléphone');
                        });
                      }}
                    >
                      <Text style={styles.submitText}>
                        📞 {t('callAdmin')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              products.map((product) => (
                <TouchableOpacity 
                  key={product._id || product.id || `product-${Date.now()}-${Math.random()}`} 
                  style={[styles.globalCard, { width: itemWidth }]}
                  onPress={() => {
                    if ((product.images && product.images.length > 0) || (product.videos && product.videos.length > 0)) {
                      setSelectedProduct(product);
                      setGalleryVisible(true);
                    }
                  }}
                  onLongPress={() => handleEditProduct(product)}
                >
                  <View style={styles.imageContainer}>
                    <ProductThumbnail 
                      product={product} 
                      style={{ width: '100%', height: '100%' }}
                    />
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
                      onPress={() => handleEditProduct(product)}
                    >
                      <Text style={{ color: 'white', fontSize: 12 }}>✏️</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.globalProductName} numberOfLines={2}>{product.name}</Text>
                    <Text style={styles.globalPrice}>{product.price} €</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
        
        {shop.isApproved && (
          <TouchableOpacity 
            style={styles.floatingBtn} 
            onPress={() => navigateTo('addProduct')}
          >
            <Text style={styles.floatingBtnText}>+</Text>
          </TouchableOpacity>
        )}

        <MediaGallery
          visible={galleryVisible}
          images={selectedProduct ? (Array.isArray(selectedProduct.images) ? selectedProduct.images : (selectedProduct.images ? [selectedProduct.images] : [])) : []}
          videos={selectedProduct ? (Array.isArray(selectedProduct.videos) ? selectedProduct.videos : (selectedProduct.videos ? [selectedProduct.videos] : [])) : []}
          productName={selectedProduct?.name}
          onClose={() => {
            setGalleryVisible(false);
            setSelectedProduct(null);
          }}
        />

        {selectedProduct && (
          <EditProduct
            product={selectedProduct}
            visible={editVisible}
            onClose={() => {
              setEditVisible(false);
              setSelectedProduct(null);
            }}
            onProductUpdated={handleProductUpdated}
          />
        )}

        <ShopInfo
          shop={shop}
          visible={shopInfoVisible}
          onClose={() => setShopInfoVisible(false)}
        />
      </ImageBackground>
    </View>
  );
}

export default ShopDashboard;