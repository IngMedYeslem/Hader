import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../translations';

export default function GlobalNavbar({ onShopLogin, onAdminAccess }) {
  const { t, setLanguage, currentLanguage } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLanguageChange = () => {
    const nextLang = currentLanguage === 'fr' ? 'en' : currentLanguage === 'en' ? 'ar' : 'fr';
    setLanguage(nextLang);
  };

  const getLanguageLabel = () => {
    return currentLanguage === 'fr' ? '🇫🇷 FR' : currentLanguage === 'en' ? '🇬🇧 EN' : '🇲🇷 AR';
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setIsAdmin(user.role && user.role.includes('ADMIN'));
        }
      } catch (error) {}
    };
    checkAdminStatus();
  }, []);

  return (
    <SafeAreaView style={{ backgroundColor: '#FF6B35' }}>
      <View style={{ backgroundColor: '#FF6B35' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12 }}>
          <TouchableOpacity
            onPress={handleLanguageChange}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6 }}
          >
            <Text style={{ fontSize: 12, color: 'white', fontWeight: 'bold' }}>{getLanguageLabel()}</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              onPress={onAdminAccess}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
            >
              <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>
                👨‍💼 {t('admin')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onShopLogin}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
            >
              <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>
                🏪 {t('shopSpace')}
              </Text>
            </TouchableOpacity>

            <Image source={require('../../assets/logof.png')} style={{ width: 80, height: 30, resizeMode: 'contain' }} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
