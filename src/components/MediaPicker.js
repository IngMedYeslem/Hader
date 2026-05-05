import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import styles from './styles';

const MediaPicker = ({ onMediaSelected, maxImages = 5 }) => {
  const [images, setImages] = useState([]);

  const pickImage = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Limite atteinte', `Maximum ${maxImages} images`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = [...images, result.assets[0].uri];
      setImages(newImages);
      onMediaSelected({ images: newImages });
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onMediaSelected({ images: newImages });
  };

  return (
    <View style={styles.mediaPicker}>
      <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
        <Text style={styles.buttonText}>📷 Photo ({images.length}/{maxImages})</Text>
      </TouchableOpacity>

      <View style={styles.mediaGrid}>
        {images.map((uri, index) => (
          <View key={`img-${index}`} style={styles.mediaItem}>
            <Image source={{ uri }} style={styles.mediaPreview} />
            <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

export default MediaPicker;
