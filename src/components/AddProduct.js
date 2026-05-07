import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, Platform, KeyboardAvoidingView, Animated, Dimensions } from 'react-native';
import SimpleNavbar from './SimpleNavbar';
import styles from './styles';
import { useTranslation, isCurrentLanguageRTL } from '../translations';
import { RTLTextInput, RTLFormField } from './RTLInput';
import { RTLView, RTLText } from './RTLComponents';
import { imageService } from '../services/imageService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function AddProduct({ onBack, onAdd }) {
  const [products, setProducts] = useState([{ name: '', description: '', price: '', category: '', stock: '', images: [] }]);
  const { t, currentLanguage } = useTranslation();
  const slideAnim = useState(new Animated.Value(300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [updateKey, setUpdateKey] = useState(0);

  const CATEGORIES = [
    { id: 'food', icon: '🍔' },
    { id: 'grocery', icon: '🛒' },
    { id: 'pharmacy', icon: '💊' },
    { id: 'electronics', icon: '📱' },
    { id: 'fashion', icon: '👗' },
    { id: 'other', icon: '📦' },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Force re-render when language changes
  useEffect(() => {
    console.log('📝 AddProduct: Language changed to', currentLanguage);
    setUpdateKey(prev => prev + 1);
  }, [currentLanguage]);

  const addProductField = () => {
    setProducts([...products, { name: '', description: '', price: '', category: '', stock: '', images: [] }]);
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

  const handleSubmit = async () => {
    try {
      for (const product of products) {
        if (product.name && product.price && onAdd) {
          // استخدام imageService لتحويل الصور
          const convertedImages = [];
          for (const img of product.images || []) {
            console.log('🔄 معالجة صورة:', img.substring(0, 50));
            const base64Img = await imageService.convertToBase64(img);
            if (base64Img && base64Img.startsWith('data:')) {
              convertedImages.push(base64Img);
              console.log('✅ صورة محولة بنجاح');
            } else {
              console.log('⚠️ فشل تحويل الصورة، استخدام الأصلية');
              convertedImages.push(img);
            }
          }
          
          await onAdd({
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            category: product.category,
            stock: parseInt(product.stock) || 0,
            images: convertedImages,
          });
        }
      }
      Alert.alert(t('success'), t('productsAdded'));
      setProducts([{ name: '', description: '', price: '', category: '', stock: '', images: [] }]);
      onBack();
    } catch (error) {
      Alert.alert(t('error'), error.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#FF6B35', paddingHorizontal: 16, paddingVertical: 14, paddingTop: Platform.OS === 'ios' ? 50 : 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={onBack}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 }}
          >
            <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>← {t('back')}</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>➕ {t('addProducts')}</Text>
          <View style={{ width: 60 }} />
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ transform: [{ translateY: slideAnim }], opacity: fadeAnim }}>
            {products.map((product, index) => (
              <View key={index} style={{ backgroundColor: 'white', borderRadius: 12, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#333' }}>📦 {t('product')} {index + 1}</Text>
                  {products.length > 1 && (
                    <TouchableOpacity onPress={() => removeProduct(index)}>
                      <Text style={{ color: '#f44336', fontSize: 20, fontWeight: 'bold' }}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                  
                  {/* Section Informations de base */}
                  <View style={{ marginBottom: 10 }}>
                    <RTLTextInput
                      style={[styles.addProductInput, { fontSize: 15, paddingVertical: 13, height: 50 }]}
                      placeholder={t('productName')}
                      placeholderTextColor="#aaa"
                      value={product.name}
                      onChangeText={(text) => updateProduct(index, 'name', text)}
                    />
                    <RTLTextInput
                      style={[styles.addProductInput, { fontSize: 15, paddingVertical: 13, minHeight: 60, textAlignVertical: 'top', marginBottom: 0 }]}
                      placeholder={t('description')}
                      placeholderTextColor="#aaa"
                      multiline
                      value={product.description}
                      onChangeText={(text) => updateProduct(index, 'description', text)}
                    />
                  </View>

                  {/* Section Prix et Stock */}
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                    <RTLTextInput
                      style={[styles.addProductInput, { flex: 1, fontSize: 15, paddingVertical: 13, height: 50, marginBottom: 0 }]}
                      placeholder={t('price')}
                      placeholderTextColor="#aaa"
                      keyboardType="numeric"
                      value={product.price}
                      onChangeText={(text) => updateProduct(index, 'price', text)}
                    />
                    <RTLTextInput
                      style={[styles.addProductInput, { flex: 1, fontSize: 15, paddingVertical: 13, height: 50, marginBottom: 0 }]}
                      placeholder={t('stock')}
                      placeholderTextColor="#aaa"
                      keyboardType="numeric"
                      value={product.stock}
                      onChangeText={(text) => updateProduct(index, 'stock', text)}
                    />
                  </View>

                  {/* Catégorie */}
                  <Text style={{ color: '#777', fontSize: 13, marginBottom: 6 }}>
                    {t('category')}
                  </Text>
                  <View key={`categories-${updateKey}`} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    {CATEGORIES.map(cat => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => updateProduct(index, 'category', cat.id)}
                        style={{
                          flexDirection: 'row', alignItems: 'center',
                          paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
                          backgroundColor: product.category === cat.id ? '#FF6B35' : 'rgba(255,107,53,0.08)',
                          borderWidth: 1,
                          borderColor: product.category === cat.id ? '#C8A55F' : 'rgba(255,107,53,0.2)',
                        }}
                      >
                        <Text style={{ fontSize: 14, marginRight: 4 }}>{cat.icon}</Text>
                        <Text style={{ fontSize: 12, color: product.category === cat.id ? 'white' : '#FF6B35', fontWeight: '600' }}>
                          {t(cat.id)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Photos */}
                  <TouchableOpacity
                    style={{ backgroundColor: '#FF6B35', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 10 }}
                    onPress={() => selectImage(index)}
                  >
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                      📷 {product.images?.length > 0 ? `${product.images.length} photos` : 'Ajouter photos'}
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
                
                  {/* Aperçu Images */}
                  {product.images && product.images.length > 0 && (
                    <View style={[styles.imageGrid, { marginBottom: 8 }]}>
                      {product.images.map((imageUri, imgIndex) => (
                        <View key={`img-${index}-${imgIndex}`} style={styles.imageWrapper}>
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

            <TouchableOpacity
              style={{ backgroundColor: '#FF6B35', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 }}
              onPress={addProductField}
            >
              <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>➕ {t('addAnother')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ backgroundColor: '#FF6B35', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
              onPress={handleSubmit}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>💾 {t('saveProducts')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default AddProduct;