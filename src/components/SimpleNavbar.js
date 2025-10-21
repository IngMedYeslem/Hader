import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { getLanguage, setLanguage, useTranslation } from '../translations';
import { useNavigation } from '../NavigationContext';
import styles from './styles';

const SimpleNavbar = () => {
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(getLanguage());
  const { navigateTo } = useNavigation();

  const cycleLanguage = () => {
    const languages = ['fr', 'en', 'ar'];
    const currentIndex = languages.indexOf(currentLang);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
    setCurrentLang(languages[nextIndex]);
  };

  return (
    <View style={styles.navbar}>
      <TouchableOpacity 
        style={styles.logoButton}
        onPress={() => navigateTo('dashboard')}
      >
        <Image
          source={require('../../assets/logof.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={cycleLanguage}>
        <Text style={styles.language}>{currentLang.toUpperCase()}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SimpleNavbar;