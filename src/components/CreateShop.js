import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Platform, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import styles from './styles';
import { useTranslation } from '../translations';
import { API_URL } from '../config/api';
import LanguageSwitcher from './LanguageSwitcher';



const SHOP_CATEGORIES = [
  { id: 'restaurant',  label: 'مطاعم',                       icon: '🍽️' },
  { id: 'foodstore',   label: 'محلات مواد غذائية',           icon: '🥫' },
  { id: 'pharmacy',    label: 'صيدليات',                     icon: '💊' },
  { id: 'clothing',    label: 'محلات ملابس',                 icon: '👗' },
  { id: 'electronics', label: 'محلات إلكترونيات',            icon: '📱' },
  { id: 'furniture',   label: 'محلات أثاث ومنزل',           icon: '🛋️' },
  { id: 'sports',      label: 'محلات رياضة',                 icon: '⚽' },
  { id: 'beauty',      label: 'محلات جمال وعناية',           icon: '💄' },
  { id: 'books',       label: 'محلات كتب وقرطاسية',         icon: '📚' },
  { id: 'toys',        label: 'محلات ألعاب أطفال',           icon: '🧸' },
  { id: 'hypermarket', label: 'هايبرماركت',                  icon: '🏬' },
  { id: 'minimarket',  label: 'بقالة صغيرة',                 icon: '🏪' },
  { id: 'automotive',  label: 'محلات سيارات وقطع غيار',      icon: '🚗' },
];

