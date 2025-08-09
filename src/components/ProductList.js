import { Text, View, Image, ScrollView, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import SimpleNavbar from "./SimpleNavbar";
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
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
          <View style={styles.alibabaGrid}>
            {products.map((product) => (
              <TouchableOpacity 
                key={product.id} 
                style={[styles.alibabaCard, { width: itemWidth }]}
                onLongPress={() => handleEditProduct(product)}
              >
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
                  <Text style={styles.alibabaProductName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.alibabaPrice}>{product.price} €</Text>
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
    </View>
  );
}

export default ProductList;
