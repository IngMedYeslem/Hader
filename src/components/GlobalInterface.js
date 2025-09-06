import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ImageBackground, Platform, PanResponder } from 'react-native';
import GlobalNavbar from './GlobalNavbar';
import SearchBar from './SearchBar';
import ProductModal from './ProductModal';
import ProductDetailModal from './ProductDetailModal';
import ShopSummary from './ShopSummary';
import ProductThumbnail from './ProductThumbnail';
import MediaGallery from './MediaGallery';
import AdminInterface from './AdminInterface';
import { fetchProductsWithShops, checkServerHealth } from '../services/apiService';
import { getServerStatus } from '../services/serverCheck';
import { useTranslation } from '../translations';
import styles from './styles';

export default function GlobalInterface({ onShopLogin }) {
  const { t } = useTranslation();
  
  console.log('🌍 GlobalInterface render');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [serverAvailable, setServerAvailable] = useState(false);
  const [error, setError] = useState(null);
  const [showAdminInterface, setShowAdminInterface] = useState(false);
  const [showShopSummary, setShowShopSummary] = useState(true);
  const [summaryPosition, setSummaryPosition] = useState('top'); // 'top' ou 'bottom'

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const status = await getServerStatus();
        setServerAvailable(status.isAvailable);
        setError(status.isAvailable ? null : 'Serveur non disponible');
        
        if (status.isAvailable) {
          try {
            const realProducts = await fetchProductsWithShops();
            setProducts(realProducts);
            setFilteredProducts(realProducts);
          } catch (fetchError) {
            console.log('Erreur fetch produits:', fetchError);
            setServerAvailable(false);
            setProducts([]);
            setFilteredProducts([]);
          }
        } else {
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (error) {
        console.error('Erreur chargement produits:', error);
        setError('Erreur de connexion au serveur');
        setServerAvailable(false);
        setProducts([]);
        setFilteredProducts([]);
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
  
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (evt, gestureState) => {},
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 50) {
        setSummaryPosition('bottom');
      } else if (gestureState.dy < -50) {
        setSummaryPosition('top');
      }
    },
  });

  const productsPanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (Math.abs(gestureState.dy) > 20) {
        setShowShopSummary(false);
      }
    },
    onPanResponderRelease: () => {},
  });

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
      
      {!serverAvailable && (
        <View style={{ backgroundColor: 'rgba(255,0,0,0.1)', margin: 10, padding: 10, borderRadius: 5 }}>
          <Text style={{ color: 'red', fontSize: 12, textAlign: 'center' }}>
            ❌ Serveur non disponible
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
        <View {...panResponder.panHandlers}>
          <ShopSummary products={products} />
        </View>
      )}
      
      <ScrollView 
        style={styles.wrapper} 
        contentContainerStyle={styles.contentContainer}
        onScroll={() => setShowShopSummary(false)}
        scrollEventThrottle={16}
      >
        {showShopSummary && summaryPosition === 'bottom' && (
          <View {...panResponder.panHandlers}>
            <ShopSummary products={products} />
          </View>
        )}
        
        {!serverAvailable ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: 'red', fontSize: 18, textAlign: 'center', marginBottom: 10 }}>
              🔌 Connexion au serveur impossible
            </Text>
            <Text style={{ color: 'red', fontSize: 14, textAlign: 'center' }}>
              Veuillez vérifier votre connexion et réessayer
            </Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#C8A55F', fontSize: 16, textAlign: 'center' }}>
              Aucun produit trouvé
            </Text>
          </View>
        ) : (
          <View 
            style={styles.globalGrid} 
            {...productsPanResponder.panHandlers}
            onWheel={() => setShowShopSummary(false)}
            onTouchMove={() => setShowShopSummary(false)}
          >
            {filteredProducts.map((product) => (
            <TouchableOpacity 
              key={product.id} 
              style={[styles.globalCard, { width: '48%' }]}
              onPress={() => {
                setSelectedProduct(product);
                setDetailModalVisible(true);
              }}
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
      
      <ProductDetailModal
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        shop={selectedProduct?.shop}
      />
    </ImageBackground>
  );
}