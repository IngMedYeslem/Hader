import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Platform, ActivityIndicator } from 'react-native';
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
  const isRTL = currentLanguage === 'ar';

  const handleGetLocation = () => {
    if (!navigator?.geolocation && Platform.OS !== 'web') {
      alert('الموقع الجغرافي غير متاح على هذا الجهاز');
      return;
    }
    setLocating(true);
    const geo = Platform.OS === 'web' ? navigator.geolocation : navigator?.geolocation;
    if (!geo) { setLocating(false); return; }
    geo.getCurrentPosition(
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
        alert(isRTL ? 'تعذّر تحديد الموقع. تأكد من السماح بالوصول للموقع.' : 'Impossible de localiser. Vérifiez les permissions de localisation.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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

        <View style={styles.centeredContainer}>
          <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
          <View style={styles.card}>
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
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {SHOP_CATEGORIES.map(cat => {
                const selected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={{
                      flexDirection: 'row', alignItems: 'center',
                      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
                      backgroundColor: selected ? '#FF6B35' : 'rgba(255,107,53,0.08)',
                      borderWidth: 1,
                      borderColor: selected ? '#FF6B35' : 'rgba(255,107,53,0.2)',
                      cursor: 'pointer',
                    }}
                  >
                    <Text style={{ fontSize: 14, marginRight: 4 }}>{cat.icon}</Text>
                    <Text style={{ fontSize: 12, color: selected ? 'white' : '#FF6B35', fontWeight: '600' }}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* الموقع الجغرافي */}
            <TouchableOpacity
              onPress={handleGetLocation}
              disabled={locating}
              style={{
                backgroundColor: formData.latitude ? '#e8f5e9' : '#FF6B35',
                borderRadius: 10, padding: 14, alignItems: 'center',
                marginBottom: 8, flexDirection: 'row', justifyContent: 'center', gap: 8,
              }}
            >
              {locating
                ? <ActivityIndicator color="white" size="small" />
                : <Text style={{ fontSize: 18 }}>📍</Text>
              }
              <Text style={{ color: formData.latitude ? '#2e7d32' : 'white', fontWeight: '700', fontSize: 14 }}>
                {locating
                  ? (isRTL ? 'جاري تحديد الموقع...' : 'Localisation en cours...')
                  : formData.latitude
                    ? (isRTL ? `✓ تم تحديد الموقع (${formData.latitude}, ${formData.longitude})` : `✓ Localisé (${formData.latitude}, ${formData.longitude})`)
                    : (isRTL ? 'حدد موقع متجرك تلقائياً' : 'Localiser ma boutique')
                }
              </Text>
            </TouchableOpacity>

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
    </View>
  );
}