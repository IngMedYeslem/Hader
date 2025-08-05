import { useQuery } from "@apollo/client";
import { Text, View, Image, ScrollView, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { GET_PRODUCTS } from "../graphql/getProducts";
import Navbar from "./Navbar";
import AddProduct from "./AddProduct";
import styles from "./styles";
import { useState } from 'react';

const { width } = Dimensions.get('window');
const itemWidth = (width - 60) / 2;

function ProductList() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { loading, error, data } = useQuery(GET_PRODUCTS);

  if (showAddProduct) {
    return <AddProduct onBack={() => setShowAddProduct(false)} />;
  }

  if (loading) return <Text style={styles.loadingText}>Chargement...</Text>;
  if (error) return <Text style={styles.errorText}>Erreur : {error.message}</Text>;

  return (
    <View style={styles.wrapper}>
      <Navbar />
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
            {data.products.map((product) => (
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
    </View>
  );
}

export default ProductList;
