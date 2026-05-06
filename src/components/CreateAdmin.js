import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import SimplePasswordInput from './SimplePasswordInput';
import styles from './styles';
import { useTranslation } from '../translations';

const API_URL = 'http://192.168.0.110:3000/api';

export default function CreateAdmin({ onBack, onAdminCreated }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text, type = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleCreateAdmin = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      showMessage('Format d\'email invalide', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      console.log('❌ Mots de passe différents');
      showMessage(t('passwordsDontMatch'), 'error');
      return;
    }

    if (formData.password.length < 6) {
      console.log('❌ Mot de passe trop court');
      showMessage(t('passwordTooShort'), 'error');
      return;
    }

    console.log('✅ Validation réussie, envoi au serveur...');
    setLoading(true);
    showMessage('Création du compte en cours...', 'info');
    
    try {
      console.log('🌐 URL API:', `${API_URL}/admin/create`);
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

      console.log('📡 Réponse serveur status:', response.status);
      const data = await response.json();
      console.log('📡 Réponse serveur data:', data);
      
      if (response.ok) {
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        Alert.alert(
          t('success'),
          `${t('adminCreated')}: "${formData.username}"`,
          [
            {
              text: 'OK',
              onPress: () => {
                onAdminCreated && onAdminCreated();
              }
            }
          ]
        );
      } else {
        console.log('❌ Erreur serveur:', data.error);
        showMessage(data.error || t('connectionError'), 'error');
      }
    } catch (error) {
      console.log('❌ Erreur réseau:', error);
      showMessage(t('connectionError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', backgroundColor: '#FF6B35', borderBottomLeftRadius: 60, borderBottomRightRadius: 60 }} />

      <View style={{ backgroundColor: 'transparent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, paddingTop: 50 }}>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
            {t('back')}
          </Text>
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          👨💼 {t('createAdmin')}
        </Text>
        <View style={{ width: 50 }} />
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={styles.card}>
          <Text style={[styles.authTitle, { fontSize: 24, marginBottom: 20 }]}>
            {t('newAdminAccount')}
          </Text>

          {message.text ? (
            <View style={{
              backgroundColor: message.type === 'success' ? '#d4edda' : message.type === 'error' ? '#f8d7da' : '#d1ecf1',
              borderColor: message.type === 'success' ? '#c3e6cb' : message.type === 'error' ? '#f5c6cb' : '#bee5eb',
              borderWidth: 1,
              borderRadius: 8,
              padding: 12,
              marginBottom: 20
            }}>
              <Text style={{
                color: message.type === 'success' ? '#155724' : message.type === 'error' ? '#721c24' : '#0c5460',
                fontSize: 14,
                textAlign: 'center'
              }}>
                {message.type === 'success' ? '✅ ' : message.type === 'error' ? '❌ ' : 'ℹ️ '}
                {message.text}
              </Text>
            </View>
          ) : null}

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
            style={[styles.submitBtn, { 
              opacity: loading ? 0.7 : 1,
              backgroundColor: loading ? '#ccc' : '#FF6B35'
            }]}
            onPress={() => {
              console.log('🖱️ Bouton pressé!');
              handleCreateAdmin();
            }}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.submitText}>
              {loading ? t('creating') : t('createAdminAccount')}
            </Text>
          </TouchableOpacity>

          <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 8, marginTop: 20 }}>
            <Text style={{ color: '#555', fontSize: 12, textAlign: 'center', fontWeight: 'bold' }}>
              ⚠️ {t('important')}
            </Text>
            <Text style={{ color: '#555', fontSize: 12, textAlign: 'center', marginTop: 5 }}>
              {t('adminRights')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}