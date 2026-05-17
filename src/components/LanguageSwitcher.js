// components/LanguageSwitcher.js
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useTranslation, setLanguage } from '../translations';

const LANGUAGES = ['fr', 'en', 'ar'];
const FLAGS = { fr: '🇫🇷', en: '🇬🇧', ar: '🇲🇷' };

export default function LanguageSwitcher({ style }) {
  const { currentLanguage } = useTranslation();

  const cycle = async () => {
    const next = LANGUAGES[(LANGUAGES.indexOf(currentLanguage) + 1) % LANGUAGES.length];
    await setLanguage(next);
  };

  return (
    <TouchableOpacity
      onPress={cycle}
      style={[{
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
      }, style]}
    >
      <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>
        {FLAGS[currentLanguage]} {currentLanguage.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
}
