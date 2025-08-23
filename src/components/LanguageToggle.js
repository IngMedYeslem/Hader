// components/LanguageToggle.js
import React, { useState, useEffect, useCallback } from "react";
import { TouchableOpacity, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation as useI18nTranslation } from "react-i18next";
import { useTranslation, setLanguage, getLanguage, isCurrentLanguageRTL } from "../translations";
import { MaterialIcons } from "@expo/vector-icons";
import styles from "./styles";  // Importer les styles

const LanguageToggle = () => {
  const { i18n } = useI18nTranslation();
  const { currentLanguage } = useTranslation();
  const [language, setLanguageState] = useState(currentLanguage || "fr");
  const [isRTL, setIsRTL] = useState(isCurrentLanguageRTL());

  // Chargement de la langue sauvegardée dans AsyncStorage
  const loadLanguage = useCallback(async () => {
    const savedLang = await AsyncStorage.getItem("selectedLanguage") || await AsyncStorage.getItem("language");
    if (savedLang) {
      setLanguageState(savedLang);
      i18n.changeLanguage(savedLang);  // Changer la langue immédiatement
      setIsRTL(savedLang === 'ar' || savedLang === 'he' || savedLang === 'fa' || savedLang === 'ur');
    }
  }, [i18n]);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  useEffect(() => {
    setLanguageState(currentLanguage);
    setIsRTL(isCurrentLanguageRTL());
  }, [currentLanguage]);

  // Fonction pour changer la langue avec gestion automatique RTL
  const toggleLanguage = async () => {
    const newLang = language === "fr" ? "ar" : "fr";
    setLanguageState(newLang);
    
    // Utiliser le système de traduction unifié qui gère automatiquement RTL
    await setLanguage(newLang);
    i18n.changeLanguage(newLang);  // Mise à jour de la langue dans i18n
    await AsyncStorage.setItem("language", newLang);  // Sauvegarde dans AsyncStorage
    
    setIsRTL(newLang === 'ar' || newLang === 'he' || newLang === 'fa' || newLang === 'ur');
  };

  return (
    <TouchableOpacity
      style={[
        styles.navItem,
        {
          alignSelf: isRTL ? "flex-end" : "flex-start", // Pour aligner le bloc entier selon RTL
          flexDirection: isRTL ? "row-reverse" : "row", // Direction adaptée à RTL
          alignItems: "center"
        }
      ]}
      onPress={toggleLanguage}
    >
      <MaterialIcons name="language" size={24} style={styles.colorText} />
      <Text style={[
        styles.colorText, 
        { 
          marginLeft: isRTL ? 0 : 8,
          marginRight: isRTL ? 8 : 0,
          textAlign: isRTL ? 'right' : 'left'
        }
      ]}>
        {language === "fr" ? "🇫🇷 Français" : "🇲🇷 العربية"}
      </Text>
    </TouchableOpacity>
  );
};

export default LanguageToggle;
