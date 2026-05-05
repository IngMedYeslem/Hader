import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, ScrollView, Platform, Dimensions, Linking, Alert } from 'react-native';
import { getMediaUrl } from '../services/api';
import styles from './styles';

const { width } = Dimensions.get('window');

const ProductDetailModal = ({ visible, onClose, product, shop }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);

  const images = product
    ? (Array.isArray(product.images) ? product.images.filter(i => i && i.trim() && !i.startsWith('file://')) : [])
    : [];
  const allMedia = images.map(i => ({ uri: getMediaUrl(i) }));

  useEffect(() => {
    if (visible && product) setCurrentIndex(0);
  }, [visible, product]);

  if (!product) return null;

  return (
    <Modal visible={visible} animationType={Platform.OS === 'android' ? 'fade' : 'slide'} transparent statusBarTranslucent={Platform.OS === 'android'}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', ...(Platform.OS === 'android' && { paddingTop: 25 }) }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'android' ? 20 : 50, backgroundColor: 'rgba(0,0,0,0.8)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{product.name}</Text>
            <Text style={{ color: '#ff6b35', fontSize: 18, fontWeight: 'bold' }}>{product.price} MRU</Text>
            {shop && <Text style={{ color: '#C8A55F', fontSize: 14 }}>🏦 {shop.username}</Text>}
          </View>
          <TouchableOpacity onPress={onClose} style={{ padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Media Display */}
        <View
          style={{ flex: 1, justifyContent: 'center' }}
          onTouchStart={(e) => { touchStartX.current = e.nativeEvent.pageX; }}
          onTouchEnd={(e) => {
            const diff = touchStartX.current - e.nativeEvent.pageX;
            if (Math.abs(diff) > 50 && allMedia.length > 1) {
              setCurrentIndex(prev => diff > 0 ? (prev < allMedia.length - 1 ? prev + 1 : 0) : (prev > 0 ? prev - 1 : allMedia.length - 1));
            }
          }}
        >
          {allMedia[currentIndex] ? (
            <Image source={{ uri: allMedia[currentIndex].uri }} style={{ width: '100%', height: 300 }} resizeMode="contain" />
          ) : (
            <View style={{ alignItems: 'center', justifyContent: 'center', height: 300 }}>
              <Text style={{ color: 'white', fontSize: 50 }}>📷</Text>
            </View>
          )}
        </View>

        {/* Navigation */}
        {allMedia.length > 1 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 }}>
            <TouchableOpacity onPress={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : allMedia.length - 1)} style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: 15, borderRadius: 25 }}>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>‹</Text>
            </TouchableOpacity>
            <View style={{ backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>📷 {currentIndex + 1} / {allMedia.length}</Text>
            </View>
            <TouchableOpacity onPress={() => setCurrentIndex(prev => prev < allMedia.length - 1 ? prev + 1 : 0)} style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: 15, borderRadius: 25 }}>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Thumbnails */}
        {allMedia.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 80, marginTop: 20 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {allMedia.map((media, index) => (
              <TouchableOpacity key={index} onPress={() => setCurrentIndex(index)} style={{ marginRight: 10, borderWidth: 2, borderColor: currentIndex === index ? '#C8A55F' : 'rgba(255,255,255,0.3)', borderRadius: 8 }}>
                <Image source={{ uri: media.uri }} style={{ width: 60, height: 60, borderRadius: 6 }} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Contact Buttons */}
        {shop && (shop.whatsapp || shop.phone) && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15, paddingHorizontal: 20, paddingVertical: 15 }}>
            {shop.whatsapp && (
              <TouchableOpacity style={{ backgroundColor: '#25D366', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, flex: 1, maxWidth: 150, justifyContent: 'center', alignItems: 'center' }} onPress={() => {
                const message = `Bonjour, je suis intéressé par ${product.name} (${product.price} MRU)`;
                Linking.openURL(`whatsapp://send?phone=${shop.whatsapp}&text=${encodeURIComponent(message)}`).catch(() => Alert.alert('Erreur', 'WhatsApp n\'est pas installé'));
              }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>📱 WhatsApp</Text>
              </TouchableOpacity>
            )}
            {shop.phone && (
              <TouchableOpacity style={{ backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, flex: 1, maxWidth: 150, justifyContent: 'center', alignItems: 'center' }} onPress={() => Linking.openURL(`tel:${shop.phone}`)}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>📞 Appeler</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

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
