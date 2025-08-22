import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ImageBackground } from 'react-native';
import SimplePasswordInput from './SimplePasswordInput';
import styles from './styles';
import { useTranslation } from '../translations';

const API_URL = 'http://172.20.10.6:3000/api';

export default function CreateAdmin({ onBack, onAdminCreated }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleCreateAdmin = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert(t('error'), t('passwordsDontMatch'));
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert(t('error'), t('passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(
          t('success'),
          `${t('adminCreated')}: "${formData.username}"`,
          [
            {
              text: 'OK',
              onPress: () => {
                setFormData({ username: '', email: '', password: '', confirmPassword: '' });
                onAdminCreated && onAdminCreated();
              }
            }
          ]
        );
      } else {
        Alert.alert(t('error'), data.error || t('error'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('connectionError'));
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
      <View style={{ backgroundColor: '#2C3E50', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 }}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.colorText}>
            {t('back')}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.authTitle, { fontSize: 16, padding: 8 }]}>
          👨💼 {t('createAdmin')}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={styles.card}>
          <Text style={[styles.authTitle, { fontSize: 24, marginBottom: 30 }]}>
            {t('newAdminAccount')}
          </Text>

          <TextInput
            style={styles.addProductInput}
            placeholder={t('username')}
            placeholderTextColor="#999"
            value={formData.username}
            onChangeText={(text) => setFormData({...formData, username: text})}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.addProductInput}
            placeholder={t('email')}
            placeholderTextColor="#999"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <SimplePasswordInput
            style={styles.addProductInput}
            placeholder={t('password')}
            placeholderTextColor="#999"
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
          />

          <SimplePasswordInput
            style={styles.addProductInput}
            placeholder={t('confirmPassword')}
            placeholderTextColor="#999"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
          />

          <TouchableOpacity
            style={[styles.submitBtn, { opacity: loading ? 0.7 : 1 }]}
            onPress={handleCreateAdmin}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? t('creating') : t('createAdminAccount')}
            </Text>
          </TouchableOpacity>

          <View style={{ backgroundColor: '#fff3cd', padding: 15, borderRadius: 8, marginTop: 20 }}>
            <Text style={{ color: '#856404', fontSize: 12, textAlign: 'center', fontWeight: 'bold' }}>
              ⚠️ {t('important')}
            </Text>
            <Text style={{ color: '#856404', fontSize: 12, textAlign: 'center', marginTop: 5 }}>
              {t('adminRights')}
            </Text>
          </View>
        </View>
        </View>
      </ImageBackground>
    </View>
  );
}