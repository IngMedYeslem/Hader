import React from 'react';
import { View, StyleSheet } from 'react-native';

export const BannerDots = ({ count, current, activeColor = '#E8620A' }) => (
  <View style={styles.row}>
    {Array.from({ length: count }).map((_, i) => (
      <View
        key={i}
        style={[styles.dot, i === current && { width: 16, backgroundColor: activeColor }]}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ccc' },
});
