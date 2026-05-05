import { Text, View, Image, ScrollView, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import SimpleNavbar from "./SimpleNavbar";
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import ProductDetailModal from "./ProductDetailModal";
import styles from "./styles";
import { useState } from 'react';
import { useTranslation } from '../translations';

const mockProducts = [
  { id: 1, name: 'iPhone 14', price: 999, images: 'https://via.placeholder.com/150' },
  { id: 2, name: 'Samsung Galaxy', price: 799, images: 'https://via.placeholder.com/150' },
  { id: 3, name: 'MacBook Pro', price: 1999, images: null },
  { id: 4, name: 'iPad Air', price: 599, images: 'https://via.placeholder.com/150' },
];

const { width } = Dimensions.get('window');
const itemWidth = (width - 60) / 2;

function ProductList() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState(mockProducts);
  const { t } = useTranslation();

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditProduct(true);
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts(products.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    ));
  };

  if (showAddProduct) {
    return <AddProduct onBack={() => setShowAddProduct(false)} onAdd={(newProduct) => {
      setProducts([...products, { ...newProduct, id: Date.now() }]);
    }} />;
  }

  return (
    <View style={styles.wrapper}>
      <SimpleNavbar />
      <ImageBackground 
        source={require('../../assets/b2.jpeg')} 
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.globalGrid}>
            {products.map((product) => (
              <TouchableOpacity 
                key={product.id} 
                style={[styles.globalCard, { width: itemWidth }]}
                activeOpacity={0.9}
                onPress={() => {
                  setSelectedProduct(product);
                  setShowProductDetail(true);
                }}
                onLongPress={() => handleEditProduct(product)}
              >
                <View style={styles.imageContainer}>
                  {product.images ? (
                    <Image 
                      source={{ uri: product.images }} 
                      style={styles.globalImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>📷</Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.editBadge}
                    onPress={() => handleEditProduct(product)}
                  >
                    <Text style={{ fontSize: 13 }}>✏️</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.globalProductName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.globalPrice}>{product.price} €</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        <TouchableOpacity 
          style={styles.floatingBtn} 
          onPress={() => setShowAddProduct(true)}
        >
          <Text style={styles.floatingBtnText}>+</Text>
        </TouchableOpacity>
      </ImageBackground>
      
      {selectedProduct && (
        <EditProduct
          product={selectedProduct}
          visible={showEditProduct}
          onClose={() => {
            setShowEditProduct(false);
            setSelectedProduct(null);
          }}
          onProductUpdated={handleProductUpdated}
        />
      )}
      
      <ProductDetailModal
        visible={showProductDetail}
        onClose={() => {
          setShowProductDetail(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        shop={{ username: 'Ma Boutique' }}
      />
    </View>
  );
}

export default ProductList;
