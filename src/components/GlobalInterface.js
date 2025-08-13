import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import GlobalNavbar from './GlobalNavbar';
import SearchBar from './SearchBar';
import ProductModal from './ProductModal';
import ShopSummary from './ShopSummary';
import ProductThumbnail from './ProductThumbnail';
import MediaGallery from './MediaGallery';
import AdminInterface from './AdminInterface';
import { fetchProductsWithShops, checkServerHealth } from '../services/apiService';
import { getMockProducts } from '../services/serverCheck';
import { useTranslation } from '../translations';
import styles from './styles';

export default function GlobalInterface({ onShopLogin }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [useRealData, setUseRealData] = useState(false);
  const [error, setError] = useState(null);
  const [showAdminInterface, setShowAdminInterface] = useState(false);
  const [showShopSummary, setShowShopSummary] = useState(true);
  const [summaryPosition, setSummaryPosition] = useState('top'); // 'top' ou 'bottom'

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Forcer les données de test sur Android pour éviter OOM
        if (Platform.OS === 'android') {
          console.log('Android détecté, utilisation des données de test...');
          const mockProducts = getMockProducts();
          setProducts(mockProducts);
          setFilteredProducts(mockProducts);
          setUseRealData(false);
        } else {
          // Vérifier si le serveur est disponible pour les autres plateformes
          const serverAvailable = await checkServerHealth();
          
          if (serverAvailable) {
            console.log('Serveur disponible, chargement des données réelles...');
            const realProducts = await fetchProductsWithShops();
            setProducts(realProducts);
            setFilteredProducts(realProducts);
            setUseRealData(true);
          } else {
            console.log('Serveur non disponible, utilisation des données de test...');
            const mockProducts = getMockProducts();
            setProducts(mockProducts);
            setFilteredProducts(mockProducts);
            setUseRealData(false);
          }
        }
      } catch (error) {
        console.error('Erreur chargement produits:', error);
        setError('Erreur de connexion au serveur');
        // Fallback vers les données de test
        const mockProducts = getMockProducts();
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
        setUseRealData(false);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Filtrer les produits selon la recherche et la boutique sélectionnée
  useEffect(() => {
    let filtered = products;
    
    // Filtrer par texte de recherche
    if (searchText) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Filtrer par boutique
    if (selectedShop) {
      filtered = filtered.filter(product => 
        product.shop?.username === selectedShop
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, searchText, selectedShop]);

  // Obtenir la liste unique des boutiques
  const shops = [...new Set(products.map(p => p.shop?.username).filter(Boolean))];
  const shopCount = shops.length;

  const handleSearchChange = (text) => {
    setSearchText(text);
  };

  const handleShopFilter = (shop) => {
    setSelectedShop(shop);
  };

  const handleProductPress = (product) => {
    setSelectedProduct(product);
    setShowShopSummary(false); // Masquer le résumé lors de la navigation
    if ((product.images && product.images.length > 0) || (product.videos && product.videos.length > 0)) {
      setGalleryVisible(true);
    } else {
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
    setShowShopSummary(true); // Réafficher le résumé après fermeture
  };
  
  const handleCloseGallery = () => {
    setGalleryVisible(false);
    setSelectedProduct(null);
    setShowShopSummary(true); // Réafficher le résumé après fermeture
  };
  
  const toggleSummaryPosition = () => {
    setSummaryPosition(prev => prev === 'top' ? 'bottom' : 'top');
  };

  if (showAdminInterface) {
    return <AdminInterface onBack={() => setShowAdminInterface(false)} />;
  }

  if (loading) return (
    <ImageBackground 
      source={require('../../assets/b2.jpeg')} 
      style={styles.background}
      resizeMode="cover"
    >
      <GlobalNavbar 
        onShopLogin={onShopLogin} 
        onAdminAccess={() => setShowAdminInterface(true)}
        productCount={0} 
      />
      <Text style={styles.loadingText}>{t('loadingProducts')}</Text>
    </ImageBackground>
  );

  return (
    <ImageBackground 
      source={require('../../assets/b2.jpeg')} 
      style={styles.background}
      resizeMode="cover"
    >
      <GlobalNavbar 
        onShopLogin={onShopLogin} 
        onAdminAccess={() => setShowAdminInterface(true)}
        productCount={filteredProducts.length} 
        shopCount={shopCount} 
      />
      
      {!useRealData && (
        <View style={{ backgroundColor: 'rgba(255,165,0,0.1)', margin: 10, padding: 10, borderRadius: 5 }}>
          <Text style={{ color: '#ff8c00', fontSize: 12, textAlign: 'center' }}>
            📶 Mode démonstration - Données de test
          </Text>
        </View>
      )}
      

      
      <SearchBar 
        searchText={searchText}
        onSearchChange={handleSearchChange}
        selectedShop={selectedShop}
        onShopFilter={handleShopFilter}
        shops={shops}
      />
      
      {showShopSummary && summaryPosition === 'top' && (
        <View>
          <ShopSummary products={products} />
          <TouchableOpacity 
            onPress={toggleSummaryPosition}
            style={{ alignSelf: 'center', backgroundColor: 'rgba(200, 165, 95, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginHorizontal: 15, marginBottom: 5 }}
          >
            <Text style={{ color: '#C8A55F', fontSize: 10 }}>Déplacer en bas</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <ScrollView style={styles.wrapper} contentContainerStyle={styles.contentContainer}>
        {showShopSummary && summaryPosition === 'bottom' && (
          <ShopSummary products={products} />
        )}
        
        {filteredProducts.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#C8A55F', fontSize: 16, textAlign: 'center' }}>
              Aucun produit trouvé pour votre recherche
            </Text>
          </View>
        ) : (
          <View style={styles.globalGrid}>
            {filteredProducts.map((product) => (
            <TouchableOpacity 
              key={product.id} 
              style={[styles.globalCard, { width: '48%' }]}
              onPress={() => handleProductPress(product)}
            >
              <View style={styles.imageContainer}>
                <ProductThumbnail 
                  product={product} 
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
              
              <View style={styles.productInfo}>
                <Text style={styles.globalProductName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.globalPrice}>
                  {product.price} MRU
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
            </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      
      <MediaGallery
        visible={galleryVisible}
        images={selectedProduct ? (Array.isArray(selectedProduct.images) ? selectedProduct.images : (selectedProduct.images ? [selectedProduct.images] : [])) : []}
        videos={selectedProduct ? (Array.isArray(selectedProduct.videos) ? selectedProduct.videos : (selectedProduct.videos ? [selectedProduct.videos] : [])) : []}
        productName={selectedProduct?.name}
        productPrice={selectedProduct?.price}
        shop={selectedProduct?.shop}
        onClose={handleCloseGallery}
      />
      
      <ProductModal 
        visible={modalVisible}
        product={selectedProduct}
        onClose={handleCloseModal}
      />
    </ImageBackground>
  );
}