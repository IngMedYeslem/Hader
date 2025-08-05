import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ImageBackground, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from '@apollo/client';
import { ADD_PRODUCT } from '../graphql/addProduct';
import { GET_PRODUCTS } from '../graphql/getProducts';
import Navbar from './Navbar';
import styles from './styles';

function AddProduct({ onBack }) {
  const [products, setProducts] = useState([{ name: '', price: '', images: null }]);
  const [addProduct] = useMutation(ADD_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }]
  });

  const addProductField = () => {
    setProducts([...products, { name: '', price: '', images: null }]);
  };

  const updateProduct = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const selectImage = (index) => {
    Alert.alert(
      'Sélectionner une image',
      'Choisissez une option',
      [
        { text: 'Galerie', onPress: () => pickFromGallery(index) },
        { text: 'Appareil photo', onPress: () => pickFromCamera(index) },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const pickFromGallery = async (index) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Accès à la galerie nécessaire');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateProduct(index, 'images', result.assets[0].uri);
    }
  };

  const pickFromCamera = async (index) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Accès à l\'appareil photo nécessaire');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateProduct(index, 'images', result.assets[0].uri);
    }
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      for (const product of products) {
        if (product.name && product.price) {
          await addProduct({
            variables: {
              name: product.name,
              price: parseFloat(product.price),
              images: product.images || null
            }
          });
        }
      }
      Alert.alert('Succès', 'Produits ajoutés avec succès');
      setProducts([{ name: '', price: '', images: null }]);
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Navbar />
      <ImageBackground 
        source={require('../../assets/b2.jpeg')} 
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.addProductContainer}>
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Text style={styles.backBtnText}>← Retour</Text>
            </TouchableOpacity>
            <Text style={styles.addProductTitle}>Ajouter des Produits</Text>
            
            {products.map((product, index) => (
              <View key={index} style={styles.productForm}>
                <View style={styles.formHeader}>
                  <Text style={styles.productNumber}>Produit {index + 1}</Text>
                  {products.length > 1 && (
                    <TouchableOpacity onPress={() => removeProduct(index)}>
                      <Text style={styles.removeBtn}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                <TextInput
                  style={styles.addProductInput}
                  placeholder="Nom du produit"
                  placeholderTextColor="#999"
                  value={product.name}
                  onChangeText={(text) => updateProduct(index, 'name', text)}
                />
                
                <TextInput
                  style={styles.addProductInput}
                  placeholder="Prix (€)"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={product.price}
                  onChangeText={(text) => updateProduct(index, 'price', text)}
                />
                
                <TouchableOpacity 
                  style={styles.imagePickerBtn} 
                  onPress={() => selectImage(index)}
                >
                  <Text style={styles.imagePickerText}>
                    {product.images ? '✓ Image sélectionnée' : '📷 Ajouter une image'}
                  </Text>
                </TouchableOpacity>
                
                {product.images && (
                  <Image 
                    source={{ uri: product.images }} 
                    style={styles.previewImage}
                  />
                )}
              </View>
            ))}
            
            <TouchableOpacity style={styles.addMoreBtn} onPress={addProductField}>
              <Text style={styles.addMoreText}>+ Ajouter un autre produit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>Enregistrer les Produits</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

export default AddProduct;