import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, ScrollView, Platform, Dimensions, Linking, Alert } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { getMediaUrl } from '../services/api';
import styles from './styles';

const { width } = Dimensions.get('window');

const ProductDetailModal = ({ visible, onClose, product, shop }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  
  const videos = product ? (Array.isArray(product.videos) ? product.videos.filter(v => v && v.trim()) : []) : [];
  const images = product ? (Array.isArray(product.images) ? product.images.filter(i => i && i.trim()) : []) : [];
  const allMedia = [...videos.map(v => ({ type: 'video', uri: getMediaUrl(v) })), ...images.map(i => ({ type: 'image', uri: getMediaUrl(i) }))];
  
  const currentMedia = allMedia[currentIndex];
  
  const player = useVideoPlayer(
    currentMedia?.type === 'video' ? currentMedia.uri : null,
    (player) => {
      if (player && currentMedia?.type === 'video') {
        player.loop = true;
        player.muted = true;
        player.play();
      }
    }
  );
  
  // Réinitialiser l'index quand le modal s'ouvre
  useEffect(() => {
    if (visible && product) {
      setCurrentIndex(0);
    }
  }, [visible, product]);
  
  if (!product) return null;

  return (
    <Modal 
      visible={visible} 
      animationType={Platform.OS === 'android' ? 'fade' : 'slide'} 
      transparent
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <View style={{ 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.95)',
        ...(Platform.OS === 'android' && {
          paddingTop: 25 // StatusBar height
        })
      }}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: 20, 
          paddingTop: Platform.OS === 'android' ? 20 : 50,
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.1)'
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{product.name}</Text>
            <Text style={{ color: '#ff6b35', fontSize: 18, fontWeight: 'bold' }}>{product.price} MRU</Text>
            {shop && <Text style={{ color: '#C8A55F', fontSize: 14 }}>🏦 {shop.username}</Text>}
          </View>
          <TouchableOpacity 
            onPress={onClose} 
            style={{ 
              padding: 10,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 20,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Media Display */}
        <View 
          style={{ flex: 1, justifyContent: 'center' }}
          onTouchStart={(e) => {
            touchStartX.current = e.nativeEvent.pageX;
          }}
          onTouchEnd={(e) => {
            const touchEndX = e.nativeEvent.pageX;
            const diff = touchStartX.current - touchEndX;
            
            if (Math.abs(diff) > 50 && allMedia.length > 1) {
              if (diff > 0) {
                setCurrentIndex(prev => prev < allMedia.length - 1 ? prev + 1 : 0);
              } else {
                setCurrentIndex(prev => prev > 0 ? prev - 1 : allMedia.length - 1);
              }
            }
          }}
        >
          {currentMedia ? (
            currentMedia.type === 'video' ? (
              Platform.OS === 'web' ? (
                <video
                  src={currentMedia.uri}
                  style={{ width: '100%', height: 300, objectFit: 'contain' }}
                  controls
                  autoPlay
                  loop
                  muted
                />
              ) : (
                <View style={{ width: '100%', height: 300, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
                  <VideoView
                    style={{ width: '100%', height: '100%' }}
                    player={player}
                    contentFit="contain"
                    nativeControls={true}
                    allowsFullscreen={true}
                  />
                  {!player && (
                    <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: 'white', fontSize: 16 }}>Chargement vidéo...</Text>
                      <Text style={{ color: 'white', fontSize: 30, marginTop: 10 }}>🎥</Text>
                    </View>
                  )}
                </View>
              )
            ) : (
              <Image
                source={{ uri: currentMedia.uri }}
                style={{ width: '100%', height: 300 }}
                resizeMode="contain"
              />
            )
          ) : (
            <View style={{ alignItems: 'center', justifyContent: 'center', height: 300 }}>
              <Text style={{ color: 'white', fontSize: 50 }}>📷</Text>
            </View>
          )}
        </View>

        {/* Navigation */}
        {allMedia.length > 1 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 }}>
            <TouchableOpacity
              onPress={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : allMedia.length - 1)}
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.15)', 
                padding: 15, 
                borderRadius: 25,
                elevation: Platform.OS === 'android' ? 3 : 0,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84
              }}
            >
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>‹</Text>
            </TouchableOpacity>
            
            <View style={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              paddingHorizontal: 15,
              paddingVertical: 8,
              borderRadius: 20,
              elevation: Platform.OS === 'android' ? 2 : 0
            }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                {currentMedia?.type === 'video' ? '🎥 ' : '📷 '}
                {currentIndex + 1} / {allMedia.length}
              </Text>
            </View>
            
            <TouchableOpacity
              onPress={() => setCurrentIndex(prev => prev < allMedia.length - 1 ? prev + 1 : 0)}
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.15)', 
                padding: 15, 
                borderRadius: 25,
                elevation: Platform.OS === 'android' ? 3 : 0,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84
              }}
            >
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Thumbnails */}
        {allMedia.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ maxHeight: 80, marginTop: 20 }}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {allMedia.map((media, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentIndex(index)}
                style={{
                  marginRight: 10,
                  borderWidth: 2,
                  borderColor: currentIndex === index ? '#C8A55F' : 'rgba(255,255,255,0.3)',
                  borderRadius: 8,
                  elevation: Platform.OS === 'android' ? (currentIndex === index ? 4 : 2) : 0,
                  shadowColor: currentIndex === index ? '#C8A55F' : '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: currentIndex === index ? 0.5 : 0.25,
                  shadowRadius: 3.84,
                  backgroundColor: currentIndex === index ? 'rgba(200, 165, 95, 0.1)' : 'transparent'
                }}
              >
                {media.type === 'video' ? (
                  <View style={{ width: 60, height: 60, backgroundColor: '#333', borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 20 }}>🎥</Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: media.uri }}
                    style={{ width: 60, height: 60, borderRadius: 6 }}
                    resizeMode="cover"
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Contact Buttons */}
        {shop && (shop.whatsapp || shop.phone) && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15, paddingHorizontal: 20, paddingVertical: 15 }}>
            {shop.whatsapp && (
              <TouchableOpacity 
                style={{
                  backgroundColor: '#25D366',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 25,
                  flex: 1,
                  maxWidth: 150,
                  justifyContent: 'center'
                }}
                onPress={() => {
                  const message = `Bonjour, je suis intéressé par ${product.name} (${product.price} MRU)`;
                  const url = `whatsapp://send?phone=${shop.whatsapp}&text=${encodeURIComponent(message)}`;
                  Linking.openURL(url).catch(() => {
                    Alert.alert('Erreur', 'WhatsApp n\'est pas installé');
                  });
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>📱 WhatsApp</Text>
              </TouchableOpacity>
            )}
            
            {shop.phone && (
              <TouchableOpacity 
                style={{
                  backgroundColor: '#007AFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 25,
                  flex: 1,
                  maxWidth: 150,
                  justifyContent: 'center'
                }}
                onPress={() => {
                  Linking.openURL(`tel:${shop.phone}`);
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>📞 Appeler</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Product Description */}
        {product.description && (
          <View style={{ padding: 20 }}>
            <Text style={{ color: 'white', fontSize: 16 }}>{product.description}</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default ProductDetailModal;