import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { styles } from './styles';

export default function ShopRegisterScreen({ navigation }) {
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
    <ScrollView style={{ flex: 1, backgroundColor: '#2C3E50' }}>
      <View style={styles.centeredContainer}>
        <Text style={[styles.authTitle, { fontSize: 24, marginBottom: 30 }]}>
          Inscription Boutique
        </Text>
        
        <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: 20, borderRadius: 10, width: '90%' }}>
          <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center', color: '#666' }}>
            Créez votre compte boutique pour vendre vos produits
          </Text>

          <TextInput
            style={[styles.searchInput, { marginBottom: 15 }]}
            placeholder="Nom de la boutique *"
            value={formData.username}
            onChangeText={(text) => setFormData({...formData, username: text})}
          />

          <TextInput
            style={[styles.searchInput, { marginBottom: 15 }]}
            placeholder="Email *"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.searchInput, { marginBottom: 15 }]}
            placeholder="Mot de passe *"
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            secureTextEntry
          />

          <TextInput
            style={[styles.searchInput, { marginBottom: 15 }]}
            placeholder="Confirmer le mot de passe *"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
            secureTextEntry
          />

          <TextInput
            style={[styles.searchInput, { marginBottom: 15 }]}
            placeholder="Adresse complète *"
            value={formData.address}
            onChangeText={(text) => setFormData({...formData, address: text})}
            multiline
          />

          <TextInput
            style={[styles.searchInput, { marginBottom: 15 }]}
            placeholder="Numéro de téléphone *"
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            keyboardType="phone-pad"
          />

          <TextInput
            style={[styles.searchInput, { marginBottom: 15 }]}
            placeholder="Numéro WhatsApp *"
            value={formData.whatsapp}
            onChangeText={(text) => setFormData({...formData, whatsapp: text})}
            keyboardType="phone-pad"
          />

          <TextInput
            style={[styles.searchInput, { marginBottom: 15 }]}
            placeholder="Latitude (ex: 5.3364) *"
            value={formData.latitude}
            onChangeText={(text) => setFormData({...formData, latitude: text})}
            keyboardType="numeric"
          />

          <TextInput
            style={[styles.searchInput, { marginBottom: 20 }]}
            placeholder="Longitude (ex: -4.0267) *"
            value={formData.longitude}
            onChangeText={(text) => setFormData({...formData, longitude: text})}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[styles.buttonlogin, { opacity: loading ? 0.7 : 1 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              {loading ? 'Inscription...' : 'Créer mon compte boutique'}
            </Text>
          </TouchableOpacity>

          <View style={{ backgroundColor: '#fff3cd', padding: 10, borderRadius: 5, marginTop: 15 }}>
            <Text style={{ color: '#856404', fontSize: 12, textAlign: 'center', fontWeight: 'bold', marginBottom: 5 }}>
              ⚠️ Important
            </Text>
            <Text style={{ color: '#856404', fontSize: 12, textAlign: 'center', marginBottom: 5 }}>
              Tous les champs marqués d'un * sont obligatoires
            </Text>
            <Text style={{ color: '#856404', fontSize: 12, textAlign: 'center' }}>
              Votre compte sera en attente d'approbation par un administrateur avant de pouvoir ajouter des produits.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={{ color: '#C8A55F' }}>Déjà un compte ? Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}