import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import styles from './styles';

export default function ShopSummary({ products }) {
  // Grouper les produits par boutique
  const productsByShop = products.reduce((acc, product) => {
    const shopName = product.shop?.username || 'Sans boutique';
    if (!acc[shopName]) {
      acc[shopName] = [];
    }
    acc[shopName].push(product);
    return acc;
  }, {});

  return (
    <View style={styles.shopSummaryContainer}>
      <Text style={styles.summaryTitle}>📊 Résumé par boutique</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Object.entries(productsByShop).map(([shopName, shopProducts]) => (
          <View key={shopName} style={styles.shopSummaryCard}>
            <Text style={styles.shopSummaryName}>{shopName}</Text>
            <Text style={styles.shopSummaryCount}>
              {shopProducts.length} produit{shopProducts.length > 1 ? 's' : ''}
            </Text>
            <Text style={styles.shopSummaryPrice}>
              À partir de {Math.min(...shopProducts.map(p => p.price))} DH
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}