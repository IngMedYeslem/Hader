import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

const BANNER_WIDTH = Dimensions.get('window').width - 32;

export const BannerSlide = ({ offer, onPress }) => (
  <TouchableOpacity
    style={[styles.slide, { backgroundColor: offer.color, width: BANNER_WIDTH }]}
    onPress={() => onPress(offer)}
    activeOpacity={0.92}
  >
    <Text style={styles.emoji}>{offer.emoji}</Text>
    <Text style={styles.title}>{offer.title}</Text>
    {offer.subtitle ? <Text style={styles.subtitle}>{offer.subtitle}</Text> : null}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  slide: {
    borderRadius: 16,
    padding: 16,
    minHeight: 110,
    justifyContent: 'flex-end',
    marginRight: 12,
  },
  emoji: { fontSize: 32, marginBottom: 4 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'right' },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2, textAlign: 'right' },
});
