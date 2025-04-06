// components/LanguageToggle.js
import React, { useState, useEffect, useCallback } from "react";
import { TouchableOpacity, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import styles from "./styles";  // Importer les styles

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState("fr");

  // Chargement de la langue sauvegardée dans AsyncStorage
  const loadLanguage = useCallback(async () => {
    const savedLang = await AsyncStorage.getItem("language");
    if (savedLang) {
      setLanguage(savedLang);
      i18n.changeLanguage(savedLang);  // Changer la langue immédiatement
    }
  }, [i18n]);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  // Fonction pour changer la langue
  const toggleLanguage = async () => {
    const newLang = language === "fr" ? "ar" : "fr";
    setLanguage(newLang);
    i18n.changeLanguage(newLang);  // Mise à jour de la langue dans i18n
    await AsyncStorage.setItem("language", newLang);  // Sauvegarde dans AsyncStorage
  };

  return (
    <TouchableOpacity
      style={[
        styles.navItem,
        {
          alignSelf: language === "ar" ? "flex-end" : "flex-start", // Pour aligner le bloc entier
          flexDirection: "row", // Même sens pour les enfants
          alignItems: "center"
        }
      ]}
      onPress={toggleLanguage}
    >
      <MaterialIcons name="language" size={24} style={styles.colorText} />
      <Text style={[styles.colorText, { marginLeft: 8 }]}>
        {language === "fr" ? "🇫🇷 France" : "🇲🇷 العربية"}
      </Text>
    </TouchableOpacity>
  );
};

export default LanguageToggle;
