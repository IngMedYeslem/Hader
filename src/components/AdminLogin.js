import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, Animated, ScrollView, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import { useTranslation } from '../translations';
import SimplePasswordInput from './SimplePasswordInput';
import styles from './styles';

const API_URL = 'http://192.168.0.132:3000/api';

export default function AdminLogin({ onLoginSuccess, onBack }) {
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const slideAnim = useState(new Animated.Value(300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  React.useEffect(() => {
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
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', backgroundColor: '#FF6B35', borderBottomLeftRadius: 60, borderBottomRightRadius: 60 }} />

      <SafeAreaView style={{ backgroundColor: 'transparent' }}>
        <View style={[styles.headerGlobal, { backgroundColor: '#FF6B35' }]}>
          {/* Premier niveau - Titre */}
          <View style={{ paddingVertical: 15, paddingHorizontal: 30, alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 16, 
            color: 'white', 
            fontWeight: 'bold'
          }}>
            👨💼 {t('adminLogin')}
          </Text>
          <Text style={{ 
            fontSize: 12, 
            color: 'white', 
            opacity: 0.7,
            marginTop: 4
          }}>
            {t('administration')}
          </Text>
        </View>
        
        {/* Deuxième niveau - Boutons */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'flex-start', 
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingBottom: 12,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,107,53,0.15)'
        }}>
          <TouchableOpacity onPress={onBack}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
              ← {t('back')}
            </Text>
          </TouchableOpacity>
        </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.centeredContainer}
          keyboardShouldPersistTaps="handled"
        >
        <Animated.View style={[
          styles.card, 
          { 
            width: '90%', 
            maxWidth: 400,
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim
          }
        ]}>
          <Text style={[styles.authTitle, { fontSize: 22, marginBottom: 25 }]}>
            🛠️ {t('administration')}
          </Text>

          <TextInput
            style={[styles.addProductInput, { color: '#333' }]}
            placeholder={t('username')}
            placeholderTextColor="#666"
            value={credentials.username}
            onChangeText={(text) => setCredentials({...credentials, username: text})}
            autoCapitalize="none"
          />

          <SimplePasswordInput
            style={[styles.addProductInput, { color: '#333' }]}
            placeholder={t('password')}
            placeholderTextColor="#666"
            value={credentials.password}
            onChangeText={(text) => setCredentials({...credentials, password: text})}
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

          <View style={{ backgroundColor: 'transparent', padding: 12, borderRadius: 8, marginTop: 15 }}>
            <Text style={{ color: '#555', fontSize: 12, textAlign: 'center' }}>
              {t('adminLoginInfo')}
            </Text>
          </View>
        </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}