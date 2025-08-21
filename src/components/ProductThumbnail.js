import React, { useState } from 'react';
import { View, Image, Text, Platform, TouchableOpacity, Modal } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { getMediaUrl } from '../services/api';
import styles from './styles';

const ProductThumbnail = ({ product, style }) => {
  const [fullscreen, setFullscreen] = useState(false);
  
  // Nettoyer et valider les données
  const videos = Array.isArray(product.videos) ? product.videos.filter(v => v && v.trim() && !v.startsWith('file://')) : [];
  const images = Array.isArray(product.images) ? product.images.filter(i => i && i.trim() && !i.startsWith('file://')) : [];
  
  const hasVideos = videos.length > 0;
  const hasImages = images.length > 0;
  const firstVideo = hasVideos ? getMediaUrl(videos[0]) : null;
  const firstImage = hasImages ? getMediaUrl(images[0]) : null;
  const totalMedia = videos.length + images.length;

  const player = useVideoPlayer(
    hasVideos ? firstVideo : null,
    (player) => {
      if (player) {
        player.loop = true;
        player.muted = true;
        player.play();
      }
    }
  );

  return (
    <View style={style}>
      {hasVideos && firstVideo ? (
        <View style={styles.alibabaImage}>
          {Platform.OS === 'web' ? (
            <video
              src={firstVideo}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              controls
              muted
              autoPlay
              loop
            />
          ) : (
            <>
              <View>
                <VideoView
                  style={{ width: '100%', height: '100%' }}
                  player={player}
                  contentFit="cover"
                  nativeControls={false}
                />
              </View>
              
              <Modal visible={fullscreen} animationType="slide">
                <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}>
                  <VideoView
                    style={{ width: '100%', height: '100%' }}
                    player={player}
                    contentFit="contain"
                    nativeControls={true}
                  />
                  <TouchableOpacity 
                    onPress={() => setFullscreen(false)}
                    style={{
                      position: 'absolute',
                      top: 24,
                      right: 18,
                      padding: 10,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      borderRadius: 20,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 18 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            </>
          )}
          
          <View style={[styles.imageCount, { top: 5, right: 5, bottom: 'auto' }]}>
            <Text style={styles.imageCountText}>🎥</Text>
          </View>
        </View>
      ) : hasImages && firstImage ? (
        <View style={styles.alibabaImage}>
          <Image 
            source={{ uri: firstImage }} 
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
      ) : (
        <View style={[styles.alibabaImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>📷</Text>
        </View>
      )}
      
      {totalMedia > 1 && (
        <View style={styles.imageCount}>
          <Text style={styles.imageCountText}>+{totalMedia - 1}</Text>
        </View>
      )}
    </View>
  );
};

export default ProductThumbnail;