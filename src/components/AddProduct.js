import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ImageBackground, Alert, Image, Platform } from 'react-native';
import SimpleNavbar from './SimpleNavbar';
import styles from './styles';
import { useTranslation } from '../translations';

function AddProduct({ onBack, onAdd }) {
  const [products, setProducts] = useState([{ name: '', price: '', images: [] }]);
  const { t } = useTranslation();

  const addProductField = () => {
    setProducts([...products, { name: '', price: '', images: [] }]);
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
    const files = Array.from(event.target.files);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const updated = [...products];
        if (!updated[index].images) updated[index].images = [];
        updated[index].images.push(e.target.result);
        setProducts(updated);
      };
      reader.readAsDataURL(file);
    });
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
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const updated = [...products];
        if (!updated[index].images) updated[index].images = [];
        result.assets.forEach(asset => {
          updated[index].images.push(asset.uri);
        });
        setProducts(updated);
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
        const updated = [...products];
        if (!updated[index].images) updated[index].images = [];
        updated[index].images.push(result.assets[0].uri);
        setProducts(updated);
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
      setProducts([{ name: '', price: '', images: [] }]);
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
                    {product.images && product.images.length > 0 
                      ? `${product.images.length} ${t('imageSelected')}` 
                      : t('addImage')}
                  </Text>
                </TouchableOpacity>
                
                {Platform.OS === 'web' && (
                  <input
                    ref={el => fileInputRefs.current[index] = el}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileSelect(index, e)}
                  />
                )}
                
                {product.images && product.images.length > 0 && (
                  <View style={styles.imageGrid}>
                    {product.images.map((imageUri, imgIndex) => (
                      <View key={`${index}-${imgIndex}-${Date.now()}`} style={styles.imageWrapper}>
                        <Image 
                          source={{ uri: imageUri }} 
                          style={styles.previewImage}
                        />
                        <TouchableOpacity 
                          style={styles.removeImageBtn}
                          onPress={() => {
                            const updated = [...products];
                            updated[index].images.splice(imgIndex, 1);
                            setProducts(updated);
                          }}
                        >
                          <Text style={styles.removeImageText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
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