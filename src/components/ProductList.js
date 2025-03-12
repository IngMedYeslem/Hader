import { useQuery, gql } from "@apollo/client";
import { Text, View, Image, StyleSheet, ScrollView } from 'react-native';
import { GET_PRODUCTS } from "../graphql/getProducts";  // ✅ On importe la requête depuis queries.js
import Navbar from "./Navbar";  // Assure-toi que le chemin est correct


function ProductList() {
  const { loading, error, data } = useQuery(GET_PRODUCTS);

  if (loading) return <Text>Chargement...</Text>;
  if (error) return <Text>Erreur : {error.message}</Text>;

  return (
    <View style={{ flex: 1 }}>
    {/* ✅ Intégration correcte de Navbar */}
    <Navbar />

  {/* ✅ Activation du défilement */}
  <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        
            <View style={styles.container}>
      {data.products.map((product) => (
        
        <View key={product.id} style={styles.productCard}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text>Prix: {product.price} €</Text>
          
         {product.image && <Image source={{ uri: `http://localhost:4000/assets/${product.image}` }} style={styles.productImage} />} 

        </View>
      ))}
    </View>
    </ScrollView>

    </View>

  );
}
const styles = StyleSheet.create({
  wrapper: {
    flex: 1, 
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1, 
    paddingBottom: 20, // Ajout d'un espace en bas
  },
  container: {
    padding: 10,
  },
  productCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  productImage: {
    width: 100,
    height: 100,
    marginTop: 5,
  },
});

export default ProductList;
