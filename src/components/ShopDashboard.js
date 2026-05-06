import React, { useState, useEffect } from 'react';
import { Text, View, Image, ScrollView, TouchableOpacity, Dimensions, Alert, Linking, Platform, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddProduct from "./AddProduct";
import MediaGallery from "./MediaGallery";
import EditProduct from "./EditProduct";
import ShopInfo from "./ShopInfo";
import ProductThumbnail from "./ProductThumbnail";
import ShopViewSelector from "./ShopViewSelector";
import NotificationCenter from "./NotificationCenter";
import NotificationsList from "./NotificationsList";
import ValidationStatusIndicator from "./ValidationStatusIndicator";
import ShopOrderManagement from "./ShopOrderManagement";
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
  const [ordersVisible, setOrdersVisible] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isApproved, setIsApproved] = useState(shop.isApproved || false);
  const [showWelcomePage, setShowWelcomePage] = useState(false);
  const [userId, setUserId] = useState(null);
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage === 'ar';
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
    fetchUserId();
    fetchNewOrdersCount();
  }, []);
  
  const fetchNewOrdersCount = async () => {
    try {
      const response = await fetch(`http://192.168.0.110:3000/api/shops/${shop._id}/orders`);
      if (response.ok) {
        const orders = await response.json();
        const pending = orders.filter(o => o.status === 'pending').length;
        setNewOrdersCount(pending);
      }
    } catch (e) {}
  };

  const fetchUserId = async () => {
    try {
      const response = await fetch('http://192.168.0.110:3000/api/users');
      const users = await response.json();
      const user = users.find(u => u.linkedShop?.id === shop._id);
      if (user) {
        setUserId(user.id);
        console.log('✅ User ID trouvé:', user.id);
      }
    } catch (error) {
      console.log('❌ Erreur récupération userId:', error);
    }
  };
  
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
      const response = await fetch(`http://192.168.0.110:3000/api/shops/${shop._id}`);
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
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <SafeAreaView style={{ backgroundColor: '#FF6B35' }}>
          <View style={{ backgroundColor: '#FF6B35', paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>🏪 {shop.name}</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>{t('shopCreatedSuccessfully')}</Text>
          </View>
        </SafeAreaView>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 16 }}>🎉 {t('congratulations')}!</Text>
            <Text style={{ color: '#555', fontSize: 15, textAlign: 'center', marginBottom: 16 }}>{t('shopCreatedWaitingValidation')}</Text>
            <View style={{ backgroundColor: '#fff8e1', padding: 14, borderRadius: 10, marginBottom: 20 }}>
              <Text style={{ color: '#f57f17', fontSize: 13, marginBottom: 6, fontWeight: '600' }}>🕰️ {t('validationProcess')}:</Text>
              <Text style={{ color: '#555', fontSize: 13, marginBottom: 5 }}>• {t('adminWillReview')}</Text>
              <Text style={{ color: '#555', fontSize: 13, marginBottom: 5 }}>• {t('validationWithin24h')}</Text>
              <Text style={{ color: '#555', fontSize: 13 }}>• {t('canAddProductsAfterValidation')}</Text>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: '#25D366', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 }}
              onPress={() => Linking.openURL(`whatsapp://send?phone=+22246251999&text=${encodeURIComponent(t('shopValidationMessage'))}`).catch(() => Alert.alert('Erreur', 'WhatsApp n\'est pas installé'))}
            >
              <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>📱 {t('contactWhatsApp')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: '#FF6B35', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
              onPress={hideWelcomePage}
            >
              <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>{t('understood')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <SafeAreaView style={{ backgroundColor: '#FF6B35' }}>
        <View style={{ backgroundColor: '#FF6B35', paddingHorizontal: 16, paddingVertical: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>🏪 {shop.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 8 }}>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{products.length} {t('products')}</Text>
                <ValidationStatusIndicator isApproved={isApproved} isRejected={autoRefreshRejected} isChecking={false} />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              {isApproved && (
                <TouchableOpacity
                  onPress={() => setOrdersVisible(true)}
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, position: 'relative' }}
                >
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>📦 {isRTL ? 'الطلبات' : 'Commandes'}</Text>
                  {newOrdersCount > 0 && (
                    <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#FF6B35', borderRadius: 9, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{newOrdersCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              {Platform.OS !== 'web' && (
                <TouchableOpacity
                  onPress={() => setNotificationsVisible(true)}
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}
                >
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>🔔</Text>
                </TouchableOpacity>
              )}
              {isApproved && (
                <TouchableOpacity
                  onPress={() => setShopInfoVisible(true)}
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}
                >
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>&#9432;</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onLogout}
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>{t('logout')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {products.length === 0 ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.centeredContainer}>
              {isApproved ? (
                <>
                  <Text style={styles.emptyText}>{t('noProductsInShop')}</Text>
                  <Text style={styles.emptySubText}>{t('tapPlusToAdd')}</Text>
                </>
              ) : autoRefreshRejected ? (
                <View style={styles.card}>
                  <Text style={[styles.authTitle, { fontSize: 18, marginBottom: 15, textAlign: 'center', color: '#FF6B35' }]}>
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
                  
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                    <TouchableOpacity 
                      style={[styles.submitBtn, { flex: 1, backgroundColor: '#FF6B35' }]}
                      onPress={() => setShopInfoVisible(true)}
                    >
                      <Text style={[styles.submitText, { fontSize: 12 }]}>
                        ✏️ Modifier infos
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.submitBtn, { flex: 1, backgroundColor: '#FF6B35' }]}
                      onPress={async () => {
                        try {
                          const response = await fetch(`http://192.168.0.110:3000/api/shops/${shop._id}/reactivate`, {
                            method: 'POST'
                          });
                          if (response.ok) {
                            Alert.alert('Succès', 'Demande de réactivation envoyée');
                          }
                        } catch (error) {
                          Alert.alert('Erreur', 'Impossible d\'envoyer la demande');
                        }
                      }}
                    >
                      <Text style={[styles.submitText, { fontSize: 12 }]}>
                        🔄 Réactiver
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.submitBtn, { backgroundColor: '#25D366' }]}
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
                    style={[styles.submitBtn, { backgroundColor: '#FF6B35' }]}
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
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer}>
          <View style={styles.globalGrid}>
              {products.map((product) => (
                <TouchableOpacity 
                  key={product._id} 
                  style={[styles.globalCard, { width: '48%' }]}
                  activeOpacity={0.9}
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
                      style={styles.editBadge}
                      onPress={() => handleEditProduct(product)}
                    >
                      <Text style={{ fontSize: 13 }}>✏️</Text>
                    </TouchableOpacity>
                    {((product.images?.length || 0) + (product.videos?.length || 0)) > 1 && (
                      <View style={styles.mediaCounter}>
                        <Text style={styles.mediaCounterText}>
                          +{(product.images?.length || 0) + (product.videos?.length || 0) - 1}
                        </Text>
                      </View>
                    )}
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
        <TouchableOpacity style={styles.floatingBtn} onPress={() => navigateTo('addProduct')}>
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
          allowEdit={true}
      />

      {ordersVisible && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white', zIndex: 9999 }}>
          <ShopOrderManagement shopId={shop._id} onClose={() => { setOrdersVisible(false); fetchNewOrdersCount(); }} />
        </View>
      )}

      {notificationsVisible && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', margin: 20, borderRadius: 12, maxHeight: '80%', width: '90%', maxWidth: 400 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#FF6B35', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotificationsVisible(false)} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>×</Text>
              </TouchableOpacity>
            </View>
            <NotificationsList userId={userId || shop._id} />
          </View>
        </View>
      )}
    </View>
  );
}

export default ShopDashboard;