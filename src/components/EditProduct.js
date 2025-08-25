import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, ImageBackground, KeyboardAvoidingView, Platform, Animated, Dimensions } from 'react-native';
import MediaManager from './MediaManager';
import styles from './styles';
import { useTranslation } from '../translations';
import { productAPI } from '../services/api';
import { RTLTextInput } from './RTLInput';
import { showAlert } from '../utils/alert';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const EditProduct = ({ product, visible, onClose, onProductUpdated }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [],
    videos: []
  });
  const slideAnim = useState(new Animated.Value(300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    if (product) {
      console.log('=== Produit reçu ===');
      console.log('Produit complet:', product);
      console.log('Nom:', product.name);
      console.log('Description:', product.description);
      console.log('Prix:', product.price);
      console.log('Catégorie:', product.category);
      console.log('Stock:', product.stock);
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        stock: product.stock?.toString() || '',
        images: product.images || [],
        videos: product.videos || []
      });
    }
  }, [product]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.price.trim()) {
      showAlert('Erreur', 'Le nom et le prix sont obligatoires');
      return;
    }

    try {
      console.log('=== Sauvegarde ===');
      console.log('FormData:', formData);
      
      const updatedProduct = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        category: formData.category.trim(),
        stock: parseInt(formData.stock) || 0,
        images: formData.images,
        videos: formData.videos
      };
      
      console.log('Produit à envoyer:', updatedProduct);

      const result = await productAPI.update(product._id, updatedProduct);
      console.log('Résultat API:', result);
      
      onProductUpdated({ ...product, ...updatedProduct });
      showAlert('Succès', 'Produit mis à jour');
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showAlert('Erreur', `Impossible de mettre à jour le produit: ${error.message}`);
    }
  };

  const handleMediaDeleted = (mediaType, mediaIndex) => {
    setFormData(prev => ({
      ...prev,
      [mediaType]: prev[mediaType].filter((_, index) => index !== mediaIndex)
    }));
  };

  const handleDelete = () => {
    showAlert(
      'Confirmer la suppression',
      'Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              await productAPI.delete(product._id);
              showAlert('Succès', 'Produit supprimé');
              onProductUpdated(null); // Signal pour supprimer de la liste
              onClose();
            } catch (error) {
              console.error('Erreur suppression:', error);
              showAlert('Erreur', `Impossible de supprimer le produit: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="none" presentationStyle="pageSheet">
      <View style={[styles.wrapper, styles.shopLoginContainer, { minHeight: screenHeight }]}>
        <ImageBackground 
          source={require('../../assets/b2.jpeg')} 
          style={styles.background}
          resizeMode="cover"
        >
          <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <ScrollView 
              contentContainerStyle={[styles.shopLoginScrollContent, { 
                justifyContent: 'flex-start',
                paddingBottom: Platform.OS === 'android' ? 50 : 20,
                paddingTop: 60
              }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              enableOnAndroid={true}
            >
              <Animated.View style={[
                styles.shopLoginFormCard,
                {
                  transform: [{ translateY: slideAnim }],
                  opacity: fadeAnim
                }
              ]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text style={[styles.authTitle, { fontSize: 18, marginBottom: 0 }]}>
                    📝 Éditer Produit
                  </Text>
                  <TouchableOpacity onPress={onClose}>
                    <Text style={[styles.closeBtnText, { color: '#2C3E50', fontSize: 24 }]}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Section Informations de base */}
                <View style={{ backgroundColor: 'rgba(200, 165, 95, 0.1)', padding: 8, borderRadius: 8, marginBottom: 8 }}>
                  <RTLTextInput
                    style={[styles.addProductInput, { fontSize: 16, paddingVertical: 15, height: 50 }]}
                    placeholder="Nom du produit *"
                    placeholderTextColor="#999"
                    value={formData.name}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  />
                  
                  <RTLTextInput
                    style={[styles.addProductInput, { 
                      fontSize: 16, 
                      paddingVertical: 15,
                      minHeight: 60,
                      textAlignVertical: 'top',
                      marginBottom: 0
                    }]}
                    placeholder="Description"
                    placeholderTextColor="#999"
                    multiline
                    value={formData.description}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  />
                </View>
                
                {/* Section Prix et Stock */}
                <View style={{ backgroundColor: 'rgba(200, 165, 95, 0.1)', padding: 8, borderRadius: 8, marginBottom: 8 }}>
                  <RTLTextInput
                    style={[styles.addProductInput, { fontSize: 16, paddingVertical: 15, height: 50 }]}
                    placeholder="Prix (MRU) *"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={formData.price}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                  />
                  
                  <RTLTextInput
                    style={[styles.addProductInput, { fontSize: 16, paddingVertical: 15, height: 50, marginBottom: 0 }]}
                    placeholder="Stock disponible"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={formData.stock}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, stock: text }))}
                  />
                </View>
                
                {/* Section Catégorie */}
                <View style={{ backgroundColor: 'rgba(200, 165, 95, 0.1)', padding: 8, borderRadius: 8, marginBottom: 15 }}>
                  <RTLTextInput
                    style={[styles.addProductInput, { fontSize: 16, paddingVertical: 15, height: 50, marginBottom: 0 }]}
                    placeholder="Catégorie"
                    placeholderTextColor="#999"
                    value={formData.category}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
                  />
                </View>
                
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 15 }}>
                  <TouchableOpacity 
                    style={[styles.submitBtn, { 
                      paddingVertical: 12,
                      borderRadius: 8,
                      flex: 1
                    }]} 
                    onPress={handleSave}
                  >
                    <Text style={[styles.submitText, { fontSize: 18 }]}>
                      💾 Sauvegarder
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.submitBtn, { 
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: '#e74c3c',
                      flex: 1
                    }]} 
                    onPress={handleDelete}
                  >
                    <Text style={[styles.submitText, { fontSize: 18 }]}>
                      🗑️ Supprimer
                    </Text>
                  </TouchableOpacity>
                </View>

                <MediaManager 
                  product={{ ...product, images: formData.images, videos: formData.videos }}
                  onMediaDeleted={handleMediaDeleted}
                />
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </View>
    </Modal>
  );
};

export default EditProduct;