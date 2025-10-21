import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ImageBackground, Platform } from 'react-native';
import styles from './styles';
import { useTranslation } from '../translations';

const API_URL = 'http://172.20.10.5:3000/api';

export default function CreateShop({ onBack, onShopCreated }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
    whatsapp: '',
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(false);

  const handleCreateShop = async () => {
    // Validation - tous les champs sont obligatoires
    if (!formData.name || !formData.email || !formData.password || !formData.address || !formData.phone || !formData.whatsapp || !formData.latitude || !formData.longitude) {
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
      const response = await fetch(`${API_URL}/shop/create`, {
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
            name: '', 
            email: '', 
            password: '', 
            confirmPassword: '', 
            address: '', 
            phone: '', 
            whatsapp: '',
            latitude: '',
            longitude: ''
          });
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
                    name: '', 
                    email: '', 
                    password: '', 
                    confirmPassword: '', 
                    address: '', 
                    phone: '', 
                    whatsapp: '',
                    latitude: '',
                    longitude: ''
                  });
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
    <View style={styles.wrapper}>
      <ImageBackground 
        source={require('../../assets/b2.jpeg')} 
        style={styles.background}
        resizeMode="cover"
      >
        <View style={[styles.headerGlobal, { 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: 10,
          paddingTop: Platform.OS === 'ios' ? 50 : 10
        }]}>
          <TouchableOpacity onPress={onBack} style={{ marginRight: 10 }}>
            <Text style={styles.colorText}>
              {t('back')}
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.textcoprit, { fontSize: 14 }]}>🏪 {t('createShop')}</Text>
            <Text style={{ color: '#C8A55F', fontSize: 10, opacity: 0.8 }}>
              {t('newShopRegistration')}
            </Text>
          </View>
        </View>

        <View style={styles.centeredContainer}>
          <View style={styles.card}>
            <Text style={[styles.authTitle, { fontSize: 24, marginBottom: 30 }]}>
              {t('createShop')}
            </Text>

            <TextInput
              style={styles.addProductInput}
              placeholder={`${t('shopName')} *`}
              placeholderTextColor="#999"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />

            <TextInput
              style={styles.addProductInput}
              placeholder={`${t('email')} *`}
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.addProductInput}
              placeholder={`${t('password')} *`}
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              secureTextEntry
            />

            <TextInput
              style={styles.addProductInput}
              placeholder={`${t('confirmPassword')} *`}
              placeholderTextColor="#999"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
              secureTextEntry
            />

            <TextInput
              style={styles.addProductInput}
              placeholder={`${t('address')} *`}
              placeholderTextColor="#999"
              value={formData.address}
              onChangeText={(text) => setFormData({...formData, address: text})}
              multiline
            />

            <TextInput
              style={styles.addProductInput}
              placeholder={`${t('phone')} *`}
              placeholderTextColor="#999"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.addProductInput}
              placeholder={`${t('whatsapp')} *`}
              placeholderTextColor="#999"
              value={formData.whatsapp}
              onChangeText={(text) => setFormData({...formData, whatsapp: text})}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.addProductInput}
              placeholder="Latitude (ex: 5.3364) *"
              placeholderTextColor="#999"
              value={formData.latitude}
              onChangeText={(text) => setFormData({...formData, latitude: text})}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.addProductInput}
              placeholder="Longitude (ex: -4.0267) *"
              placeholderTextColor="#999"
              value={formData.longitude}
              onChangeText={(text) => setFormData({...formData, longitude: text})}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]}
              onPress={handleCreateShop}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? t('creating') : t('createShop')}
              </Text>
            </TouchableOpacity>

            <View style={{ backgroundColor: '#fff3cd', padding: 15, borderRadius: 8, marginTop: 20 }}>
              <Text style={{ color: '#856404', fontSize: 12, textAlign: 'center', fontWeight: 'bold' }}>
                ⚠️ {t('important')}
              </Text>
              <Text style={{ color: '#856404', fontSize: 12, textAlign: 'center', marginTop: 5 }}>
                {t('allFieldsRequired')}
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}