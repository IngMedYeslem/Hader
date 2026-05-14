import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { API_URL } from '../config/api';

/**
 * @param {string} shopId
 * @param {object} customerLocation - { latitude, longitude } optional
 * @param {object} style - optional container style
 */
const DeliveryTimeBadge = ({ shopId, customerLocation, style }) => {
  const [deliveryTime, setDeliveryTime] = useState(null);

  useEffect(() => {
    if (!shopId) return;
    let url = `${API_URL}/shops/${shopId}/delivery-time`;
    if (customerLocation?.latitude && customerLocation?.longitude) {
      url += `?lat=${customerLocation.latitude}&lng=${customerLocation.longitude}`;
    }
    fetch(url)
      .then(r => r.json())
      .then(data => data.deliveryTime && setDeliveryTime(data.deliveryTime))
      .catch(() => {});
  }, [shopId, customerLocation?.latitude, customerLocation?.longitude]);

  if (!deliveryTime) return null;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,107,53,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }, style]}>
      <Text style={{ fontSize: 11, color: '#FF6B35', fontWeight: '600' }}>🕐 {deliveryTime}</Text>
    </View>
  );
};

export default DeliveryTimeBadge;
