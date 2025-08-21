import React, { useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity, Text, Platform } from 'react-native';
import { getMediaUrl } from '../services/api';
import styles from './styles';

const VideoPlayer = ({ uri, style }) => {
  if (Platform.OS === 'web') {
    return (
      <video 
        src={uri}
        style={style}
        controls
        preload="metadata"
      />
    );
  }
  
  const { VideoView, useVideoPlayer } = require('expo-video');
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = true;
  });
  
  return (
    <VideoView
      player={player}
      style={[style, { height: 250 }]}
      contentFit="contain"
      nativeControls
      allowsFullscreen
      allowsPictureInPicture
    />
  );
};

export default function MediaCarousel({ images = [], videos = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Combiner vidéos et images avec URLs complètes
  const allMedia = [
    ...videos.map(v => ({ type: 'video', uri: getMediaUrl(v) })), 
    ...images.map(i => ({ type: 'image', uri: getMediaUrl(i) }))
  ];
  
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