import { useQuery } from "@apollo/client";
import { Text, View, Image, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { GET_PRODUCTS } from "../graphql/getProducts";  // ✅ On importe la requête GraphQL
import Navbar from "./Navbar";  // Assure-toi que le chemin est correct

function ProductList() {
  const { loading, error, data } = useQuery(GET_PRODUCTS);

  if (loading) return <Text>Chargement...</Text>;
  if (error) return <Text>Erreur : {error.message}</Text>;

  return (
    <View style={styles.wrapper}>
      {/* ✅ Navbar en dehors du ScrollView */}
      <Navbar />

      {/* ✅ Image de fond placée autour du contenu */}
      <ImageBackground 
        source={require('../../assets/b2.jpeg')} 
        style={styles.background}
        resizeMode="cover"
      >
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
                {product.image && (
                  <Image 
                    source={{ uri: `http://localhost:4000/assets/${product.image}` }} 
                    style={styles.productImage} 
                  />
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </ImageBackground>
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
    backgroundColor: "rgba(255, 255, 255, 0.0)", // ✅ Amélioration pour une meilleure lisibilité
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
  background: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    height: "100%", 
  },
});

export default ProductList;
