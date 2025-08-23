import { useState, useEffect } from 'react';
import { I18nManager, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Langues RTL supportées
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export const useRTL = () => {
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);
  const [currentLanguage, setCurrentLanguage] = useState('fr');

  // Charger la langue sauvegardée au démarrage
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      let savedLang;
      if (Platform.OS === 'web') {
        savedLang = localStorage.getItem('selectedLanguage') || localStorage.getItem('language');
      } else {
        savedLang = await AsyncStorage.getItem('selectedLanguage') || await AsyncStorage.getItem('language');
      }
      
      if (savedLang) {
        setCurrentLanguage(savedLang);
        updateRTL(savedLang);
      }
    } catch (error) {
      console.log('Erreur chargement langue RTL:', error);
    }
  };

  const updateRTL = (language) => {
    const shouldBeRTL = RTL_LANGUAGES.includes(language);
    
    if (Platform.OS === 'web') {
      // Pour le web, utiliser CSS direction
      document.documentElement.dir = shouldBeRTL ? 'rtl' : 'ltr';
      document.documentElement.style.direction = shouldBeRTL ? 'rtl' : 'ltr';
    } else {
      // Pour React Native, utiliser I18nManager
      if (shouldBeRTL !== I18nManager.isRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
      }
    }
    
    setIsRTL(shouldBeRTL);
  };

  const changeLanguage = async (language) => {
    setCurrentLanguage(language);
    updateRTL(language);
    
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('selectedLanguage', language);
      } else {
        await AsyncStorage.setItem('selectedLanguage', language);
      }
    } catch (error) {
      console.log('Erreur sauvegarde langue RTL:', error);
    }
  };

  // Fonction utilitaire pour obtenir les styles RTL
  const getDirectionalStyle = (ltrStyle, rtlStyle = {}) => {
    return isRTL ? { ...ltrStyle, ...rtlStyle } : ltrStyle;
  };

  // Fonction pour inverser les marges/padding horizontaux
  const getFlexDirection = (direction = 'row') => {
    if (!isRTL) return direction;
    
    switch (direction) {
      case 'row':
        return 'row-reverse';
      case 'row-reverse':
        return 'row';
      default:
        return direction;
    }
  };

  // Fonction pour ajuster l'alignement du texte
  const getTextAlign = (align = 'left') => {
    if (!isRTL) return align;
    
    switch (align) {
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      default:
        return align;
    }
  };

  return {
    isRTL,
    currentLanguage,
    changeLanguage,
    getDirectionalStyle,
    getFlexDirection,
    getTextAlign,
    RTL_LANGUAGES
  };
};

export default useRTL;