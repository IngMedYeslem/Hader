import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from '../translations';
import styles from './styles';

export default function ShopSummary({ products }) {
  const { t } = useTranslation();
  // Grouper les produits par boutique
  const productsByShop = products.reduce((acc, product) => {
    const shopName = product.shop?.username || t('noShop');
    if (!acc[shopName]) {
      acc[shopName] = [];
    }
    acc[shopName].push(product);
    return acc;
  }, {});

  return (
    <View style={styles.shopSummaryContainer}>
      <Text style={styles.summaryTitle}>📊 {t('shopSummary')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Object.entries(productsByShop).map(([shopName, shopProducts]) => (
          <View key={shopName} style={styles.shopSummaryCard}>
            <Text style={styles.shopSummaryName}>{shopName}</Text>
            <Text style={styles.shopSummaryCount}>
              {shopProducts.length} {shopProducts.length > 1 ? t('products') : t('product')}
            </Text>
            <Text style={styles.shopSummaryPrice}>
              {t('fromPrice')} {Math.min(...shopProducts.map(p => p.price))} MRU
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}