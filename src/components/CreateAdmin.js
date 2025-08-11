import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { styles } from './styles';

const API_URL = 'http://192.168.100.121:3000/api';

export default function CreateAdmin({ onBack, onAdminCreated }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleCreateAdmin = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
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
          'Succès',
          `Compte admin "${formData.username}" créé avec succès`,
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
        Alert.alert('Erreur', data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ backgroundColor: '#2C3E50', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 }}>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ color: '#C8A55F', fontSize: 14, fontWeight: 'bold' }}>
            ← Retour
          </Text>
        </TouchableOpacity>
        <Text style={{ color: '#C8A55F', fontSize: 14, textAlign: 'center', fontWeight: 'bold', padding: 8 }}>
          👨💼 Créer un Admin
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: 30, borderRadius: 15, width: '100%', maxWidth: 400 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#2C3E50' }}>
            Nouveau Compte Admin
          </Text>

          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 }}
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChangeText={(text) => setFormData({...formData, username: text})}
            autoCapitalize="none"
          />

          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 }}
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 }}
            placeholder="Mot de passe"
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            secureTextEntry
          />

          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 30 }}
            placeholder="Confirmer le mot de passe"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
            secureTextEntry
          />

          <TouchableOpacity
            style={{ marginTop: 20, padding: 12, backgroundColor: '#C8A55F', borderRadius: 30, opacity: loading ? 0.7 : 1 }}
            onPress={handleCreateAdmin}
            disabled={loading}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
              {loading ? 'Création...' : 'Créer le compte admin'}
            </Text>
          </TouchableOpacity>

          <View style={{ backgroundColor: '#e3f2fd', padding: 15, borderRadius: 8, marginTop: 20 }}>
            <Text style={{ color: '#1976d2', fontSize: 12, textAlign: 'center', fontWeight: 'bold' }}>
              ⚠️ Important
            </Text>
            <Text style={{ color: '#1976d2', fontSize: 12, textAlign: 'center', marginTop: 5 }}>
              Le nouveau compte aura tous les droits d'administration
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}