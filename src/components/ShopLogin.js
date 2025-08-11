import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import SimpleNavbar from './SimpleNavbar';
import styles from './styles';
import { useTranslation } from '../translations';
import { shopAPI } from '../services/api';
import { syncService, markShopForSync } from '../services/syncService';

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

  useEffect(() => {
    // Synchroniser automatiquement au démarrage
    syncLocalData();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Permission de localisation requise');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString()
      });
      Alert.alert('Succès', 'Localisation obtenue automatiquement');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'obtenir la localisation');
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
        Alert.alert('Erreur', shop.error);
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
          Alert.alert('Erreur', 'Email ou mot de passe incorrect');
        }
      } catch (localError) {
        Alert.alert('Erreur', 'Problème de connexion');
      }
    }
  };

  const handleRegister = async () => {
    if (!shopName || !email || !password || !address || !phone || !whatsapp || !location.latitude || !location.longitude) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires, y compris la localisation');
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
        Alert.alert('Erreur', shop.error);
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
          Alert.alert('Erreur', 'Cet email est déjà utilisé');
          return;
        }
        
        // Utiliser la fonction dédiée pour marquer la boutique
        await markShopForSync(newShop);
        
        Alert.alert('Succès', 'Boutique créée en mode local');
        onLogin(newShop);
        
        // Essayer de synchroniser immédiatement
        setTimeout(() => {
          console.log('🔄 Tentative de synchronisation automatique...');
          syncLocalData();
        }, 2000);
      } catch (localError) {
        Alert.alert('Erreur', 'Impossible de créer la boutique');
      }
    }
  };

  return (
    <View style={styles.wrapper}>
      <SimpleNavbar />
      <ImageBackground 
        source={require('../../assets/b2.jpeg')} 
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.centeredContainer}>
          <View style={styles.card}>
            <Text style={styles.authTitle}>
              {isRegister ? t('createShop') : t('shopLogin')}
            </Text>
            
            {isRegister && (
              <>
                <TextInput
                  style={styles.addProductInput}
                  placeholder={`${t('shopName')} *`}
                  placeholderTextColor="#999"
                  value={shopName}
                  onChangeText={setShopName}
                />
                <TextInput
                  style={styles.addProductInput}
                  placeholder={`${t('address')} *`}
                  placeholderTextColor="#999"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                />
                <TextInput
                  style={styles.addProductInput}
                  placeholder={`${t('phone')} *`}
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={styles.addProductInput}
                  placeholder={`${t('whatsapp')} *`}
                  placeholderTextColor="#999"
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                  keyboardType="phone-pad"
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TextInput
                    style={[styles.addProductInput, { flex: 1, marginRight: 5 }]}
                    placeholder={`${t('latitude')} *`}
                    placeholderTextColor="#999"
                    value={location.latitude}
                    onChangeText={(text) => setLocation({...location, latitude: text})}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.addProductInput, { flex: 1, marginLeft: 5 }]}
                    placeholder={`${t('longitude')} *`}
                    placeholderTextColor="#999"
                    value={location.longitude}
                    onChangeText={(text) => setLocation({...location, longitude: text})}
                    keyboardType="numeric"
                  />
                </View>
                <TouchableOpacity 
                  style={[styles.submitBtn, { backgroundColor: '#4CAF50', marginBottom: 10 }]} 
                  onPress={getCurrentLocation}
                >
                  <Text style={styles.submitText}>📍 {t('getLocation')}</Text>
                </TouchableOpacity>
              </>
            )}
            
            <TextInput
              style={styles.addProductInput}
              placeholder={t('login')}
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            
            <TextInput
              style={styles.addProductInput}
              placeholder={t('password')}
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={isRegister ? handleRegister : handleLogin}
            >
              <Text style={styles.submitText}>
                {isRegister ? t('create') : t('connect')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={() => setIsRegister(!isRegister)}
            >
              <Text style={styles.colorText}>
                {isRegister ? t('alreadyAccount') : t('createShopAccount')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

export default ShopLogin;