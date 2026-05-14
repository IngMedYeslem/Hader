import React from 'react';
import { View, Text } from 'react-native';

/**
 * @param {number} averageRating
 * @param {number} totalRatings
 * @param {object} style
 */
const ShopRatingBadge = ({ averageRating, totalRatings, style }) => {
  if (!averageRating || averageRating === 0) return null;

  const rating = Math.round(averageRating * 10) / 10;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,215,0,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }, style]}>
      <Text style={{ fontSize: 11, color: '#e6a817', fontWeight: '700' }}>
        ⭐ {rating.toFixed(1)}
        {totalRatings > 0 && <Text style={{ fontWeight: '400', color: '#888' }}> ({totalRatings})</Text>}
      </Text>
    </View>
  );
};

export default ShopRatingBadge;
