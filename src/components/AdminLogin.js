import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground, Platform } from 'react-native';
import { useTranslation } from '../translations';
import styles from './styles';

const API_URL = 'http://172.20.10.6:3000/api';

export default function AdminLogin({ onLoginSuccess, onBack }) {
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      Platform.OS === 'web' ? alert(t('fillAllFields')) : Alert.alert(t('error'), t('fillAllFields'));
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
        Platform.OS === 'web' ? alert(data.error || t('incorrectCredentials')) : Alert.alert(t('error'), data.error || t('incorrectCredentials'));
      }
    } catch (error) {
      Platform.OS === 'web' ? alert(t('connectionError')) : Alert.alert(t('error'), t('connectionError'));
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
      <View style={[styles.headerGlobal, { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 10,
        paddingTop: Platform.OS === 'ios' ? 50 : 10
      }]}>
        <TouchableOpacity onPress={onBack} style={{ marginRight: 10 }}>
          <Text style={styles.colorText}>
            ← {t('back')}
          </Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.textcoprit, { fontSize: 14 }]}>👨💼 {t('adminLogin')}</Text>
          <Text style={{ color: '#C8A55F', fontSize: 10, opacity: 0.8 }}>
            {t('administration')}
          </Text>
        </View>
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