import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Image, SafeAreaView, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../translations';

const QR_URL = 'https://hader.up.railway.app/hader-qr.png';
const APP_URL = 'https://hader.up.railway.app';

function InstallModal({ visible, onClose, isRTL }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1}>
          <View style={{
            backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 24, paddingBottom: Platform.OS === 'web' ? 24 : 40,
          }}>
            {/* Handle bar */}
            <View style={{ width: 40, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />

            <Text style={{ fontSize: 22, fontWeight: '800', color: '#FF6B35', textAlign: 'center', marginBottom: 4 }}>
              📲 {isRTL ? 'حمّل التطبيق' : "Installer l'app"}
            </Text>
            <Text style={{ fontSize: 13, color: '#999', textAlign: 'center', marginBottom: 20 }}>
              {isRTL ? 'بدون متجر — مجاناً على شاشتك' : 'Sans store — gratuit sur ton écran'}
            </Text>

            {/* QR Code */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View style={{ padding: 12, backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#f0e6d3', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 }}>
                <Image
                  source={{ uri: QR_URL }}
                  style={{ width: 180, height: 180 }}
                  resizeMode="contain"
                />
              </View>
              <Text style={{ fontSize: 12, color: '#bbb', marginTop: 8 }}>
                {isRTL ? '📷 امسح بكاميرا هاتفك' : '📷 Scanner avec ton appareil photo'}
              </Text>
            </View>

            {/* خطوات التثبيت */}
            <View style={{ backgroundColor: '#fff8f5', borderRadius: 14, padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#FF6B35', marginBottom: 10, textAlign: isRTL ? 'right' : 'left' }}>
                {isRTL ? '⬇️ خطوات التثبيت' : '⬇️ Comment installer'}
              </Text>

              {[
                {
                  num: '1',
                  ar: 'افتح الرابط أو امسح الـ QR',
                  fr: 'Ouvre le lien ou scanne le QR',
                },
                {
                  num: '2',
                  ar: 'iPhone: زر المشاركة ← "أضف للشاشة الرئيسية"',
                  fr: 'iPhone: Partager ← "Sur l\'écran d\'accueil"',
                },
                {
                  num: '2',
                  ar: 'Android: القائمة ← "تثبيت التطبيق"',
                  fr: 'Android: Menu ← "Installer l\'application"',
                },
                {
                  num: '3',
                  ar: 'أيقونة حاضر ستظهر — جاهز! 🎉',
                  fr: 'L\'icône Hader apparaît — c\'est prêt! 🎉',
                },
              ].map((step, i) => (
                <View key={i} style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <View style={{ backgroundColor: '#FF6B35', borderRadius: 10, width: 22, height: 22, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1 }}>
                    <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>{step.num}</Text>
                  </View>
                  <Text style={{ fontSize: 13, color: '#555', flex: 1, textAlign: isRTL ? 'right' : 'left', lineHeight: 20 }}>
                    {isRTL ? step.ar : step.fr}
                  </Text>
                </View>
              ))}
            </View>

            {/* زر الفتح المباشر */}
            <TouchableOpacity
              onPress={() => Platform.OS === 'web' ? window.open(APP_URL, '_blank') : null}
              style={{ backgroundColor: '#FF6B35', padding: 14, borderRadius: 14, alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
                🚀 {isRTL ? 'افتح التطبيق' : "Ouvrir l'application"}
              </Text>
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export default function GlobalNavbar({ onShopLogin, onAdminAccess, productCount = 0, shopCount = 0 }) {
  const { t, setLanguage, currentLanguage } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const isRTL = currentLanguage === 'ar';

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

          {/* يسار: اللغة + تحميل */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity
              onPress={handleLanguageChange}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6 }}
            >
              <Text style={{ fontSize: 12, color: 'white', fontWeight: 'bold' }}>{getLanguageLabel()}</Text>
            </TouchableOpacity>

            {/* زر تثبيت التطبيق */}
            <TouchableOpacity
              onPress={() => setShowInstall(true)}
              style={{ backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Text style={{ fontSize: 14 }}>📲</Text>
              <Text style={{ fontSize: 11, color: 'white', fontWeight: '700' }}>
                {isRTL ? 'حمّل' : 'Installer'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* يمين: Admin + متجر + لوغو */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              onPress={onAdminAccess}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
            >
              <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>
                👨💼 {t('admin')}
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

      <InstallModal visible={showInstall} onClose={() => setShowInstall(false)} isRTL={isRTL} />
    </SafeAreaView>
  );
}
