import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import styles from './styles';

const MediaPicker = ({ onMediaSelected, maxImages = 5, maxVideos = 2 }) => {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

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
      onMediaSelected({ images: newImages, videos });
    }
  };

  const pickVideo = async () => {
    if (videos.length >= maxVideos) {
      Alert.alert('Limite atteinte', `Maximum ${maxVideos} vidéos`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      videoMaxDuration: 30,
      quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    });

    if (!result.canceled) {
      const newVideos = [...videos, result.assets[0].uri];
      setVideos(newVideos);
      onMediaSelected({ images, videos: newVideos });
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onMediaSelected({ images: newImages, videos });
  };

  const removeVideo = (index) => {
    const newVideos = videos.filter((_, i) => i !== index);
    setVideos(newVideos);
    onMediaSelected({ images, videos: newVideos });
  };

  return (
    <View style={styles.mediaPicker}>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
          <Text style={styles.buttonText}>📷 Photo ({images.length}/{maxImages})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaButton} onPress={pickVideo}>
          <Text style={styles.buttonText}>🎥 Vidéo ({videos.length}/{maxVideos})</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mediaGrid}>
        {images.map((uri, index) => (
          <View key={`img-${index}`} style={styles.mediaItem}>
            <Image source={{ uri }} style={styles.mediaPreview} />
            <TouchableOpacity 
              style={styles.removeButton} 
              onPress={() => removeImage(index)}
            >
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        {videos.map((uri, index) => (
          <View key={`vid-${index}`} style={styles.mediaItem}>
            <Video
              source={{ uri }}
              style={styles.mediaPreview}
              useNativeControls
              resizeMode="contain"
              shouldPlay={false}
            />
            <TouchableOpacity 
              style={styles.removeButton} 
              onPress={() => removeVideo(index)}
            >
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

export default MediaPicker;