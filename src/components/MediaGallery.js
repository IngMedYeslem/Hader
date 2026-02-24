import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ScrollView, Dimensions, Platform, Linking, Alert } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { getMediaUrl } from '../services/api';
import { useTranslation } from '../translations';
import styles from './styles';

const { width } = Dimensions.get('window');

function MediaGallery({ images = [], videos = [], visible, onClose, productName, productPrice, shop }) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  // Combiner vidéos et images avec URLs complètes (vidéos en premier)
  const allMedia = [
    ...videos.map(v => ({ type: 'video', uri: getMediaUrl(v) })), 
    ...images.map(i => ({ type: 'image', uri: getMediaUrl(i) }))
  ];
  const currentMedia = allMedia[currentIndex] || { type: 'image', uri: '' };
  
  console.log('🎬 MediaGallery - Médias:', allMedia.length);
  console.log('🎬 Média actuel:', currentMedia);
  
  const player = useVideoPlayer(currentMedia.type === 'video' ? currentMedia.uri : '', (player) => {
    player.loop = true;
    player.muted = false;
  });

  const handleWhatsApp = () => {
    if (shop?.whatsapp) {
      const message = `${t('whatsappMessage')} ${productName} (${productPrice} MRU)`;
      const url = `whatsapp://send?phone=${shop.whatsapp}&text=${encodeURIComponent(message)}`;
      Linking.openURL(url).catch(() => {
        Alert.alert(t('error'), t('whatsappNotInstalled'));
      });
    }
  };

  const handleCall = () => {
    if (shop?.phone) {
      Linking.openURL(`tel:${shop.phone}`);
    }
  };


  
  if (allMedia.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.galleryOverlay}>
        <View style={[styles.galleryHeader, { backgroundColor: 'rgba(44, 62, 80, 0.95)', paddingVertical: 20 }]}>
          <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: 'rgba(200, 165, 95, 0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, alignSelf: 'flex-start', marginBottom: 8 }}>
              <Text style={{ fontSize: 20, color: '#C8A55F', fontWeight: 'bold' }}>
                {productName}
              </Text>
            </View>
            {productPrice && (
              <Text style={{ fontSize: 18, color: '#ff6b35', fontWeight: 'bold', marginBottom: 5 }}>
                {productPrice} MRU
              </Text>
            )}
            {shop && (
              <View style={{ backgroundColor: 'rgba(200, 165, 95, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, alignSelf: 'flex-start' }}>
                <Text style={{ fontSize: 14, color: '#C8A55F', fontWeight: '600' }}>
                  🏦 {shop.username}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
            <Text style={[styles.closeBtnText, { color: 'white', fontSize: 18 }]}>✕</Text>
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
                    <View style={{ flex: 1 }}>
                      <VideoView
                        player={player}
                        style={{ width: '100%', height: 250 }}
                        allowsFullscreen={false}
                        allowsPictureInPicture={false}
                        contentFit="contain"
                        nativeControls
                      />
                    </View>
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
                  <View style={{ flex: 1 }}>
                    {index === currentIndex ? (
                      <View style={{ position: 'relative' }}>
                        <VideoView
                          player={player}
                          style={{ width: '100%', height: 250 }}
                          allowsFullscreen={false}
                          allowsPictureInPicture={false}
                          contentFit="contain"
                          nativeControls
                        />

                      </View>
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

        <View style={{ position: 'absolute', bottom: 90, alignSelf: 'center', alignItems: 'center' }}>
          <View style={[styles.imageIndicators, { backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, marginBottom: 15 }]}>
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

        {shop && (
          <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
              {shop.whatsapp && (
                <TouchableOpacity 
                  style={[styles.contactBtn, { flex: 1, maxWidth: 150 }]} 
                  onPress={handleWhatsApp}
                >
                  <Text style={styles.contactBtnText}>📱 WhatsApp</Text>
                </TouchableOpacity>
              )}
              
              {shop.phone && (
                <TouchableOpacity 
                  style={[styles.contactBtn, styles.callBtn, { flex: 1, maxWidth: 150 }]} 
                  onPress={handleCall}
                >
                  <Text style={styles.contactBtnText}>📞 Appeler</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

      </View>
    </Modal>
  );
}

export default MediaGallery;