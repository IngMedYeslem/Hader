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
    <View style={[styles.headerGlobal, { backgroundColor: '#2C3E50' }]}>
      {/* Premier niveau - Titre */}
      <View style={{ paddingVertical: 30, paddingHorizontal: 30, alignItems: 'center' }}>
        <Text style={{ 
          fontSize: 20, 
          color: '#C8A55F', 
          fontWeight: 'bold'
        }}>
          🛍️ {t('globalMarketplace')}
        </Text>
        <Text style={{ 
          fontSize: 13, 
          color: '#C8A55F', 
          opacity: 0.7,
          marginTop: 4
        }}>
          {productCount} {t('products')} • {shopCount} {t('shops')}
        </Text>
      </View>
      
      {/* Deuxième niveau - Boutons */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingBottom: 9,
        borderTopWidth: 2,
        borderTopColor: 'rgba(200, 165, 95, 0.2)'
      }}>
        <TouchableOpacity 
          onPress={handleLanguageChange}
          style={{ backgroundColor: 'rgba(200, 165, 95, 0.2)', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6 }}
        >
          <Text style={{ fontSize: 13, color: '#C8A55F' }}>
            {getLanguageFlag()}
          </Text>
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity 
            onPress={onAdminAccess} 
            style={{ backgroundColor: 'rgba(220, 53, 69, 0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 }}
          >
            <Text style={{ color: '#dc3545', fontSize: 13, fontWeight: 'bold' }}>
              👨💼 Admin
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={onShopLogin} 
            style={{ backgroundColor: 'rgba(200, 165, 95, 0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 }}
          >
            <Text style={{ color: '#C8A55F', fontSize: 13, fontWeight: 'bold' }}>
              🏪 {t('shopSpace')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}