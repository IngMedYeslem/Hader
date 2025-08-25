import React, { useState, useEffect } from 'react';
import { Text, View, Image, ScrollView, ImageBackground, TouchableOpacity, Dimensions, Alert, Linking, Platform, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddProduct from "./AddProduct";
import MediaGallery from "./MediaGallery";
import EditProduct from "./EditProduct";
import ShopInfo from "./ShopInfo";
import ProductThumbnail from "./ProductThumbnail";
import ShopViewSelector from "./ShopViewSelector";
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
      console.log('🔄 Chargement produits pour boutique:', shop._id);
      
      // Essayer l'API d'abord
      const shopProducts = await productAPI.getByShop(shop._id);
      console.log('✅ API: Récupéré', shopProducts.length, 'produits');
      setProducts(shopProducts);
      
      // Sauvegarder en local pour cache
      await AsyncStorage.setItem(`products_${shop._id}`, JSON.stringify(shopProducts));
    } catch (error) {
      console.log('❌ API indisponible, utilisation cache local');
      
      // Fallback local
      try {
        const localProducts = await AsyncStorage.getItem(`products_${shop._id}`);
        const products = localProducts ? JSON.parse(localProducts) : [];
        console.log('💾 Local: Récupéré', products.length, 'produits');
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
        // Recharger les produits après synchronisation
        setTimeout(() => loadProducts(), 1000);
      } else {
        Alert.alert('Synchronisation', 'Aucune donnée locale à synchroniser');
        // Recharger quand même pour récupérer les nouveaux produits du serveur
        setTimeout(() => loadProducts(), 500);
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
    } else {
      return <AddProduct 
      onBack={() => navigateTo('dashboard')} 
      onAdd={async (newProduct) => {
        try {
          // S'assurer que images est un tableau
          const imageArray = Array.isArray(newProduct.images) ? newProduct.images : (newProduct.images ? [newProduct.images] : []);
          
          // FORCER la conversion des images locales
          console.log('📱 Images avant traitement:', imageArray);
          const processedImages = [];
          for (const img of imageArray) {
            if (img.startsWith('file://')) {
              const base64 = await imageService.convertToBase64(img);
              if (base64.startsWith('data:')) {
                processedImages.push(base64);
              }
            } else {
              processedImages.push(img);
            }
          }
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
            
            // FORCER la conversion pour le stockage local aussi
            const processedImages = [];
            for (const img of imageArray) {
              if (img.startsWith('file://')) {
                const base64 = await imageService.convertToBase64(img);
                if (base64.startsWith('data:')) {
                  processedImages.push(base64);
                }
              } else {
                processedImages.push(img);
              }
            }
            
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
  }

  return (
    <View style={styles.wrapper}>
      <ImageBackground 
        source={require('../../assets/b2.jpeg')} 
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={{ backgroundColor: '#2C3E50' }}>
          <View style={[styles.headerGlobal, { backgroundColor: '#2C3E50' }]}>
            {/* Premier niveau - Titre */}
            <View style={{ paddingVertical: 15, paddingHorizontal: 30, alignItems: 'center' }}>
            <Text style={{ 
              fontSize: 16, 
              color: '#C8A55F', 
              fontWeight: 'bold'
            }}>
              🏠 {shop.name}
            </Text>
            <Text style={{ 
              fontSize: 12, 
              color: '#C8A55F', 
              opacity: 0.7,
              marginTop: 4
            }}>
              {products.length} {t('products')} • {shop.isApproved ? t('approved') : t('pending')}
            </Text>
          </View>
          
          {/* Deuxième niveau - Boutons */}
          <View style={{ 
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 15,
            paddingBottom: 10,
            borderTopWidth: 1,
            borderTopColor: 'rgba(200, 165, 95, 0.2)'
          }}>
            {shop.isApproved && (
              <TouchableOpacity 
                onPress={() => setShopInfoVisible(true)}
                style={{ 
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(200, 165, 95, 0.15)', 
                  paddingHorizontal: 15, 
                  paddingVertical: 10, 
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: 'rgba(200, 165, 95, 0.3)'
                }}
              >
                <Text style={{ fontSize: 14, marginRight: 6 }}>ℹ️</Text>
                <Text style={{ color: '#C8A55F', fontSize: 12, fontWeight: 'bold' }}>
                  {t('info')}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              onPress={onLogout}
              style={{ 
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(220, 53, 69, 0.15)', 
                paddingHorizontal: 15, 
                paddingVertical: 10, 
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(220, 53, 69, 0.3)'
              }}
            >
              <Text style={{ fontSize: 14, marginRight: 6 }}>🚪</Text>
              <Text style={{ color: '#dc3545', fontSize: 12, fontWeight: 'bold' }}>
                {t('logout')}
              </Text>
            </TouchableOpacity>
          </View>
          </View>
        </SafeAreaView>

        
        {products.length === 0 ? (
          <ScrollView 
            style={styles.scrollContainer} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.centeredContainer}>
              {shop.isApproved ? (
                <>
                  <Text style={styles.emptyText}>{t('noProductsInShop')}</Text>
                  <Text style={styles.emptySubText}>{t('tapPlusToAdd')}</Text>
                </>
              ) : (
                <View style={styles.card}>
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
          </ScrollView>
        ) : (
          <ShopViewSelector
            products={products}
            onProductPress={(product) => {
              if ((product.images && product.images.length > 0) || (product.videos && product.videos.length > 0)) {
                setSelectedProduct(product);
                setGalleryVisible(true);
              }
            }}
            onEditProduct={handleEditProduct}
          />
        )}
        
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