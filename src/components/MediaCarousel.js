import React, { useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity, Text, Platform } from 'react-native';
import styles from './styles';

const VideoPlayer = ({ uri, style }) => {
  if (Platform.OS === 'web') {
    return (
      <video 
        src={uri}
        style={style}
        controls
        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23000'/%3E%3Cpolygon points='40,30 40,70 70,50' fill='%23fff'/%3E%3C/svg%3E"
      />
    );
  }
  
  // Pour mobile, afficher un placeholder avec bouton play
  return (
    <View style={[style, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: 'white', fontSize: 60 }}>▶️</Text>
      <Text style={{ color: 'white', fontSize: 12, marginTop: 10 }}>Appuyez pour lire</Text>
    </View>
  );
};

export default function MediaCarousel({ images = [], videos = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Combiner vidéos et images, vidéos en premier
  const allMedia = [...videos.map(v => ({ type: 'video', uri: v })), ...images.map(i => ({ type: 'image', uri: i }))];
  
  if (allMedia.length === 0) {
    return (
      <View style={styles.placeholderImageLarge}>
        <Text style={styles.placeholderTextLarge}>📷</Text>
      </View>
    );
  }

  const currentMedia = allMedia[currentIndex];

  return (
    <View>
      <View style={styles.productImageLarge}>
        {currentMedia.type === 'video' ? (
          <VideoPlayer 
            uri={currentMedia.uri}
            style={styles.modalImage}
          />
        ) : (
          <Image 
            source={{ uri: currentMedia.uri }} 
            style={styles.modalImage}
            resizeMode="cover"
          />
        )}
        
        {allMedia.length > 1 && (
          <View style={styles.mediaCounter}>
            <Text style={styles.mediaCounterText}>
              {currentIndex + 1} / {allMedia.length}
            </Text>
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
              style={[
                styles.thumbnail,
                currentIndex === index && styles.thumbnailActive
              ]}
              onPress={() => setCurrentIndex(index)}
            >
              {media.type === 'video' ? (
                <VideoPlayer 
                  uri={media.uri}
                  style={styles.thumbnailImage}
                />
              ) : (
                <Image 
                  source={{ uri: media.uri }} 
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}