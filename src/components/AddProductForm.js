import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import { useMutation } from "@apollo/client";
import { ADD_PRODUCT } from "../graphql/addProducts";  // ✅ On importe la requête depuis addProducts.js
import { GET_PRODUCTS } from "../graphql/getProducts";  // ✅ On importe la requête depuis queries.js
import Navbar from "./Navbar";  // Assure-toi que le chemin est correct




const AddProductForm = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");

  // Utilisation de la mutation
  const [addProduct, { data, loading, error }] = useMutation(ADD_PRODUCT, {
    refetchQueries: [GET_PRODUCTS], // Rafraîchir la liste après ajout
  });

  const handleAddProduct = () => {
    if (!name || !price) {
      alert("Le nom et le prix sont obligatoires !");
      return;
    }

    addProduct({
      variables: {
        name,
        price: parseFloat(price),
        image: image || null,
      },
    })
      .then(() => {
        alert("Produit ajouté avec succès !");
        setName("");
        setPrice("");
        setImage("");
      })
      .catch((err) => alert("Erreur : " + err.message));
  };

  return (

  <View style={{ flex: 1 }}>
    {/* ✅ Intégration correcte de Navbar */}
    <Navbar />


    <View style={styles.container}>
      <Text style={styles.label}>Nom du produit :</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nom"
      />

      <Text style={styles.label}>Prix :</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Prix"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Image (URL) :</Text>
      <TextInput
        style={styles.input}
        value={image}
        onChangeText={setImage}
        placeholder="URL de l'image"
      />

      <Button title="Ajouter" onPress={handleAddProduct} disabled={loading} />

      {loading && <Text>Ajout en cours...</Text>}
      {error && <Text style={styles.error}>Erreur : {error.message}</Text>}
      {data && <Text style={styles.success}>Produit ajouté avec succès !</Text>}
      </View>
      </View>    
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontWeight: "bold", marginBottom: 5 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  error: { color: "red" },
  success: { color: "green" },
});

export default AddProductForm;
