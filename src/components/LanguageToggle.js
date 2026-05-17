// components/LanguageToggle.js
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { useTranslation, setLanguage } from "../translations";
import { MaterialIcons } from "@expo/vector-icons";
import styles from "./styles";

const LANGUAGES = [
  { code: "fr", label: "🇫🇷 FR" },
  { code: "en", label: "🇬🇧 EN" },
  { code: "ar", label: "🇲🇷 AR" },
];

const LanguageToggle = () => {
  const { currentLanguage } = useTranslation();
  const isRTL = currentLanguage === "ar";

  const cycleLanguage = async () => {
    const currentIndex = LANGUAGES.findIndex((l) => l.code === currentLanguage);
    const nextLang = LANGUAGES[(currentIndex + 1) % LANGUAGES.length].code;
    await setLanguage(nextLang);
  };

  const currentLabel = LANGUAGES.find((l) => l.code === currentLanguage)?.label || "🇫🇷 FR";

  return (
    <TouchableOpacity
      style={[
        styles.navItem,
        {
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
        },
      ]}
      onPress={cycleLanguage}
    >
      <MaterialIcons name="language" size={24} style={styles.colorText} />
      <Text
        style={[
          styles.colorText,
          {
            marginLeft: isRTL ? 0 : 8,
            marginRight: isRTL ? 8 : 0,
          },
        ]}
      >
        {currentLabel}
      </Text>
    </TouchableOpacity>
  );
};

export default LanguageToggle;