export default function CreateShop({ onBack, onShopCreated }) {
  const { t, currentLanguage } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
    whatsapp: '',
    latitude: '',
    longitude: '',
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const isRTL = currentLanguage === 'ar';

  const handleGetLocation = async () => {
    setGpsError(null);
    setLocating(true);

    if (Platform.OS !== 'web') {
      // Native iOS/Android — expo-location
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { setGpsError('denied'); setLocating(false); return; }
        const loc = await Location.getCurrentPositionAsync({});
        setFormData(prev => ({
          ...prev,
          latitude: loc.coords.latitude.toFixed(6),
          longitude: loc.coords.longitude.toFixed(6),
        }));
      } catch { setGpsError('failed'); }
      finally { setLocating(false); }
    } else {
      // PWA / Safari — navigator.geolocation directement
      if (!navigator?.geolocation) { setLocating(false); setGpsError('unsupported'); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6),
          }));
          setLocating(false);
        },
        (err) => {
          setLocating(false);
          setGpsError(err.code === 1 ? 'denied' : 'failed');
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
      );
    }
  };

  const handleCreateShop = async () => {
    // Validation - tous les champs sont obligatoires
    if (!formData.name || !formData.email || !formData.password || !formData.address || !formData.phone || !formData.whatsapp || !formData.latitude || !formData.longitude || !selectedCategory) {
      Platform.OS === 'web' ? alert('Tous les champs sont obligatoires') : Alert.alert('Erreur', 'Tous les champs sont obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Platform.OS === 'web' ? alert('Les mots de passe ne correspondent pas') : Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      Platform.OS === 'web' ? alert('Le mot de passe doit contenir au moins 6 caractères') : Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Confirmation avant création
    if (Platform.OS === 'web') {
      if (!window.confirm(`Confirmer la création de la boutique "${formData.name}" ?`)) return;
    } else {
      const confirmed = await new Promise(resolve => {
        Alert.alert(
          'Confirmer',
          `Confirmer la création de la boutique "${formData.name}" ?`,
          [
            { text: 'Annuler', onPress: () => resolve(false) },
            { text: 'Créer', onPress: () => resolve(true) }
          ]
        );
      });
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/shops/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          address: formData.address,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          category: selectedCategory,
          location: {
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude)
          }
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        if (Platform.OS === 'web') {
          alert(`Boutique "${formData.name}" créée avec succès`);
          setFormData({ 
            name: '', email: '', password: '', confirmPassword: '',
            address: '', phone: '', whatsapp: '', latitude: '', longitude: '',
          });
          setSelectedCategory('');
          onShopCreated && onShopCreated();
        } else {
          Alert.alert(
            'Succès',
            `Boutique "${formData.name}" créée avec succès`,
            [
              {
                text: 'OK',
                onPress: () => {
                  setFormData({ 
                    name: '', email: '', password: '', confirmPassword: '',
                    address: '', phone: '', whatsapp: '', latitude: '', longitude: '',
                  });
                  setSelectedCategory('');
                  onShopCreated && onShopCreated();
                }
              }
            ]
          );
        }
      } else {
        Platform.OS === 'web' ? alert(data.error || 'Erreur lors de la création') : Alert.alert('Erreur', data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      Platform.OS === 'web' ? alert('Erreur de connexion au serveur') : Alert.alert('Erreur', 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '35%', backgroundColor: '#FF6B35', borderBottomLeftRadius: 60, borderBottomRightRadius: 60 }} />

      <View style={{ backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, paddingTop: Platform.OS === 'ios' ? 55 : 15 }}>
          <TouchableOpacity onPress={onBack} style={{ marginRight: 10 }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
              {t('back')}
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.textcoprit, { fontSize: 14 }]}>🏪 {t('createShop')}</Text>
            <Text style={{ color: '#FF6B35', fontSize: 10, opacity: 0.8 }}>
              {t('newShopRegistration')}
            </Text>
          </View>
          <LanguageSwitcher style={{ backgroundColor: 'rgba(255,107,53,0.15)' }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 }}
        >
          <View style={[styles.card, { width: undefined, maxWidth: undefined, alignSelf: 'stretch' }]}>
            <Text style={[styles.authTitle, { fontSize: 24, marginBottom: 30 }]}>
              {t('createShop')}
            </Text>

            <TextInput
              style={styles.addProductInput}
              placeholder={`${t('shopName')} *`}
              placeholderTextColor="#999"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({...prev, name: text}))}
            />

            <TextInput
              style={styles.addProductInput}
              placeholder={`${t('email')} *`}
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({...prev, email: text}))}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.addProductInput}
              placeholder={`${t('password')} *`}
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({...prev, password: text}))}
              secureTextEntry
            />

            <TextInput
              style={styles.addProductInput}
              placeholder={`${t('confirmPassword')} *`}
              placeholderTextColor="#999"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData(prev => ({...prev, confirmPassword: text}))}
              secureTextEntry
            />

            <TextInput
              style={styles.addProductInput}
              placeholder={`${t('address')} *`}
              placeholderTextColor="#999"
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({...prev, address: text}))}
              multiline
            />

            <TextInput
              style={styles.addProductInput}
              placeholder={`${t('phone')} *`}
              placeholderTextColor="#999"
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({...prev, phone: text}))}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.addProductInput}
              placeholder={`${t('whatsapp')} *`}
              placeholderTextColor="#999"
              value={formData.whatsapp}
              onChangeText={(text) => setFormData(prev => ({...prev, whatsapp: text}))}
              keyboardType="phone-pad"
            />

            {/* Category Selector */}
            <Text style={{ color: '#777', fontSize: 13, marginBottom: 6, marginTop: 4 }}>
              {t('category')} *
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
              {SHOP_CATEGORIES.map(cat => {
                const selected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={{
                      flexDirection: 'row', alignItems: 'center',
                      paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
                      backgroundColor: selected ? '#FF6B35' : 'rgba(255,107,53,0.08)',
                      borderWidth: 1,
                      borderColor: selected ? '#FF6B35' : 'rgba(255,107,53,0.2)',
                      marginRight: 6, marginBottom: 6,
                    }}
                  >
                    <Text style={{ fontSize: 13, marginRight: 3 }}>{cat.icon}</Text>
                    <Text style={{ fontSize: 11, color: selected ? 'white' : '#FF6B35', fontWeight: '600' }}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* الموقع الجغرافي */}
            <Text style={{ color: '#777', fontSize: 13, marginBottom: 6, marginTop: 4 }}>
              📍 {isRTL ? 'الموقع الجغرافي' : 'Localisation'} *
            </Text>

            {/* زر GPS */}
            <TouchableOpacity
              onPress={handleGetLocation}
              disabled={locating}
              style={{
                backgroundColor: formData.latitude ? '#e8f5e9' : 'rgba(255,107,53,0.1)',
                borderRadius: 10, padding: 11, alignItems: 'center',
                marginBottom: 10, flexDirection: 'row', justifyContent: 'center', gap: 8,
                borderWidth: 1, borderColor: formData.latitude ? '#a5d6a7' : '#FF6B35',
              }}
            >
              {locating
                ? <ActivityIndicator color="#FF6B35" size="small" />
                : <Text style={{ fontSize: 15 }}>📍</Text>
              }
              <Text style={{ color: formData.latitude ? '#2e7d32' : '#FF6B35', fontWeight: '700', fontSize: 12 }}>
                {locating
                  ? (isRTL ? 'جاري تحديد الموقع...' : 'Localisation en cours...')
                  : formData.latitude
                    ? (isRTL ? '✓ تم تحديد الموقع' : '✓ Localisation obtenue')
                    : (isRTL ? 'تحديد موقعي تلقائياً عبر GPS' : 'Localiser via GPS automatiquement')
                }
              </Text>
            </TouchableOpacity>

            {/* رسائل خطأ GPS */}
            {gpsError === 'denied' && (
              <View style={{ backgroundColor: '#fff3cd', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#ffc107' }}>
                <Text style={{ color: '#856404', fontSize: 13, fontWeight: '700', marginBottom: 4 }}>🔒 الموقع محجوب</Text>
                <Text style={{ color: '#856404', fontSize: 12, lineHeight: 18 }}>
                  {'الإعدادات ← الخصوصية ← خدمات الموقع ← Safari ← اسمح'}
                </Text>
              </View>
            )}
            {gpsError === 'failed' && (
              <Text style={{ color: '#e74c3c', fontSize: 11, textAlign: 'center', marginBottom: 8 }}>
                ⚠️ تعذّر تحديد الموقع — اضغط الزر مجدداً
              </Text>
            )}

            {/* إدخال يدوي — دائماً ظاهر */}
            <View style={{ backgroundColor: '#f9f9f9', borderRadius: 10, padding: 12, marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: '#555', fontWeight: '600', marginBottom: 4, textAlign: isRTL ? 'right' : 'left' }}>
                {isRTL ? '🗺️ أو أدخل الإحداثيات يدوياً:' : '🗺️ Ou saisir manuellement :'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS === 'web') window.open('https://maps.google.com', '_blank');
                }}
                style={{ marginBottom: 8 }}
              >
                <Text style={{ fontSize: 11, color: '#1565C0', textDecorationLine: 'underline', textAlign: isRTL ? 'right' : 'left' }}>
                  {isRTL
                    ? '→ افتح Google Maps ← اضغط على موقعك ← انسخ الرقمين من الأسفل'
                    : '→ Google Maps ← appuie sur ta position ← copie les 2 chiffres en bas'}
                </Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.addProductInput, { marginBottom: 6 }]}
                placeholder={isRTL ? 'خط العرض — مثال: 18.0735' : 'Latitude — ex: 18.0735'}
                placeholderTextColor="#bbb"
                value={formData.latitude}
                onChangeText={(t) => setFormData(prev => ({ ...prev, latitude: t }))}
                keyboardType="default"
                autoCorrect={false}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.addProductInput}
                placeholder={isRTL ? 'خط الطول — مثال: -15.9582' : 'Longitude — ex: -15.9582'}
                placeholderTextColor="#bbb"
                value={formData.longitude}
                onChangeText={(t) => setFormData(prev => ({ ...prev, longitude: t }))}
                keyboardType="default"
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]}
              onPress={handleCreateShop}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? t('creating') : t('createShop')}
              </Text>
            </TouchableOpacity>

            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 8, marginTop: 20 }}>
              <Text style={{ color: '#FF6B35', fontSize: 12, textAlign: 'center', fontWeight: 'bold' }}>
                ⚠️ {t('important')}
              </Text>
              <Text style={{ color: '#FF6B35', fontSize: 12, textAlign: 'center', marginTop: 5 }}>
                {t('allFieldsRequired')}
              </Text>
            </View>
          </View>
        </ScrollView>
    </View>
  );
}