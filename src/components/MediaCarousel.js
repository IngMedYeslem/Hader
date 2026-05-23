import React, { useState, useRef, useCallback } from 'react';
import {
  View, Image, FlatList, TouchableOpacity, Text,
  Dimensions, StyleSheet, Modal, StatusBar
} from 'react-native';
import { getMediaUrl } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MediaCarousel({ mainImage, images = [], height = 280 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const flatRef = useRef(null);
  const fullRef = useRef(null);

  // دمج mainImage + images مع إزالة المكررات والمسارات الفاسدة
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

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
  const viewabilityConfigRef = useRef(viewabilityConfig);
  const onViewableRef = useRef(onViewableItemsChanged);

  if (allMedia.length === 0) {
    return (
      <View style={[s.placeholder, { height }]}>
        <Text style={s.placeholderIcon}>📷</Text>
        <Text style={s.placeholderText}>لا توجد صور</Text>
      </View>
    );
  }

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => { setCurrentIndex(index); setFullscreen(true); }}
      style={{ width: SCREEN_WIDTH }}
    >
      <Image
        source={{ uri: item }}
        style={{ width: SCREEN_WIDTH, height }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderFullItem = ({ item }) => (
    <Image
      source={{ uri: item }}
      style={{ width: SCREEN_WIDTH, height: '100%' }}
      resizeMode="contain"
    />
  );

  return (
    <>
      <View style={{ height }}>
        <FlatList
          ref={flatRef}
          data={allMedia}
          renderItem={renderItem}
          keyExtractor={(_, i) => `img-${i}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableRef.current}
          viewabilityConfig={viewabilityConfigRef.current}
          initialScrollIndex={0}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index,
          })}
        />

        {/* مؤشر العدد */}
        {allMedia.length > 1 && (
          <View style={s.counter}>
            <Text style={s.counterText}>{currentIndex + 1} / {allMedia.length}</Text>
          </View>
        )}

        {/* نقاط المؤشر */}
        {allMedia.length > 1 && allMedia.length <= 6 && (
          <View style={s.dots}>
            {allMedia.map((_, i) => (
              <View
                key={i}
                style={[s.dot, i === currentIndex && s.dotActive]}
              />
            ))}
          </View>
        )}
      </View>

      {/* مشاهدة بالملء */}
      <Modal visible={fullscreen} transparent animationType="fade" onRequestClose={() => setFullscreen(false)}>
        <StatusBar hidden />
        <View style={s.fullModal}>
          <FlatList
            ref={fullRef}
            data={allMedia}
            renderItem={renderFullItem}
            keyExtractor={(_, i) => `full-${i}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={currentIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index,
            })}
          />
          <TouchableOpacity style={s.closeFullscreen} onPress={() => setFullscreen(false)}>
            <Text style={s.closeFullscreenText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  placeholder: {
    backgroundColor: '#FFF0EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: { fontSize: 40, marginBottom: 6 },
  placeholderText: { color: '#aaa', fontSize: 13 },

  counter: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  counterText: { color: 'white', fontSize: 11, fontWeight: 'bold' },

  dots: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#FF6B35',
  },

  fullModal: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  closeFullscreen: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeFullscreenText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
