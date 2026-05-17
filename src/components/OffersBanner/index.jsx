import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { BannerSlide } from './BannerSlide';
import { BannerDots } from './BannerDots';
import { useOffers } from '../../hooks/useOffers';
import { offersService } from '../../services/offersService';

const BANNER_WIDTH = Dimensions.get('window').width - 32;
const AUTO_SCROLL_INTERVAL = 3000;

// onOfferPress(offer) — اختياري، يُمرَّر من الصفحة الأم للتحكم في التنقل
export const OffersBanner = ({ onOfferPress }) => {
  const { offers, loading } = useOffers();
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (offers.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => {
        const next = (prev + 1) % offers.length;
        scrollRef.current?.scrollTo({ x: next * (BANNER_WIDTH + 12), animated: true });
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
    return () => clearInterval(timer);
  }, [offers.length]);

  const handlePress = useCallback((offer) => {
    offersService.recordClick(offer.id).catch(() => {});
    if (onOfferPress) onOfferPress(offer);
  }, [onOfferPress]);

  if (loading || !offers.length) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH + 12}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 12));
          setCurrent(Math.min(index, offers.length - 1));
        }}
      >
        {offers.map(offer => (
          <BannerSlide key={offer.id} offer={offer} onPress={handlePress} />
        ))}
      </ScrollView>
      {offers.length > 1 && (
        <BannerDots count={offers.length} current={current} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginVertical: 8 },
  scrollContent: { paddingRight: 16 },
});
