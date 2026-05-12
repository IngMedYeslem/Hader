import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import styles from './styles';
import { useTranslation } from '../translations';
import { API_URL } from '../config/api';



const SHOP_CATEGORIES = [
  { id: 'food', icon: '🍔' },
  { id: 'grocery', icon: '🛒' },
  { id: 'pharmacy', icon: '💊' },
  { id: 'electronics', icon: '📱' },
  { id: 'fashion', icon: '👗' },
  { id: 'other', icon: '📦' },
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
  const isRTL = currentLanguage === 'ar';

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
                    }}
                  >
                    <Text style={{ fontSize: 14, marginRight: 4 }}>{cat.icon}</Text>
                    <Text style={{ fontSize: 12, color: selected ? 'white' : '#FF6B35', fontWeight: '600' }}>
                      {t(cat.id)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={styles.addProductInput}
              placeholder="Latitude (ex: 5.3364) *"
              placeholderTextColor="#999"
              value={formData.latitude}
              onChangeText={(text) => setFormData(prev => ({...prev, latitude: text}))}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.addProductInput}
              placeholder="Longitude (ex: -4.0267) *"
              placeholderTextColor="#999"
              value={formData.longitude}
              onChangeText={(text) => setFormData(prev => ({...prev, longitude: text}))}
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