import React, { useState, useEffect } from 'react';
import { Text, View, Image, ScrollView, ImageBackground, TouchableOpacity, Dimensions, Alert, Linking, Platform, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddProduct from "./AddProduct";
import MediaGallery from "./MediaGallery";
import EditProduct from "./EditProduct";
import ShopInfo from "./ShopInfo";
import ProductThumbnail from "./ProductThumbnail";
import ShopViewSelector from "./ShopViewSelector";
import NotificationCenter from "./NotificationCenter";
import ValidationStatusIndicator from "./ValidationStatusIndicator";
import styles from "./styles";
import { useTranslation } from '../translations';
import { useNavigation } from '../NavigationContext';
import { useShopValidationRefresh } from '../hooks/useShopValidationRefresh';
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
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isApproved, setIsApproved] = useState(shop.isApproved || false);
  const [showWelcomePage, setShowWelcomePage] = useState(false);
  const { t } = useTranslation();
  const { currentPage, navigateTo } = useNavigation();
  
  // Hook pour l'actualisation automatique du statut de validation
  const { isApproved: autoRefreshApproved, isRejected: autoRefreshRejected } = useShopValidationRefresh(
    shop._id,
    null
  );

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditVisible(true);
  };

  const handleProductUpdated = (updatedProduct) => {
    if (updatedProduct === null) {
      // Suppression du produit
      setProducts(products.filter(p => p._id !== selectedProduct._id));
    } else {
      // Mise à jour du produit
      setProducts(products.map(p => 
        p._id === updatedProduct._id ? updatedProduct : p
      ));
    }
  };
  
  const showAddProduct = currentPage === 'addProduct';

  useEffect(() => {
    loadProducts();
    checkApprovalStatus();
    checkWelcomePage();
  }, []);
  
  const checkWelcomePage = async () => {
    try {
      const shouldShow = await AsyncStorage.getItem('showWelcomePage');
      if (shouldShow === 'true' && !isApproved && !autoRefreshRejected) {
        setShowWelcomePage(true);
      }
    } catch (error) {
      console.log('Erreur vérification page d\'accueil:', error);
    }
  };
  
  const hideWelcomePage = async () => {
    try {
      await AsyncStorage.removeItem('showWelcomePage');
      setShowWelcomePage(false);
    } catch (error) {
      console.log('Erreur masquage page d\'accueil:', error);
    }
  };
  
  // Synchroniser le statut avec le hook d'actualisation automatique
  useEffect(() => {
    if (autoRefreshApproved !== isApproved) {
      setIsApproved(autoRefreshApproved);
    }
    // Si le compte est rejeté, masquer la page de bienvenue
    if (autoRefreshRejected && showWelcomePage) {
      setShowWelcomePage(false);
    }
  }, [autoRefreshApproved, autoRefreshRejected, isApproved, showWelcomePage]);
  
  const checkApprovalStatus = async () => {
    try {
      const response = await fetch(`http://172.20.10.6:3000/api/shops/${shop._id}`);
      if (response.ok) {
        const shopData = await response.json();
        console.log('🔄 Statut approbation vérifié:', shopData.isApproved);
        setIsApproved(shopData.isApproved || false);
      }
    } catch (error) {
      console.log('❌ Erreur vérification statut:', error);
    }
  };

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

  // Afficher la page d'accueil pour les boutiques non validées (mais pas rejetées)
  if (showWelcomePage && !isApproved && !autoRefreshRejected) {
    return (
      <View style={styles.wrapper}>
        <ImageBackground 
          source={require('../../assets/b2.jpeg')} 
          style={styles.background}
          resizeMode="cover"
        >
          <SafeAreaView style={{ backgroundColor: '#2C3E50' }}>
            <View style={[styles.headerGlobal, { backgroundColor: '#2C3E50', paddingVertical: 20, paddingHorizontal: 30, alignItems: 'center' }]}>
              <Text style={{ fontSize: 18, color: '#C8A55F', fontWeight: 'bold', textAlign: 'center' }}>
                🏠 {t('welcome')} {shop.name}!
              </Text>
              <Text style={{ fontSize: 14, color: '#C8A55F', opacity: 0.8, textAlign: 'center', marginTop: 5 }}>
                {t('shopCreatedSuccessfully')}
              </Text>
            </View>
          </SafeAreaView>
          
          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
            <View style={styles.centeredContainer}>
              <View style={[styles.card, { margin: 20 }]}>
                <Text style={[styles.authTitle, { fontSize: 20, marginBottom: 20, textAlign: 'center' }]}>
                  🎉 {t('congratulations')}!
                </Text>
                
                <Text style={[styles.colorText, { textAlign: 'center', fontSize: 16, marginBottom: 15 }]}>
                  {t('shopCreatedWaitingValidation')}
                </Text>
                
                <View style={{ backgroundColor: 'rgba(200, 165, 95, 0.1)', padding: 15, borderRadius: 8, marginBottom: 20 }}>
                  <Text style={[styles.colorText, { textAlign: 'center', fontSize: 14, marginBottom: 10 }]}>
                    🕰️ {t('validationProcess')}:
                  </Text>
                  <Text style={[styles.colorText, { fontSize: 13, marginBottom: 8 }]}>
                    • {t('adminWillReview')}
                  </Text>
                  <Text style={[styles.colorText, { fontSize: 13, marginBottom: 8 }]}>
                    • {t('validationWithin24h')}
                  </Text>
                  <Text style={[styles.colorText, { fontSize: 13 }]}>
                    • {t('canAddProductsAfterValidation')}
                  </Text>
                </View>
                
                <Text style={[styles.authTitle, { fontSize: 16, marginBottom: 15, textAlign: 'center' }]}>
                  📞 {t('needHelp')}?
                </Text>
                
                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: '#25D366', marginBottom: 10 }]}
                  onPress={() => {
                    const whatsappUrl = `whatsapp://send?phone=+22246251999&text=${encodeURIComponent(t('shopValidationMessage'))}`;
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
                  style={[styles.submitBtn, { backgroundColor: '#C8A55F' }]}
                  onPress={hideWelcomePage}
                >
                  <Text style={styles.submitText}>
                    {t('understood')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </View>
    );
  }
  
  if (showAddProduct) {
    if (!isApproved) {
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
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginTop: 8
            }}>
              <Text style={{ 
                fontSize: 12, 
                color: '#C8A55F', 
                opacity: 0.7,
                marginRight: 8
              }}>
                {products.length} {t('products')}
              </Text>
              <ValidationStatusIndicator 
                isApproved={isApproved} 
                isRejected={autoRefreshRejected}
                isChecking={false}
              />
            </View>
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {Platform.OS !== 'web' && (
                <TouchableOpacity 
                  onPress={() => setNotificationsVisible(true)}
                  style={{ 
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(52, 152, 219, 0.15)', 
                    paddingHorizontal: 15, 
                    paddingVertical: 10, 
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: 'rgba(52, 152, 219, 0.3)',
                    marginRight: 10
                  }}
                >
                  <Text style={{ fontSize: 14, marginRight: 6 }}>🔔</Text>
                  <Text style={{ color: '#3498db', fontSize: 12, fontWeight: 'bold' }}>
                    Notifications
                  </Text>
                </TouchableOpacity>
              )}
              
              {isApproved && (
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
            </View>
            
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
              {isApproved ? (
                <>
                  <Text style={styles.emptyText}>{t('noProductsInShop')}</Text>
                  <Text style={styles.emptySubText}>{t('tapPlusToAdd')}</Text>
                </>
              ) : autoRefreshRejected ? (
                <View style={styles.card}>
                  <Text style={[styles.authTitle, { fontSize: 18, marginBottom: 15, textAlign: 'center', color: '#dc3545' }]}>
                    ❌ {t('accountRejected')}
                  </Text>
                  <Text style={[styles.colorText, { textAlign: 'center', fontSize: 16, marginBottom: 15 }]}>
                    {t('rejectionReason')}:
                  </Text>
                  <View style={{ backgroundColor: '#f8d7da', padding: 15, borderRadius: 8, marginBottom: 20 }}>
                    <Text style={{ color: '#721c24', fontSize: 14, textAlign: 'center' }}>
                      {shop.rejectionReason || t('noReasonProvided')}
                    </Text>
                  </View>
                  <Text style={[styles.colorText, { textAlign: 'center', fontSize: 14, marginBottom: 20 }]}>
                    {t('contactAdminForClarification')}
                  </Text>
                  
                  <TouchableOpacity 
                    style={[styles.submitBtn, { backgroundColor: '#25D366', marginBottom: 10 }]}
                    onPress={() => {
                      const whatsappUrl = `whatsapp://send?phone=+22246251999&text=${encodeURIComponent(t('shopAccountValidationMessage'))}`;
                      Linking.openURL(whatsappUrl).catch(() => {
                        Alert.alert('Erreur', 'WhatsApp n\'est pas installé');
                      });
                    }}
                  >
                    <Text style={styles.submitText}>
                      📱 {t('contactWhatsApp')}
                    </Text>
                  </TouchableOpacity>
                </View>
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
                      const whatsappUrl = `whatsapp://send?phone=+22246251999&text=${encodeURIComponent(t('shopAccountValidationMessage'))}`;
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
          <ScrollView 
            style={styles.wrapper} 
            contentContainerStyle={styles.contentContainer}
          >
            <View style={styles.globalGrid}>
              {products.map((product) => (
                <TouchableOpacity 
                  key={product._id} 
                  style={[styles.globalCard, { width: '48%' }]}
                  onPress={() => {
                    setSelectedProduct(product);
                    if ((product.images && product.images.length > 0) || (product.videos && product.videos.length > 0)) {
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
                      <Text style={{ color: 'white', fontSize: 10 }}>✏️</Text>
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
        )}
        
        {isApproved && (
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
          productPrice={selectedProduct?.price}
          shop={shop}
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

        {/* Modal des notifications */}
        {notificationsVisible && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <View style={{
              backgroundColor: 'white',
              margin: 20,
              borderRadius: 12,
              maxHeight: '80%',
              width: '90%',
              maxWidth: 400
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: '#eee'
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#2C3E50'
                }}>
                  Notifications
                </Text>
                <TouchableOpacity 
                  onPress={() => setNotificationsVisible(false)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: '#f0f0f0',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>×</Text>
                </TouchableOpacity>
              </View>
              
              <NotificationCenter 
                userId={shop._id}
                shopId={shop._id}
              />
            </View>
          </View>
        )}
      </ImageBackground>
    </View>
  );
}

export default ShopDashboard;