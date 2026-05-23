import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList, Image,
  Dimensions, StatusBar, Linking, Alert, Platform
} from 'react-native';
import { getMediaUrl } from '../services/api';
import { useTranslation } from '../translations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function MediaGallery({ visible, mainImage, images = [], onClose, productName, productPrice, shop }) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef(null);

  const allMedia = React.useMemo(() => {
    const sources = [mainImage, ...images]
      .filter(i => i && typeof i === 'string' && i.trim() && !i.startsWith('file://'))
      .map(i => getMediaUrl(i))
      .filter(Boolean);
    return [...new Set(sources)];
  }, [mainImage, images]);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });
  const onViewableRef = useRef(onViewableItemsChanged);

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

  const renderItem = ({ item }) => (
    <View style={{ width: SCREEN_WIDTH, flex: 1, justifyContent: 'center' }}>
      <Image
        source={{ uri: item }}
        style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
        resizeMode="contain"
      />
    </View>
  );

  const hasContact = shop && (shop.whatsapp || shop.phone);

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose}>
      <StatusBar hidden />
      <View style={{ flex: 1, backgroundColor: '#111' }}>

        {/* Header */}
        <View style={{
          backgroundColor: 'rgba(0,0,0,0.85)', paddingTop: 50, paddingBottom: 16,
          paddingHorizontal: 16, flexDirection: 'row', alignItems: 'flex-start',
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF6B35' }} numberOfLines={2}>
              {productName}
            </Text>
            {productPrice != null && (
              <Text style={{ fontSize: 15, color: '#ff9f6b', marginTop: 4 }}>
                {productPrice} MRU
              </Text>
            )}
            {shop?.username && (
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                🏪 {shop.username}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20,
              width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginLeft: 12,
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Images */}
        {allMedia.length > 0 ? (
          <FlatList
            ref={flatRef}
            data={allMedia}
            renderItem={renderItem}
            keyExtractor={(_, i) => `gallery-${i}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableRef.current}
            viewabilityConfig={viewabilityConfig.current}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index,
            })}
            style={{ flex: 1 }}
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 60 }}>📷</Text>
            <Text style={{ color: '#888', marginTop: 8 }}>لا توجد صور</Text>
          </View>
        )}

        {/* Counter + dots */}
        {allMedia.length > 1 && (
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
              {allMedia.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === currentIndex ? 20 : 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: i === currentIndex ? '#FF6B35' : 'rgba(255,255,255,0.35)',
                  }}
                />
              ))}
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
              {currentIndex + 1} / {allMedia.length}
            </Text>
          </View>
        )}

        {/* Contact buttons */}
        {hasContact && (
          <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingBottom: 36, paddingTop: 4 }}>
            {shop.whatsapp && (
              <TouchableOpacity
                onPress={handleWhatsApp}
                style={{
                  flex: 1, backgroundColor: '#25D366', borderRadius: 14,
                  paddingVertical: 14, alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>📱 WhatsApp</Text>
              </TouchableOpacity>
            )}
            {shop.phone && (
              <TouchableOpacity
                onPress={handleCall}
                style={{
                  flex: 1, backgroundColor: '#3498DB', borderRadius: 14,
                  paddingVertical: 14, alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>📞 اتصال</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {!hasContact && <View style={{ height: 36 }} />}

      </View>
    </Modal>
  );
}

export default MediaGallery;
