import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useTranslation } from '../translations';
import { RTLTextInput } from './RTLInput';
import styles from './styles';

export default function SearchBar({ searchText, onSearchChange, selectedShop, onShopFilter, shops }) {
  const { t } = useTranslation();
  return (
    <View style={styles.searchContainer}>
      <RTLTextInput
        style={styles.searchInput}
        placeholder={t('searchProduct')}
        placeholderTextColor="#999"
        value={searchText}
        onChangeText={onSearchChange}
      />
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 5 }}
        style={{ flexDirection: 'row' }}
      >
        <TouchableOpacity 
          style={[styles.filterBtn, !selectedShop && styles.filterBtnActive, { marginRight: 8 }]}
          onPress={() => onShopFilter(null)}
        >
          <Text style={[styles.filterText, !selectedShop && styles.filterTextActive]}>
            {t('all')}
          </Text>
        </TouchableOpacity>
        
        {shops.map((shop) => (
          <TouchableOpacity 
            key={shop}
            style={[styles.filterBtn, selectedShop === shop && styles.filterBtnActive, { marginRight: 8 }]}
            onPress={() => onShopFilter(shop)}
          >
            <Text style={[styles.filterText, selectedShop === shop && styles.filterTextActive]}>
              {shop}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}