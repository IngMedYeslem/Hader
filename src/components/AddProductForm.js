import React, { useState } from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { TextInput, Button, Snackbar, ActivityIndicator } from "react-native-paper";
import { useMutation } from "@apollo/client";
import { ADD_PRODUCT } from "../graphql/addProducts";
import { GET_PRODUCTS } from "../graphql/getProducts";
import Navbar from "./Navbar";
import { useTranslation } from "react-i18next";  // Importer la traduction
import { launchImageLibrary } from "react-native-image-picker";
import axios from 'axios';
import styles from "./styles";  // Importer les styles

const AddProductForm = () => {
  const { t } = useTranslation(); // Hook de traduction
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarError, setSnackbarError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [addProduct] = useMutation(ADD_PRODUCT, {
    refetchQueries: [GET_PRODUCTS],
    onCompleted: () => {
      setSnackbarMessage(t("Produit ajouté avec succès !"));
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

  const handleChooseImage = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 800,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('Image selection cancelled');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri };
        setImage(source.uri);
      }
    });
  };

  const uploadImage = async (uri) => {
    const data = new FormData();
    data.append('image', {
      uri,
      type: 'image/jpeg',
      name: 'product-image.jpg',
    });

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImage(response.data.imageUrl); // Mettre à jour l'URL de l'image
      setLoading(false);
    } catch (error) {
      console.error('Image upload failed:', error);
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (!name.trim() || !price.trim()) {
      setSnackbarMessage(t("Le nom et le prix sont obligatoires !"));
      setSnackbarError(true);
      setSnackbarVisible(true);
      return;
    }

    if (image) {
      uploadImage(image); // Upload de l'image avant d'ajouter le produit
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
          <Text style={styles.title}>{t("AjouterProd")}</Text>
          <TextInput
            label={t("NomProduit")}
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label={t("Prix")}
            value={price}
            onChangeText={setPrice}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          <Button mode="contained" onPress={handleChooseImage} style={styles.button}>
            {t("Choisir une image")}
          </Button>
          <TextInput
            label={t("Image (URL)")}
            value={image}
            onChangeText={setImage}
            mode="outlined"
            style={styles.input}
            editable={false} // L'utilisateur ne modifie pas l'URL manuellement
          />
          <Button mode="contained" onPress={handleAddProduct} loading={loading} disabled={loading} style={styles.button}>
            {t("AjouterProd")}
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

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     justifyContent: "center",
//     width: "100%",
//     height: "100%",
//   },
//   container: {
//     padding: 20,
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     marginHorizontal: 20,
//     borderRadius: 10,
//     elevation: 5,
//   },
//   title: {
//     fontSize: 35,
//     color: "rgba(4, 66, 200, 0.9)",
//     marginBottom: 20,
//     textAlign: "center",
//     fontWeight: "bold",
//     textShadowColor: "rgba(0, 0, 0, 0.9)",
//     textShadowOffset: { width: 3, height: 3 },
//     textShadowRadius: 5,
//   },
//   input: {
//     marginBottom: 15,
//     borderRadius: 100,
//   },
//   button: {
//     marginTop: 10,
//     backgroundColor: "#005bb5",
//   },
//   loader: {
//     marginTop: 10,
//   },
//   snackbarSuccess: {
//     backgroundColor: "green",
//   },
//   snackbarError: {
//     backgroundColor: "red",
//   },
// });

export default AddProductForm;
