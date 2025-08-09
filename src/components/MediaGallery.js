import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ScrollView, Dimensions, Platform } from 'react-native';
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

  const currentMedia = allMedia[currentIndex] || { type: 'image', uri: '' };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.galleryOverlay}>
        <View style={styles.galleryHeader}>
          <Text style={styles.galleryTitle}>{productName}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>



        {Platform.OS === 'web' ? (
          <View style={styles.mainImageContainer}>
            {/* Flèche gauche */}
            {allMedia.length > 1 && (
              <TouchableOpacity 
                style={{
                  position: 'absolute',
                  left: 20,
                  top: '50%',
                  zIndex: 10,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  borderRadius: 25,
                  width: 50,
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onPress={() => {
                  setCurrentIndex(prev => prev > 0 ? prev - 1 : allMedia.length - 1);
                  setVideoLoaded(false);
                  setVideoError(false);
                  setIsPlaying(false);
                  setShowControls(false);
                }}
              >
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>‹</Text>
              </TouchableOpacity>
            )}
            
            {/* Flèche droite */}
            {allMedia.length > 1 && (
              <TouchableOpacity 
                style={{
                  position: 'absolute',
                  right: 20,
                  top: '50%',
                  zIndex: 10,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  borderRadius: 25,
                  width: 50,
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                onPress={() => {
                  setCurrentIndex(prev => prev < allMedia.length - 1 ? prev + 1 : 0);
                  setVideoLoaded(false);
                  setVideoError(false);
                  setIsPlaying(false);
                  setShowControls(false);
                }}
              >
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>›</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.singleImageContainer}
              onPress={() => {
                if (currentMedia && currentMedia.type === 'video') {
                  setShowControls(true);
                  setIsPlaying(true);
                }
              }}
              activeOpacity={0.9}
            >
              {currentMedia && currentMedia.type === 'video' ? (
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
          </View>
        ) : (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const slideSize = event.nativeEvent.layoutMeasurement.width;
              const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
              if (index !== currentIndex && index >= 0 && index < allMedia.length) {
                setCurrentIndex(index);
                setVideoLoaded(false);
                setVideoError(false);
                setIsPlaying(false);
                setShowControls(false);
              }
            }}
          >
            {allMedia.map((media, index) => (
              <TouchableOpacity 
                key={`media-${index}`}
                style={[styles.singleImageContainer, { width }]}
                onPress={() => {
                  if (media.type === 'video' && index === currentIndex) {
                    setShowControls(true);
                    setIsPlaying(true);
                  }
                }}
                activeOpacity={0.9}
              >
                {media.type === 'video' ? (
                  <View style={styles.mainImage}>
                    {index === currentIndex ? (
                      <Video
                        source={{ uri: media.uri }}
                        style={{ width: '100%', height: '100%' }}
                        useNativeControls={showControls}
                        resizeMode="contain"
                        shouldPlay={index === currentIndex && isPlaying && visible && videoLoaded}
                        isLooping={true}
                        isMuted={!showControls}
                        onLoad={() => setVideoLoaded(true)}
                        onError={() => setVideoError(true)}
                      />
                    ) : (
                      <View style={{ width: '100%', height: '100%', backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: 'white', fontSize: 40 }}>🎥</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <Image 
                    source={{ uri: media.uri }} 
                    style={styles.mainImage}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={{ position: 'absolute', bottom: 60, alignSelf: 'center', alignItems: 'center' }}>
          <View style={[styles.imageIndicators, { backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, marginBottom: 10 }]}>
            {allMedia.map((_, index) => (
              <TouchableOpacity
                key={`dot-${index}`}
                style={[
                  {
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: currentIndex === index ? '#C8A55F' : 'rgba(255, 255, 255, 0.6)',
                    marginHorizontal: 8,
                    borderWidth: 2,
                    borderColor: currentIndex === index ? '#FFD700' : 'rgba(255, 255, 255, 0.9)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    elevation: 5
                  }
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
          <Text style={[styles.imageCounter, { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15 }]}>
            {currentMedia && currentMedia.type === 'video' ? '🎥 ' : ''}{currentIndex + 1} / {allMedia.length}
          </Text>
        </View>


      </View>
    </Modal>
  );
}

export default MediaGallery;