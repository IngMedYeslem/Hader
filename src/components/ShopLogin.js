import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const { t } = useTranslation();

  useEffect(() => {
    // Synchroniser automatiquement au démarrage
    syncLocalData();
  }, []);

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
    if (shopName && email && password) {
      try {
        // Essayer l'API d'abord
        const shop = await shopAPI.register(shopName, email, password);
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
    } else {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
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
              {isRegister ? 'Créer une Boutique' : 'Connexion Boutique'}
            </Text>
            
            {isRegister && (
              <TextInput
                style={styles.addProductInput}
                placeholder="Nom de la boutique"
                placeholderTextColor="#999"
                value={shopName}
                onChangeText={setShopName}
              />
            )}
            
            <TextInput
              style={styles.addProductInput}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            
            <TextInput
              style={styles.addProductInput}
              placeholder="Mot de passe"
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
                {isRegister ? 'Créer' : 'Se connecter'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={() => setIsRegister(!isRegister)}
            >
              <Text style={styles.colorText}>
                {isRegister ? 'Déjà un compte ?' : 'Créer une boutique'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

export default ShopLogin;