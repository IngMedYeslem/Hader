import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Animated, Modal, ScrollView } from 'react-native';

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const slideAnim = useState(new Animated.Value(120))[0];

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (sessionStorage.getItem('install-banner-dismissed')) return;

    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    setIsIOS(ios);

    if (ios) {
      setTimeout(() => triggerShow(), 2000);
    } else {
      const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        triggerShow();
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const triggerShow = () => {
    setShow(true);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 70, friction: 10 }).start();
  };

  const dismiss = () => {
    sessionStorage.setItem('install-banner-dismissed', '1');
    Animated.timing(slideAnim, { toValue: 120, duration: 250, useNativeDriver: true }).start(() => setShow(false));
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') dismiss();
  };

  if (!show) return null;

  return (
    <>
      {/* البانر السفلي */}
      <Animated.View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 9999,
        transform: [{ translateY: slideAnim }],
      }}>
        <View style={{
          backgroundColor: '#1C1C2E',
          paddingVertical: 14, paddingHorizontal: 16,
          flexDirection: 'row', alignItems: 'center',
          borderTopWidth: 2, borderTopColor: '#FF6B35',
        }}>
          <Text style={{ fontSize: 30, marginRight: 12 }}>📲</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>
              {isIOS ? 'أضف حاضر للشاشة الرئيسية' : 'ثبّت تطبيق حاضر'}
            </Text>
            <Text style={{ color: '#aaa', fontSize: 11, marginTop: 2 }}>
              {isIOS ? 'اضغط هنا لمعرفة الخطوات' : 'مجاني — يعمل بدون إنترنت'}
            </Text>
          </View>

          {isIOS ? (
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              style={{
                backgroundColor: '#FF6B35',
                paddingHorizontal: 14, paddingVertical: 9,
                borderRadius: 22, marginRight: 8,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>كيف؟</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={install}
              style={{
                backgroundColor: '#FF6B35',
                paddingHorizontal: 14, paddingVertical: 9,
                borderRadius: 22, marginRight: 8,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>تثبيت</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={dismiss} style={{ padding: 6 }}>
            <Text style={{ color: '#666', fontSize: 20 }}>✕</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* مودال تعليمات iOS */}
      {isIOS && (
        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={{
            flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'flex-end',
          }}>
            <View style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 28, borderTopRightRadius: 28,
              paddingBottom: 40,
            }}>
              {/* رأس المودال */}
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
                borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
              }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#1C1C2E' }}>
                  📲 كيف تثبّت حاضر؟
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text style={{ fontSize: 22, color: '#999' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ paddingHorizontal: 20, paddingTop: 20 }}>
                {/* الخطوة 1 */}
                <View style={{
                  flexDirection: 'row', alignItems: 'flex-start',
                  backgroundColor: '#FFF5F0', borderRadius: 16, padding: 16, marginBottom: 14,
                }}>
                  <View style={{
                    backgroundColor: '#FF6B35', width: 34, height: 34, borderRadius: 17,
                    alignItems: 'center', justifyContent: 'center', marginRight: 14, marginTop: 2,
                    flexShrink: 0,
                  }}>
                    <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>1</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 15, color: '#1C1C2E', marginBottom: 4 }}>
                      اضغط زر المشاركة
                    </Text>
                    <Text style={{ color: '#555', fontSize: 13, lineHeight: 20 }}>
                      في شريط Safari السفلي، اضغط على الزر{' '}
                      <Text style={{ fontSize: 18 }}>⬆️</Text>
                      {' '}(مربع وسهم للأعلى)
                    </Text>
                  </View>
                </View>

                {/* الخطوة 2 */}
                <View style={{
                  flexDirection: 'row', alignItems: 'flex-start',
                  backgroundColor: '#FFF5F0', borderRadius: 16, padding: 16, marginBottom: 14,
                }}>
                  <View style={{
                    backgroundColor: '#FF6B35', width: 34, height: 34, borderRadius: 17,
                    alignItems: 'center', justifyContent: 'center', marginRight: 14, marginTop: 2,
                    flexShrink: 0,
                  }}>
                    <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>2</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 15, color: '#1C1C2E', marginBottom: 4 }}>
                      مرّر للأسفل في القائمة
                    </Text>
                    <Text style={{ color: '#555', fontSize: 13, lineHeight: 20 }}>
                      في القائمة التي تظهر، مرّر للأسفل حتى تجد{' '}
                      <Text style={{ fontWeight: '700', color: '#1C1C2E' }}>
                        «إضافة إلى الشاشة الرئيسية»
                      </Text>
                    </Text>
                  </View>
                </View>

                {/* الخطوة 3 */}
                <View style={{
                  flexDirection: 'row', alignItems: 'flex-start',
                  backgroundColor: '#FFF5F0', borderRadius: 16, padding: 16, marginBottom: 24,
                }}>
                  <View style={{
                    backgroundColor: '#FF6B35', width: 34, height: 34, borderRadius: 17,
                    alignItems: 'center', justifyContent: 'center', marginRight: 14, marginTop: 2,
                    flexShrink: 0,
                  }}>
                    <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>3</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 15, color: '#1C1C2E', marginBottom: 4 }}>
                      اضغط «إضافة» في الأعلى
                    </Text>
                    <Text style={{ color: '#555', fontSize: 13, lineHeight: 20 }}>
                      ستظهر شاشة تأكيد، اضغط{' '}
                      <Text style={{ fontWeight: '700', color: '#007AFF' }}>«إضافة»</Text>
                      {' '}في الزاوية العلوية اليمنى ✓
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  style={{
                    backgroundColor: '#FF6B35', borderRadius: 16,
                    paddingVertical: 16, alignItems: 'center', marginBottom: 10,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '800' }}>فهمت ✓</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}
