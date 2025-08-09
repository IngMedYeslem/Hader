import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles';

export default function GlobalNavbar({ onShopLogin, productCount = 0, shopCount = 0 }) {
  return (
    <View style={[styles.headerGlobal, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 }]}>
      <View>
        <Text style={styles.textcoprit}>🛍️ Marketplace Global</Text>
        <Text style={{ color: '#C8A55F', fontSize: 12, opacity: 0.8 }}>
          {productCount} produits • {shopCount} boutiques
        </Text>
      </View>
      <TouchableOpacity onPress={onShopLogin} style={{ backgroundColor: 'rgba(200, 165, 95, 0.2)', padding: 8, borderRadius: 15 }}>
        <Text style={{ color: '#C8A55F', fontSize: 14, fontWeight: 'bold' }}>
          Espace Boutique →
        </Text>
      </TouchableOpacity>
    </View>
  );
}