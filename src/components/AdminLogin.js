import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { styles } from './styles';

const API_URL = 'http://192.168.100.121:3000/api';

export default function AdminLogin({ onLoginSuccess, onBack }) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
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
        Alert.alert('Erreur', data.error || 'Identifiants incorrects');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
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
      <View style={{ backgroundColor: '#2C3E50', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 }}>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ color: '#C8A55F', fontSize: 14, fontWeight: 'bold' }}>
            ← Retour
          </Text>
        </TouchableOpacity>
        <Text style={{ color: '#C8A55F', fontSize: 14, textAlign: 'center', fontWeight: 'bold', padding: 8 }}>👨💼 Connexion Admin</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: 30, borderRadius: 15, width: '90%', maxWidth: 400 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#2C3E50' }}>
            Administration
          </Text>

          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 20 }}
            placeholder="Nom d'utilisateur"
            value={credentials.username}
            onChangeText={(text) => setCredentials({...credentials, username: text})}
            autoCapitalize="none"
          />

          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 30 }}
            placeholder="Mot de passe"
            value={credentials.password}
            onChangeText={(text) => setCredentials({...credentials, password: text})}
            secureTextEntry
          />

          <TouchableOpacity
            style={{ marginTop: 20, padding: 12, backgroundColor: '#C8A55F', borderRadius: 30, opacity: loading ? 0.7 : 1 }}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Text>
          </TouchableOpacity>

          <View style={{ backgroundColor: '#fff3cd', padding: 15, borderRadius: 8, marginTop: 20 }}>
            <Text style={{ color: '#856404', fontSize: 12, textAlign: 'center' }}>
              Connectez-vous avec votre compte administrateur
            </Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}