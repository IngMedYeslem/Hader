import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert, TextInput } from 'react-native';
import MediaManager from './MediaManager';
import styles from './styles';
import { useTranslation } from '../translations';
import { productAPI } from '../services/api';

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
      Alert.alert('Erreur', 'Le nom et le prix sont obligatoires');
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
      Alert.alert('Succès', 'Produit mis à jour');
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      Alert.alert('Erreur', `Impossible de mettre à jour le produit: ${error.message}`);
    }
  };

  const handleMediaDeleted = (mediaType, mediaIndex) => {
    setFormData(prev => ({
      ...prev,
      [mediaType]: prev[mediaType].filter((_, index) => index !== mediaIndex)
    }));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <View style={styles.galleryHeader}>
          <Text style={[styles.galleryTitle, { color: '#2C3E50' }]}>
            Éditer Produit
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeBtnText, { color: '#2C3E50' }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          <View style={styles.card}>
            <Text style={styles.authTitle}>Informations du produit</Text>
            
            <TextInput
              style={[styles.input, { marginBottom: 15 }]}
              placeholder="Nom du produit *"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            />
            
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top', marginBottom: 15 }]}
              placeholder="Description"
              multiline
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            />
            
            <TextInput
              style={[styles.input, { marginBottom: 15 }]}
              placeholder="Prix (MRU) *"
              keyboardType="numeric"
              value={formData.price}
              onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
            />
            
            <TextInput
              style={[styles.input, { marginBottom: 15 }]}
              placeholder="Catégorie"
              value={formData.category}
              onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
            />
            
            <TextInput
              style={[styles.input, { marginBottom: 20 }]}
              placeholder="Stock disponible"
              keyboardType="numeric"
              value={formData.stock}
              onChangeText={(text) => setFormData(prev => ({ ...prev, stock: text }))}
            />
            
            <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
              <Text style={styles.submitText}>💾 Sauvegarder</Text>
            </TouchableOpacity>
          </View>

          <MediaManager 
            product={{ ...product, images: formData.images, videos: formData.videos }}
            onMediaDeleted={handleMediaDeleted}
          />
        </ScrollView>
      </View>
    </Modal>
  );
};

export default EditProduct;