import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, ScrollView, Dimensions, Platform, Linking, Alert } from 'react-native';
import { getMediaUrl } from '../services/api';
import { useTranslation } from '../translations';
import styles from './styles';

const { width } = Dimensions.get('window');

function MediaGallery({ images = [], visible, onClose, productName, productPrice, shop }) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const allMedia = images
    .filter(i => i && i.trim() && !i.startsWith('file://'))
    .map(i => ({ type: 'image', uri: getMediaUrl(i) }));

  const currentMedia = allMedia[currentIndex] || { type: 'image', uri: '' };

  const handleWhatsApp = () => {
    if (shop?.whatsapp) {
      const message = `${t('whatsappMessage')} ${productName} (${productPrice} MRU)`;
      const url = `whatsapp://send?phone=${shop.whatsapp}&text=${encodeURIComponent(message)}`;
      Linking.openURL(url).catch(() => Alert.alert(t('error'), t('whatsappNotInstalled')));
    }
  };

  const handleCall = () => {
    if (shop?.phone) Linking.openURL(`tel:${shop.phone}`);
  };

  if (allMedia.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.galleryOverlay}>
        {/* Header */}
        <View style={[styles.galleryHeader, { backgroundColor: 'rgba(44, 62, 80, 0.95)', paddingVertical: 20 }]}>
          <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, alignSelf: 'flex-start', marginBottom: 8 }}>
              <Text style={{ fontSize: 20, color: '#FF6B35', fontWeight: 'bold' }}>{productName}</Text>
            </View>
            {productPrice && (
              <Text style={{ fontSize: 18, color: '#ff6b35', fontWeight: 'bold', marginBottom: 5 }}>
                {productPrice} MRU
              </Text>
            )}
            {shop && (
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, alignSelf: 'flex-start' }}>
                <Text style={{ fontSize: 14, color: '#FF6B35', fontWeight: '600' }}>🏦 {shop.username}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={[styles.closeBtnText, { color: 'white', fontSize: 18 }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Media viewer */}
        {Platform.OS === 'web' ? (
          <View style={styles.mainImageContainer}>
            {allMedia.length > 1 && (
              <TouchableOpacity
                style={{ position: 'absolute', left: 20, top: '50%', zIndex: 10, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 25, width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}
                onPress={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : allMedia.length - 1)}
              >
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>‹</Text>
              </TouchableOpacity>
            )}
            {allMedia.length > 1 && (
              <TouchableOpacity
                style={{ position: 'absolute', right: 20, top: '50%', zIndex: 10, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 25, width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}
                onPress={() => setCurrentIndex(prev => prev < allMedia.length - 1 ? prev + 1 : 0)}
              >
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>›</Text>
              </TouchableOpacity>
            )}
            <View style={styles.singleImageContainer}>
              <img src={currentMedia.uri} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Product" />
            </View>
          </View>
        ) : (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
              if (index >= 0 && index < allMedia.length) setCurrentIndex(index);
            }}
          >
            {allMedia.map((media, index) => (
              <View key={`media-${index}`} style={[styles.singleImageContainer, { width }]}>
                <Image source={{ uri: media.uri }} style={styles.mainImage} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>
        )}

        {/* Dots + counter */}
        <View style={{ position: 'absolute', bottom: 90, alignSelf: 'center', alignItems: 'center' }}>
          <View style={[styles.imageIndicators, { backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 12, marginBottom: 15 }]}>
            {allMedia.map((_, index) => (
              <TouchableOpacity
                key={`dot-${index}`}
                style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: currentIndex === index ? '#FF6B35' : 'rgba(255,255,255,0.6)', marginHorizontal: 8, borderWidth: 2, borderColor: currentIndex === index ? '#FFD700' : 'rgba(255,255,255,0.9)' }}
                onPress={() => setCurrentIndex(index)}
              />
            ))}
          </View>
          <Text style={[styles.imageCounter, { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15 }]}>
            {currentIndex + 1} / {allMedia.length}
          </Text>
        </View>

        {/* Contact buttons */}
        {shop && (
          <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
              {shop.whatsapp && (
                <TouchableOpacity style={[styles.contactBtn, { flex: 1, maxWidth: 150 }]} onPress={handleWhatsApp}>
                  <Text style={styles.contactBtnText}>📱 WhatsApp</Text>
                </TouchableOpacity>
              )}
              {shop.phone && (
                <TouchableOpacity style={[styles.contactBtn, styles.callBtn, { flex: 1, maxWidth: 150 }]} onPress={handleCall}>
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
