import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import MediaPicker from './MediaPicker';
import { productAPI } from '../services/api';
import styles from './styles';

const AddProductWithMedia = ({ shopId, onProductAdded }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [media, setMedia] = useState({ images: [], videos: [] });
  const [loading, setLoading] = useState(false);

  const handleMediaSelected = (selectedMedia) => {
    setMedia(selectedMedia);
  };

  const handleSubmit = async () => {
    if (!name || !price) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const product = {
        name,
        price: parseFloat(price),
        images: media.images,
        videos: media.videos,
        shopId
      };

      const result = await productAPI.create(product);
      Alert.alert('Succès', 'Produit ajouté avec succès');
      
      // Reset form
      setName('');
      setPrice('');
      setMedia({ images: [], videos: [] });
      
      if (onProductAdded) {
        onProductAdded(result);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le produit');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.addProductContainer}>
      <Text style={styles.addProductTitle}>Ajouter un Produit</Text>
      
      <View style={styles.productForm}>
        <TextInput
          style={styles.addProductInput}
          placeholder="Nom du produit"
          value={name}
          onChangeText={setName}
        />
        
        <TextInput
          style={styles.addProductInput}
          placeholder="Prix"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
        
        <MediaPicker 
          onMediaSelected={handleMediaSelected}
          maxImages={5}
          maxVideos={2}
        />
        
        <TouchableOpacity 
          style={[styles.submitBtn, loading && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? 'Ajout en cours...' : 'Ajouter le Produit'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AddProductWithMedia;