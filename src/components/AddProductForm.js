import React, { useState } from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { TextInput, Button, Snackbar, ActivityIndicator } from "react-native-paper";
import { useMutation } from "@apollo/client";
import { ADD_PRODUCT } from "../graphql/addProducts";
import { GET_PRODUCTS } from "../graphql/getProducts";
import Navbar from "./Navbar";

const AddProductForm = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarError, setSnackbarError] = useState(false);

  const [addProduct, { loading }] = useMutation(ADD_PRODUCT, {
    refetchQueries: [GET_PRODUCTS],
    onCompleted: () => {
      setSnackbarMessage("Produit ajouté avec succès !");
      setSnackbarError(false);
      setSnackbarVisible(true);
      setName("");
      setPrice("");
      setImage("");
    },
    onError: (error) => {
      setSnackbarMessage(error.message);
      setSnackbarError(true);
      setSnackbarVisible(true);
    },
  });

  const handleAddProduct = () => {
    if (!name.trim() || !price.trim()) {
      setSnackbarMessage("Le nom et le prix sont obligatoires !");
      setSnackbarError(true);
      setSnackbarVisible(true);
      return;
    }

    addProduct({
      variables: {
        name,
        price: parseFloat(price),
        image: image.trim() || null,
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Navbar />
      <ImageBackground source={require("../../assets/b2.jpeg")} style={styles.background} resizeMode="cover">
        <View style={styles.container}>
          <Text style={styles.title}>Ajouter un produit</Text>
          <TextInput
            label="Nom du produit"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Prix"
            value={price}
            onChangeText={setPrice}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Image (URL)"
            value={image}
            onChangeText={setImage}
            mode="outlined"
            style={styles.input}
          />
          <Button mode="contained" onPress={handleAddProduct} loading={loading} disabled={loading} style={styles.button}>
            Ajouter
          </Button>
          {loading && <ActivityIndicator animating={true} color="#6200ee" style={styles.loader} />}
        </View>
      </ImageBackground>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={snackbarError ? styles.snackbarError : styles.snackbarSuccess}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    height: "100%", 
  },
  container: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 20,
    borderRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    color: "#005bb5",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: 'bold'
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#005bb5"
  },
  loader: {
    marginTop: 10,
  },
  snackbarSuccess: {
    backgroundColor: "green",
  },
  snackbarError: {
    backgroundColor: "red",
  },
});

export default AddProductForm;
