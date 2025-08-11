import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { useTranslation } from '../translations';
import styles from './styles';

export default function SearchBar({ searchText, onSearchChange, selectedShop, onShopFilter, shops }) {
  const { t } = useTranslation();
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder={t('searchProduct')}
        placeholderTextColor="#999"
        value={searchText}
        onChangeText={onSearchChange}
      />
      
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterBtn, !selectedShop && styles.filterBtnActive]}
          onPress={() => onShopFilter(null)}
        >
          <Text style={[styles.filterText, !selectedShop && styles.filterTextActive]}>
            {t('all')}
          </Text>
        </TouchableOpacity>
        
        {shops.map((shop) => (
          <TouchableOpacity 
            key={shop}
            style={[styles.filterBtn, selectedShop === shop && styles.filterBtnActive]}
            onPress={() => onShopFilter(shop)}
          >
            <Text style={[styles.filterText, selectedShop === shop && styles.filterTextActive]}>
              {shop}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}