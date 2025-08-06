import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ImageBackground, Alert, Image, Platform } from 'react-native';
import SimpleNavbar from './SimpleNavbar';
import styles from './styles';
import { useTranslation } from '../translations';

function AddProduct({ onBack, onAdd }) {
  const [products, setProducts] = useState([{ name: '', price: '', images: null }]);
  const { t } = useTranslation();

  const addProductField = () => {
    setProducts([...products, { name: '', price: '', images: null }]);
  };

  const updateProduct = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const fileInputRefs = useRef([]);

  const selectImage = (index) => {
    if (Platform.OS === 'web') {
      // Pour ordinateur
      if (fileInputRefs.current[index]) {
        fileInputRefs.current[index].click();
      }
    } else {
      // Pour smartphone
      Alert.alert(
        t('selectImage'),
        t('chooseOption'),
        [
          { text: t('gallery'), onPress: () => pickFromGallery(index) },
          { text: t('camera'), onPress: () => pickFromCamera(index) },
          { text: t('cancel'), style: 'cancel' }
        ]
      );
    }
  };

  const handleFileSelect = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateProduct(index, 'images', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const pickFromGallery = async (index) => {
    try {
      const ImagePicker = require('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permissionRequired'), t('galleryAccess'));
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
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'accéder à la galerie');
    }
  };

  const pickFromCamera = async (index) => {
    try {
      const ImagePicker = require('expo-image-picker');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permissionRequired'), t('cameraAccess'));
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
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'accéder à la caméra');
    }
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    try {
      products.forEach(product => {
        if (product.name && product.price && onAdd) {
          onAdd({
            name: product.name,
            price: parseFloat(product.price),
            images: product.images
          });
        }
      });
      Alert.alert(t('success'), t('productsAdded'));
      setProducts([{ name: '', price: '', images: null }]);
      onBack();
    } catch (error) {
      Alert.alert(t('error'), error.message);
    }
  };

  return (
    <View style={styles.wrapper}>
      <SimpleNavbar />
      <ImageBackground 
        source={require('../../assets/b2.jpeg')} 
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.addProductContainer}>
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Text style={styles.backBtnText}>{t('back')}</Text>
            </TouchableOpacity>
            <Text style={styles.addProductTitle}>{t('addProducts')}</Text>
            
            {products.map((product, index) => (
              <View key={index} style={styles.productForm}>
                <View style={styles.formHeader}>
                  <Text style={styles.productNumber}>{t('product')} {index + 1}</Text>
                  {products.length > 1 && (
                    <TouchableOpacity onPress={() => removeProduct(index)}>
                      <Text style={styles.removeBtn}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                <TextInput
                  style={styles.addProductInput}
                  placeholder={t('productName')}
                  placeholderTextColor="#999"
                  value={product.name}
                  onChangeText={(text) => updateProduct(index, 'name', text)}
                />
                
                <TextInput
                  style={styles.addProductInput}
                  placeholder={t('price')}
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
                    {product.images ? t('imageSelected') : t('addImage')}
                  </Text>
                </TouchableOpacity>
                
                {Platform.OS === 'web' && (
                  <input
                    ref={el => fileInputRefs.current[index] = el}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileSelect(index, e)}
                  />
                )}
                
                {product.images && (
                  <Image 
                    source={{ uri: product.images }} 
                    style={styles.previewImage}
                  />
                )}
              </View>
            ))}
            
            <TouchableOpacity style={styles.addMoreBtn} onPress={addProductField}>
              <Text style={styles.addMoreText}>{t('addAnother')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>{t('saveProducts')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

export default AddProduct;