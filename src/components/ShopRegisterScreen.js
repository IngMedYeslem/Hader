import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ImageBackground } from 'react-native';
import styles from './styles';
import { useTranslation } from '../translations';

export default function ShopRegisterScreen({ navigation }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
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

  const handleRegister = async () => {
    if (!formData.username || !formData.email || !formData.password || !formData.address || !formData.phone || !formData.whatsapp || !formData.latitude || !formData.longitude) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    Alert.alert(
      'Demande enregistrée',
      'Votre demande de création de compte boutique a été enregistrée. Un administrateur va l\'examiner.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  return (
    <View style={styles.wrapper}>
      <ImageBackground 
        source={require('../../assets/b2.jpeg')} 
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.centeredContainer}>
          <View style={styles.card}>
            <Text style={[styles.authTitle, { fontSize: 24, marginBottom: 30 }]}>
              {t('shopRegistration')}
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center', color: '#C8A55F' }}>
              {t('createShopAccount')}
            </Text>

            <TextInput
              style={styles.addProductInput}
              placeholder={`${t('shopName')} *`}
              placeholderTextColor="#999"
              value={formData.username}
              onChangeText={(text) => setFormData({...formData, username: text})}
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
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.submitText}>
                {loading ? t('creating') : t('createShopAccount')}
              </Text>
            </TouchableOpacity>

            <View style={{ backgroundColor: '#fff3cd', padding: 10, borderRadius: 5, marginTop: 15 }}>
              <Text style={{ color: '#856404', fontSize: 12, textAlign: 'center', fontWeight: 'bold', marginBottom: 5 }}>
                ⚠️ {t('important')}
              </Text>
              <Text style={{ color: '#856404', fontSize: 12, textAlign: 'center', marginBottom: 5 }}>
                {t('allFieldsRequired')}
              </Text>
              <Text style={{ color: '#856404', fontSize: 12, textAlign: 'center' }}>
                {t('accountPending')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.colorText}>{t('alreadyAccount')} {t('connect')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}