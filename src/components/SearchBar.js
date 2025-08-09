import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import styles from './styles';

export default function SearchBar({ searchText, onSearchChange, selectedShop, onShopFilter, shops }) {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un produit..."
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
            Toutes
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