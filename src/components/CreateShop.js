import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { styles } from './styles';

const API_URL = 'http://192.168.100.121:3000/api';

export default function CreateShop({ onBack, onShopCreated }) {
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
      Alert.alert('Erreur', 'Tous les champs sont obligatoires');
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
          🏪 Créer une Boutique
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: 30, borderRadius: 15, width: '100%', maxWidth: 400 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#2C3E50' }}>
            Nouvelle Boutique
          </Text>

          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 }}
            placeholder="Nom de la boutique *"
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
          />

          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 }}
            placeholder="Email *"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 }}
            placeholder="Mot de passe *"
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            secureTextEntry
          />

          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 }}
            placeholder="Confirmer le mot de passe *"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
            secureTextEntry
          />

          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 }}
            placeholder="Adresse complète *"
            value={formData.address}
            onChangeText={(text) => setFormData({...formData, address: text})}
            multiline
          />

          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 }}
            placeholder="Numéro de téléphone *"
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            keyboardType="phone-pad"
          />

          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 }}
            placeholder="Numéro WhatsApp *"
            value={formData.whatsapp}
            onChangeText={(text) => setFormData({...formData, whatsapp: text})}
            keyboardType="phone-pad"
          />

          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 }}
            placeholder="Latitude (ex: 5.3364) *"
            value={formData.latitude}
            onChangeText={(text) => setFormData({...formData, latitude: text})}
            keyboardType="numeric"
          />

          <TextInput
            style={{ backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 30 }}
            placeholder="Longitude (ex: -4.0267) *"
            value={formData.longitude}
            onChangeText={(text) => setFormData({...formData, longitude: text})}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={{ marginTop: 20, padding: 12, backgroundColor: '#C8A55F', borderRadius: 30, opacity: loading ? 0.7 : 1 }}
            onPress={handleCreateShop}
            disabled={loading}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
              {loading ? 'Création...' : 'Créer la boutique'}
            </Text>
          </TouchableOpacity>

          <View style={{ backgroundColor: '#fff3cd', padding: 15, borderRadius: 8, marginTop: 20 }}>
            <Text style={{ color: '#856404', fontSize: 12, textAlign: 'center', fontWeight: 'bold' }}>
              ⚠️ Important
            </Text>
            <Text style={{ color: '#856404', fontSize: 12, textAlign: 'center', marginTop: 5 }}>
              Tous les champs marqués d'un * sont obligatoires
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}