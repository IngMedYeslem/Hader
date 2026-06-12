import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Animated } from 'react-native';

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const slideAnim = useState(new Animated.Value(100))[0];

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Already dismissed this session
    if (sessionStorage.getItem('install-banner-dismissed')) return;

    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    setIsIOS(ios);

    if (ios) {
      // Show iOS instructions banner after 3s
      setTimeout(() => showBanner(), 3000);
    } else {
      // Android/Chrome: wait for beforeinstallprompt
      const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        showBanner();
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const showBanner = () => {
    setShow(true);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80 }).start();
  };

  const dismiss = () => {
    sessionStorage.setItem('install-banner-dismissed', '1');
    Animated.timing(slideAnim, { toValue: 100, duration: 250, useNativeDriver: true }).start(() => setShow(false));
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') dismiss();
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <Animated.View style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 9999,
      transform: [{ translateY: slideAnim }],
    }}>
      <View style={{
        backgroundColor: '#1a1a2e',
        paddingVertical: 12, paddingHorizontal: 16,
        flexDirection: 'row', alignItems: 'center',
        borderTopWidth: 2, borderTopColor: '#FF6B35',
        gap: 10,
      }}>
        <Text style={{ fontSize: 28 }}>📲</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>
            {isIOS ? 'أضف حاضر للشاشة الرئيسية' : 'ثبّت تطبيق حاضر'}
          </Text>
          {isIOS ? (
            <Text style={{ color: '#aaa', fontSize: 11, marginTop: 2 }}>
              اضغط <Text style={{ color: '#FF6B35', fontWeight: '700' }}>□↑</Text> ثم «إضافة إلى الشاشة الرئيسية»
            </Text>
          ) : (
            <Text style={{ color: '#aaa', fontSize: 11, marginTop: 2 }}>
              تثبيت مجاني — يعمل بدون إنترنت
            </Text>
          )}
        </View>

        {!isIOS && (
          <TouchableOpacity
            onPress={install}
            style={{
              backgroundColor: '#FF6B35',
              paddingHorizontal: 14, paddingVertical: 8,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>تثبيت</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={dismiss} style={{ padding: 4 }}>
          <Text style={{ color: '#888', fontSize: 18 }}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
