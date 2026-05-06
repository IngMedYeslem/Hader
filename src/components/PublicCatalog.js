import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { API_URL } from '../config/api';

const PublicCatalog = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/public`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      {item.images?.[0] && (
        <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      )}
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price} DH</Text>
      <Text style={styles.shopName}>{item.shopName}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return <View style={styles.center}><Text>Chargement...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  productCard: { flex: 1, margin: 8, backgroundColor: '#fff', borderRadius: 8, padding: 12 },
  productImage: { width: '100%', height: 150, borderRadius: 8 },
  productName: { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  productPrice: { fontSize: 14, color: '#2ecc71', marginTop: 4 },
  shopName: { fontSize: 12, color: '#7f8c8d', marginTop: 4 }
});

export default PublicCatalog;
