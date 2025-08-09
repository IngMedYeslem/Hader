import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import styles from './styles';

const { width } = Dimensions.get('window');

function MediaGallery({ images = [], videos = [], visible, onClose, productName }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  // Combiner vidéos et images (vidéos en premier)
  const allMedia = [...videos.map(v => ({ type: 'video', uri: v })), ...images.map(i => ({ type: 'image', uri: i }))];
  
  if (allMedia.length === 0) return null;

  const currentMedia = allMedia[currentIndex];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.galleryOverlay}>
        <View style={styles.galleryHeader}>
          <Text style={styles.galleryTitle}>{productName}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainImageContainer}>
          <TouchableOpacity 
            style={styles.singleImageContainer}
            onPress={() => {
              if (currentMedia.type === 'video') {
                // Activer les contrôles et lancer la vidéo
                setShowControls(true);
                setIsPlaying(true);
              } else if (allMedia.length > 1) {
                setCurrentIndex(prev => prev < allMedia.length - 1 ? prev + 1 : 0);
              }
            }}
            activeOpacity={0.9}
          >
            {currentMedia.type === 'video' ? (
              <View style={styles.mainImage}>
                {!videoLoaded && !videoError && (
                  <View style={[styles.mainImage, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', position: 'absolute', zIndex: 1 }]}>
                    <Text style={{ color: 'white', fontSize: 16 }}>Chargement vidéo...</Text>
                    <Text style={{ color: 'white', fontSize: 30, marginTop: 10 }}>🎥</Text>
                  </View>
                )}
                {videoError ? (
                  <View style={[styles.mainImage, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: 'white', fontSize: 16 }}>Erreur vidéo</Text>
                    <Text style={{ color: 'white', fontSize: 30, marginTop: 10 }}>⚠️</Text>
                  </View>
                ) : (
                  <Video
                    source={{ uri: currentMedia.uri }}
                    style={{ width: '100%', height: '100%' }}
                    useNativeControls={showControls}
                    resizeMode="contain"
                    shouldPlay={isPlaying && visible && videoLoaded}
                    isLooping={true}
                    isMuted={!showControls}
                    onPlaybackStatusUpdate={(status) => {
                      if (status.didJustFinish) {
                        setIsPlaying(false);
                      }
                    }}
                    onError={(error) => {
                      console.log('Erreur vidéo:', error);
                      setVideoError(true);
                      setVideoLoaded(false);
                    }}
                    onLoad={() => {
                      console.log('Vidéo chargée');
                      setVideoLoaded(true);
                      setVideoError(false);
                    }}
                    onLoadStart={() => {
                      console.log('Début chargement vidéo');
                      setVideoLoaded(false);
                      setVideoError(false);
                    }}
                  />
                )}
              </View>
            ) : (
              <Image 
                source={{ uri: currentMedia.uri }} 
                style={styles.mainImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
          
          <View style={styles.imageIndicators}>
            {allMedia.map((_, index) => (
              <TouchableOpacity
                key={`dot-${index}`}
                style={[
                  styles.indicator,
                  currentIndex === index && styles.activeIndicator
                ]}
                onPress={() => {
                  setCurrentIndex(index);
                  setVideoLoaded(false);
                  setVideoError(false);
                  setIsPlaying(false);
                  setShowControls(false);
                }}
              />
            ))}
          </View>
          
          <Text style={styles.imageCounter}>
            {currentMedia.type === 'video' ? '🎥 ' : ''}{currentIndex + 1} / {allMedia.length}
          </Text>
          

        </View>

        <ScrollView 
          horizontal 
          style={styles.thumbnailContainer}
          showsHorizontalScrollIndicator={false}
        >
          {allMedia.map((media, index) => (
            <TouchableOpacity 
              key={`thumb-${index}`}
              onPress={() => {
                if (index !== currentIndex) {
                  setCurrentIndex(index);
                  setVideoLoaded(false);
                  setVideoError(false);
                  setIsPlaying(false);
                  setShowControls(false);
                }
              }}
              style={[
                styles.thumbnail,
                currentIndex === index && styles.activeThumbnail
              ]}
            >
              {media.type === 'video' ? (
                <View style={[styles.thumbnailImage, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ color: 'white', fontSize: 16 }}>🎥</Text>
                </View>
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
      </View>
    </Modal>
  );
}

export default MediaGallery;