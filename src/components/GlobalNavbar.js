import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../translations';
import styles from './styles';

export default function GlobalNavbar({ onShopLogin, onAdminAccess, productCount = 0, shopCount = 0 }) {
  const { t, setLanguage, currentLanguage } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  
  const handleLanguageChange = () => {
    const nextLang = currentLanguage === 'fr' ? 'en' : currentLanguage === 'en' ? 'ar' : 'fr';
    setLanguage(nextLang);
  };
  
  const getLanguageFlag = () => {
    return currentLanguage === 'fr' ? '🇫🇷' : currentLanguage === 'en' ? '🇬🇧' : '🇲🇷';
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setIsAdmin(user.role && user.role.includes('ADMIN'));
        }
      } catch (error) {
        console.log('Erreur vérification admin:', error);
      }
    };
    checkAdminStatus();
  }, []);

  return (
    <View style={[styles.headerGlobal, { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: 10,
      paddingTop: Platform.OS === 'ios' ? 50 : 10
    }]}>
      <View style={{ flex: 1, marginRight: 8 }}>
        <Text style={[styles.textcoprit, { fontSize: 14 }]}>🛍️ {t('globalMarketplace')}</Text>
        <Text style={{ color: '#C8A55F', fontSize: 10, opacity: 0.8 }}>
          {productCount} {t('products')} • {shopCount} {t('shops')}
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', flexShrink: 0 }}>
        <TouchableOpacity 
          onPress={handleLanguageChange}
          style={{ backgroundColor: 'rgba(200, 165, 95, 0.15)', padding: 3, borderRadius: 6 }}
        >
          <Text style={{ fontSize: 11 }}>
            {getLanguageFlag()}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={onAdminAccess} 
          style={{ backgroundColor: 'rgba(220, 53, 69, 0.2)', paddingHorizontal: 4, paddingVertical: 3, borderRadius: 6 }}
        >
          <Text style={{ color: '#dc3545', fontSize: 8, fontWeight: 'bold' }}>
            👨💼
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={onShopLogin} 
          style={{ backgroundColor: 'rgba(200, 165, 95, 0.2)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 }}
        >
          <Text style={{ color: '#C8A55F', fontSize: 11, fontWeight: 'bold' }}>
            🏪 {t('shopSpace')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}