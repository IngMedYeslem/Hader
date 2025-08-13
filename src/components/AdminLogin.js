import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { useTranslation } from '../translations';
import styles from './styles';

const API_URL = 'http://192.168.100.121:3000/api';

export default function AdminLogin({ onLoginSuccess, onBack }) {
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        Alert.alert(t('error'), data.error || t('incorrectCredentials'));
      }
    } catch (error) {
      Alert.alert(t('error'), t('connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/b2.jpeg')} 
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={[styles.headerGlobal, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 }]}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.colorText}>
            ← {t('back')}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.textcoprit, { fontSize: 16 }]}>👨💼 {t('adminLogin')}</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.centeredContainer}>
        <View style={[styles.card, { width: '90%', maxWidth: 400 }]}>
          <Text style={[styles.authTitle, { fontSize: 22, marginBottom: 25 }]}>
            🛠️ {t('administration')}
          </Text>

          <TextInput
            style={[styles.addProductInput, { color: '#2C3E50' }]}
            placeholder={t('username')}
            placeholderTextColor="#666"
            value={credentials.username}
            onChangeText={(text) => setCredentials({...credentials, username: text})}
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.addProductInput, { color: '#2C3E50' }]}
            placeholder={t('password')}
            placeholderTextColor="#666"
            value={credentials.password}
            onChangeText={(text) => setCredentials({...credentials, password: text})}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.submitBtn, { opacity: loading ? 0.7 : 1, marginTop: 10 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? t('connecting') : t('connect')}
            </Text>
          </TouchableOpacity>

          <View style={{ backgroundColor: 'rgba(200, 165, 95, 0.1)', padding: 12, borderRadius: 8, marginTop: 15 }}>
            <Text style={{ color: '#C8A55F', fontSize: 12, textAlign: 'center' }}>
              {t('adminLoginInfo')}
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}