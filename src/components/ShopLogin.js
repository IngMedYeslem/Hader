import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, ScrollView, KeyboardAvoidingView, Dimensions, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import SimpleNavbar from './SimpleNavbar';
import SimplePasswordInput from './SimplePasswordInput';
import styles from './styles';
import { useTranslation, isCurrentLanguageRTL } from '../translations';
import { shopAPI } from '../services/api';
import { syncService, markShopForSync } from '../services/syncService';
import { RTLTextInput, RTLFormField } from './RTLInput';
import { RTLView } from './RTLComponents';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function ShopLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [category, setCategory] = useState('');

const SHOP_CATEGORIES = [
  { id: 'food',        label: 'طعام',       icon: '🍔' },
  { id: 'grocery',     label: 'بقالة',      icon: '🛒' },
  { id: 'pharmacy',    label: 'صيدلية',     icon: '💊' },
  { id: 'electronics', label: 'إلكترونيات', icon: '📱' },
  { id: 'fashion',     label: 'أزياء',      icon: '👗' },
  { id: 'other',       label: 'أخرى',       icon: '📦' },
];
  const { t } = useTranslation();
  const slideAnim = useState(new Animated.Value(300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Animations d'entrée
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Platform.OS === 'web' ? alert('Permission de localisation requise') : Alert.alert('Permission refusée', 'Permission de localisation requise');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString()
      });
      Platform.OS === 'web' ? alert('Localisation obtenue automatiquement') : Alert.alert('Succès', 'Localisation obtenue automatiquement');
    } catch (error) {
      Platform.OS === 'web' ? alert('Impossible d\'obtenir la localisation') : Alert.alert('Erreur', 'Impossible d\'obtenir la localisation');
    } finally {
      setLoadingLocation(false);
    }
  };

  const syncLocalData = async () => {
    try {
      const result = await syncService.syncAll();
      if (result.shops > 0 || result.products > 0) {
        console.log(`Synchronisé: ${result.shops} boutiques, ${result.products} produits`);
      }
    } catch (error) {
      console.log('Synchronisation échouée:', error);
    }
  };

  const handleLogin = async () => {
    try {
      // Essayer l'API d'abord
      const shop = await shopAPI.login(email, password);
      if (shop.error) {
        Platform.OS === 'web' ? alert(shop.error) : Alert.alert('Erreur', shop.error);
      } else {
        // Vérifier le statut de validation
        const isValidated = shop.isApproved || false;
        
        // Enregistrer l'ID de la boutique pour les notifications
        await AsyncStorage.setItem('currentShopId', shop._id);
        
        // Si pas validée, marquer comme première connexion
        if (!isValidated) {
          await AsyncStorage.setItem('showWelcomePage', 'true');
        }
        
        onLogin(shop);
      }
    } catch (error) {
      // Fallback local pour smartphone
      try {
        const localShops = await AsyncStorage.getItem('localShops');
        const shops = localShops ? JSON.parse(localShops) : [];
        const shop = shops.find(s => s.email === email && s.password === password);
        
        if (shop) {
          // Vérifier le statut de validation (local)
          const isValidated = shop.isApproved || false;
          
          // Enregistrer l'ID de la boutique pour les notifications
          await AsyncStorage.setItem('currentShopId', shop._id);
          
          // Si pas validée, marquer comme première connexion
          if (!isValidated) {
            await AsyncStorage.setItem('showWelcomePage', 'true');
          }
          
          onLogin(shop);
        } else {
          Platform.OS === 'web' ? alert('Email ou mot de passe incorrect') : Alert.alert('Erreur', 'Email ou mot de passe incorrect');
        }
      } catch (localError) {
        Platform.OS === 'web' ? alert('Problème de connexion') : Alert.alert('Erreur', 'Problème de connexion');
      }
    }
  };

  const handleRegister = async () => {
    if (!shopName || !email || !password || !address || !phone || !whatsapp || !location.latitude || !location.longitude || !category) {
      Platform.OS === 'web' ? alert('جميع الحقول مطلوبة بما فيها الصنف والموقع') : Alert.alert('خطأ', 'جميع الحقول مطلوبة بما فيها الصنف والموقع');
      return;
    }
    // Vérification du format du numéro de téléphone international (ex: +33..., +225..., etc.)
    // ou format local de la Mauritanie (ex: 2xxxxxxx, 3xxxxxxx, 4xxxxxxx)
    const internationalPhoneRegex = /^\+\d{7,15}$/;
    const mauritaniaLocalRegex = /^[234]\d{7}$/;
    if (!internationalPhoneRegex.test(phone) && !mauritaniaLocalRegex.test(phone)) {
      Platform.OS === 'web' ? alert('Le numéro de téléphone doit être au format international (ex: +225xxxxxxxx) ou au format local mauritanien (ex: 2xxxxxxx, 3xxxxxxx, 4xxxxxxx)') : Alert.alert('Erreur', 'Le numéro de téléphone doit être au format international (ex: +225xxxxxxxx) ou au format local mauritanien (ex: 2xxxxxxx, 3xxxxxxx, 4xxxxxxx)');
      return;
    }
    if (!internationalPhoneRegex.test(whatsapp) && !mauritaniaLocalRegex.test(whatsapp)) {
      Platform.OS === 'web' ? alert('Le numéro WhatsApp doit être au format international (ex: +225xxxxxxxx) ou au format local mauritanien (ex: 2xxxxxxx, 3xxxxxxx, 4xxxxxxx)') : Alert.alert('Erreur', 'Le numéro WhatsApp doit être au format international (ex: +225xxxxxxxx) ou au format local mauritanien (ex: 2xxxxxxx, 3xxxxxxx, 4xxxxxxx)');
      return;
    }
    
    
    try {
      const shopData = {
        name: shopName,
        email,
        password,
        address,
        phone,
        whatsapp,
        category,
        location: {
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude)
        }
      };
      
      // Essayer l'API d'abord
      const shop = await shopAPI.register(shopData);
      if (shop.error) {
        Platform.OS === 'web' ? alert(shop.error) : Alert.alert('Erreur', shop.error);
      } else {
        // Enregistrer l'ID de la boutique pour les notifications
        await AsyncStorage.setItem('currentShopId', shop.shop._id);
        
        // Marquer pour afficher la page d'accueil (nouvelle boutique)
        await AsyncStorage.setItem('showWelcomePage', 'true');
        
        onLogin(shop.shop);
      }
    } catch (error) {
      // Fallback local pour smartphone
      try {
        const newShop = {
          _id: Date.now().toString(),
          name: shopName,
          email,
          password,
          address,
          phone,
          whatsapp,
          category,
          location: {
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude)
          },
          createdAt: new Date().toISOString()
        };
          
        const localShops = await AsyncStorage.getItem('localShops');
        const shops = localShops ? JSON.parse(localShops) : [];
        
        // Vérifier si l'email existe déjà
        if (shops.find(s => s.email === email)) {
          Platform.OS === 'web' ? alert('Cet email est déjà utilisé') : Alert.alert('Erreur', 'Cet email est déjà utilisé');
          return;
        }
        
        // Utiliser la fonction dédiée pour marquer la boutique
        await markShopForSync(newShop);
        
        Platform.OS === 'web' ? alert('Boutique créée en mode local') : Alert.alert('Succès', 'Boutique créée en mode local');
        
        // Enregistrer l'ID de la boutique pour les notifications
        await AsyncStorage.setItem('currentShopId', newShop._id);
        
        // Marquer pour afficher la page d'accueil (nouvelle boutique)
        await AsyncStorage.setItem('showWelcomePage', 'true');
        
        onLogin(newShop);
        
        // Essayer de synchroniser immédiatement
        setTimeout(() => {
          console.log('🔄 Tentative de synchronisation automatique...');
          syncLocalData();
        }, 2000);
      } catch (localError) {
        Platform.OS === 'web' ? alert('Impossible de créer la boutique') : Alert.alert('Erreur', 'Impossible de créer la boutique');
      }
    }
  };

  // input style متناسق مع الواجهة
  const inputStyle = {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#FFD4C2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
    color: '#333',
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', minHeight: screenHeight }}>
      {/* طبقة علوية */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
        backgroundColor: '#FF6B35',
        borderBottomLeftRadius: 60, borderBottomRightRadius: 60,
      }} />
      <View style={{
        position: 'absolute', top: -60, right: -60,
        width: 200, height: 200, borderRadius: 100,

      }} />
      <View style={{
        position: 'absolute', bottom: 100, left: -80,
        width: 220, height: 220, borderRadius: 110,

      }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: isRegister ? 'flex-start' : 'center',
            paddingHorizontal: 24,
            paddingVertical: 40,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* شعار */}
          {!isRegister && (
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <Text style={{ fontSize: 48, marginBottom: 8 }}>🏪</Text>
              <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>
                {t('shopLogin')}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>
                مساحة المتجر
              </Text>
            </View>
          )}

          <Animated.View style={{
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
            backgroundColor: 'white',
            borderRadius: 20, padding: 24,
            shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15, shadowRadius: 16, elevation: 10,
          }}>

            <Text style={{ color: '#FF6B35', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
              🏪 {isRegister ? t('createShop') : t('shopLogin')}
            </Text>

              {isRegister && (
                <>
                  {/* معلومات المتجر */}
                  <Text style={{ color: '#333', fontSize: 11, fontWeight: 'bold', marginBottom: 6, opacity: 0.6 }}>ℹ️ معلومات المتجر</Text>
                  <TextInput
                    style={inputStyle}
                    placeholder={`${t('shopName')} *`}
                    placeholderTextColor="#aaa"
                    value={shopName}
                    onChangeText={setShopName}
                  />
                  <TextInput
                    style={[inputStyle, { minHeight: 60, textAlignVertical: 'top' }]}
                    placeholder={`${t('address')} *`}
                    placeholderTextColor="#aaa"
                    value={address}
                    onChangeText={(text) => setAddress(text.slice(0, 200))}
                    multiline
                    numberOfLines={3}
                  />

                  {/* التواصل */}
                  <Text style={{ color: '#333', fontSize: 11, fontWeight: 'bold', marginBottom: 6, marginTop: 4, opacity: 0.6 }}>📞 معلومات التواصل</Text>
                  <TextInput
                    style={inputStyle}
                    placeholder={`${t('phone')} *`}
                    placeholderTextColor="#aaa"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                  <TextInput
                    style={inputStyle}
                    placeholder={`${t('whatsapp')} *`}
                    placeholderTextColor="#aaa"
                    value={whatsapp}
                    onChangeText={setWhatsapp}
                    keyboardType="phone-pad"
                  />

                  {/* الصنف */}
                  <Text style={{ color: '#333', fontSize: 11, fontWeight: 'bold', marginBottom: 8, marginTop: 4, opacity: 0.6 }}>🏷️ صنف المتجر *</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {SHOP_CATEGORIES.map(cat => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setCategory(cat.id)}
                        style={{
                          flexDirection: 'row', alignItems: 'center',
                          paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
                          backgroundColor: category === cat.id ? '#FF6B35' : 'transparent',
                          borderWidth: 1, borderColor: '#FF6B35',
                        }}
                      >
                        <Text style={{ fontSize: 14, marginRight: 4 }}>{cat.icon}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: category === cat.id ? 'white' : '#FF6B35' }}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* الموقع */}
                  <Text style={{ color: '#333', fontSize: 11, fontWeight: 'bold', marginBottom: 6, opacity: 0.6 }}>📍 الموقع</Text>
                  <TouchableOpacity
                    onPress={getCurrentLocation}
                    disabled={loadingLocation}
                    style={{
                      backgroundColor: loadingLocation ? '#ccc' : '#FF6B35',
                      borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 6,
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                      {loadingLocation ? '🔄 ' + t('loading') + '...' : '📍 ' + t('getLocation')}
                    </Text>
                  </TouchableOpacity>
                  {location.latitude && location.longitude ? (
                    <Text style={{ color: '#2ecc71', fontSize: 12, textAlign: 'center', marginBottom: 10 }}>✅ {t('locationSet')}</Text>
                  ) : (
                    <Text style={{ color: '#e74c3c', fontSize: 12, textAlign: 'center', marginBottom: 10 }}>⚠️ {t('locationRequired')}</Text>
                  )}

                  {/* بيانات الدخول */}
                  <Text style={{ color: '#333', fontSize: 11, fontWeight: 'bold', marginBottom: 6, opacity: 0.6 }}>🔑 بيانات الدخول</Text>
                </>
              )}

              <TextInput
                style={inputStyle}
                placeholder={t('login')}
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <SimplePasswordInput
                style={inputStyle}
                placeholder={t('password')}
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                onPress={isRegister ? handleRegister : handleLogin}
                style={{
                  backgroundColor: '#FF6B35',
                  borderRadius: 10, paddingVertical: 14,
                  alignItems: 'center', marginTop: 8,
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                  {isRegister ? t('create') : t('connect')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsRegister(!isRegister)}
                style={{ marginTop: 16, alignItems: 'center' }}
              >
                <Text style={{ color: '#FF6B35', fontSize: 14 }}>
                  {isRegister ? t('alreadyAccount') : t('createShopAccount')}
                </Text>
              </TouchableOpacity>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export default ShopLogin;