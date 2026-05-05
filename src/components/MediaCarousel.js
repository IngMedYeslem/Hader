import React, { useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity, Text } from 'react-native';
import { getMediaUrl } from '../services/api';
import styles from './styles';

export default function MediaCarousel({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const allMedia = images
    .filter(i => i && i.trim() && !i.startsWith('file://'))
    .map(i => ({ uri: getMediaUrl(i) }));

  if (allMedia.length === 0) {
    return (
      <View style={styles.placeholderImageLarge}>
        <Text style={styles.placeholderTextLarge}>📷</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.productImageLarge}>
        <Image
          source={{ uri: allMedia[currentIndex].uri }}
          style={styles.modalImage}
          resizeMode="cover"
        />
        {allMedia.length > 1 && (
          <View style={styles.mediaCounter}>
            <Text style={styles.mediaCounterText}>{currentIndex + 1} / {allMedia.length}</Text>
          </View>
        )}
      </View>

      {allMedia.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.mediaThumbnails}
          contentContainerStyle={styles.thumbnailsContainer}
        >
          {allMedia.map((media, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.thumbnail, currentIndex === index && styles.thumbnailActive]}
              onPress={() => setCurrentIndex(index)}
            >
              <Image source={{ uri: media.uri }} style={styles.thumbnailImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
