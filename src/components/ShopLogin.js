import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, Alert, Platform, ScrollView, KeyboardAvoidingView, Dimensions, Animated } from 'react-native';
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
  const { t } = useTranslation();
  const slideAnim = useState(new Animated.Value(300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Synchroniser automatiquement au démarrage
    syncLocalData();
    
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
        onLogin(shop);
      }
    } catch (error) {
      // Fallback local pour smartphone
      try {
        const localShops = await AsyncStorage.getItem('localShops');
        const shops = localShops ? JSON.parse(localShops) : [];
        const shop = shops.find(s => s.email === email && s.password === password);
        
        if (shop) {
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
    if (!shopName || !email || !password || !address || !phone || !whatsapp || !location.latitude || !location.longitude) {
      Platform.OS === 'web' ? alert('Tous les champs sont obligatoires, y compris la localisation') : Alert.alert('Erreur', 'Tous les champs sont obligatoires, y compris la localisation');
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
        onLogin(shop);
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

  // Styles fixes pour éviter les re-calculs
  const locationRowStyle = {
    flexDirection: 'column',
    marginBottom: 10,
  };
  
  const locationInputStyle = {
    marginBottom: 10,
  };

  return (
    <View style={[styles.wrapper, styles.shopLoginContainer, { minHeight: screenHeight }]}>
      <ImageBackground 
        source={require('../../assets/b2.jpeg')} 
        style={styles.background}
        resizeMode="cover"
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView 
            contentContainerStyle={[styles.shopLoginScrollContent, { 
              justifyContent: isRegister ? 'flex-start' : 'center',
              paddingBottom: Platform.OS === 'android' ? 50 : 20
            }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
          >
            <Animated.View style={[
              styles.shopLoginFormCard,
              {
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim
              }
            ]}>
              <Text style={[styles.authTitle, { fontSize: 18, marginBottom: 15 }]}>
                {isRegister ? t('createShop') : t('shopLogin')}
              </Text>
              
              {isRegister && (
                <>
                  {/* Section Informations générales */}
                  <View style={{ backgroundColor: 'rgba(200, 165, 95, 0.1)', padding: 8, borderRadius: 8, marginBottom: 8 }}>
                    <RTLTextInput
                      style={[styles.addProductInput, { fontSize: 16, paddingVertical: 15, height: 50 }]}
                      placeholder={`${t('shopName')} *`}
                      placeholderTextColor="#999"
                      value={shopName}
                      onChangeText={setShopName}
                      autoCapitalize="words"
                    />
                    
                    <RTLTextInput
                      style={[styles.addProductInput, { 
                        fontSize: 16, 
                        paddingVertical: 15,
                        minHeight: 60,
                        textAlignVertical: 'top',
                        marginBottom: 0
                      }]}
                      placeholder={`${t('address')} * (${t('maxCharacters')})`}
                      placeholderTextColor="#999"
                      value={address}
                      onChangeText={(text) => setAddress(text.slice(0, 200))}
                      multiline
                      maxLength={200}
                      numberOfLines={3}
                    />
                  </View>
                  
                  {/* Section Contact */}
                  <View style={{ backgroundColor: 'rgba(200, 165, 95, 0.1)', padding: 8, borderRadius: 8, marginBottom: 8 }}>
                    <RTLTextInput
                      style={[styles.addProductInput, { fontSize: 16, paddingVertical: 15, height: 50 }]}
                      placeholder={`${t('phone')} *`}
                      placeholderTextColor="#999"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      autoCompleteType="tel"
                    />
                    
                    <RTLTextInput
                      style={[styles.addProductInput, { fontSize: 16, paddingVertical: 15, height: 50, marginBottom: 0 }]}
                      placeholder={`${t('whatsapp')} *`}
                      placeholderTextColor="#999"
                      value={whatsapp}
                      onChangeText={setWhatsapp}
                      keyboardType="phone-pad"
                      autoCompleteType="tel"
                    />
                  </View>
                  
                  {/* Section Localisation */}
                  <View style={{ backgroundColor: 'rgba(200, 165, 95, 0.1)', padding: 8, borderRadius: 8, marginBottom: 8 }}>
                    <TouchableOpacity 
                      style={[styles.submitBtn, { 
                        backgroundColor: '#4CAF50', 
                        marginTop: 0,
                        marginBottom: 0,
                        paddingVertical: 15,
                        borderRadius: 12
                      }]} 
                      onPress={getCurrentLocation}
                    >
                      <Text style={[styles.submitText, { fontSize: 16 }]}>📍 {t('getLocation')}</Text>
                    </TouchableOpacity>
                    {(location.latitude && location.longitude) ? (
                      <Text style={{ marginTop: 10, color: '#333', fontSize: 15 }}>
                        {t('locationSet')}
                      </Text>
                    ) : (
                      <Text style={{ marginTop: 10, color: 'red', fontSize: 15 }}>
                        {t('locationRequired')}
                      </Text>
                    )}
                  </View>
                  {/* Section Connexion */}
                  <View style={{ backgroundColor: 'rgba(200, 165, 95, 0.1)', padding: 8, borderRadius: 8, marginBottom: 8 }}>
                    <RTLTextInput
                      style={[styles.addProductInput, { fontSize: 16, paddingVertical: 15, height: 50 }]}
                      placeholder={t('login')}
                      placeholderTextColor="#999"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCompleteType="email"
                    />
                    
                    <SimplePasswordInput
                      style={[styles.addProductInput, { fontSize: 16, paddingVertical: 15, height: 50, marginBottom: 0 }]}
                      placeholder={t('password')}
                      placeholderTextColor="#999"
                      value={password}
                      onChangeText={setPassword}
                      autoCompleteType="password"
                    />
                  </View>
                </>
              )}
              
              {!isRegister && (
                <View style={{ backgroundColor: 'rgba(200, 165, 95, 0.1)', padding: 8, borderRadius: 8, marginBottom: 8 }}>
                  <RTLTextInput
                    style={[styles.addProductInput, { fontSize: 16, paddingVertical: 15, height: 50 }]}
                    placeholder={t('login')}
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCompleteType="email"
                  />
                  
                  <SimplePasswordInput
                    style={[styles.addProductInput, { fontSize: 16, paddingVertical: 15, height: 50, marginBottom: 0 }]}
                    placeholder={t('password')}
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    autoCompleteType="password"
                  />
                </View>
              )}
              
              <TouchableOpacity 
                style={[styles.submitBtn, { 
                  paddingVertical: 12,
                  borderRadius: 8,
                  marginTop: 8
                }]} 
                onPress={isRegister ? handleRegister : handleLogin}
              >
                <Text style={[styles.submitText, { fontSize: 18 }]}>
                  {isRegister ? t('create') : t('connect')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.registerButton, { marginVertical: 15 }]} 
                onPress={() => setIsRegister(!isRegister)}
              >
                <Text style={[styles.colorText, { fontSize: 16, textAlign: 'center' }]}>
                  {isRegister ? t('alreadyAccount') : t('createShopAccount')}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

export default ShopLogin;