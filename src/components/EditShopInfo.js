import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import styles from './styles';

export const EditShopInfo = ({ shop, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: shop.name || '',
    email: shop.email || '',
    address: shop.address || '',
    phone: shop.phone || '',
    whatsapp: shop.whatsapp || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.address || !formData.phone) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://172.20.10.5:3000/api/shops/${shop._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        Alert.alert('Succès', 'Informations mises à jour');
        onSave?.(formData);
      } else {
        Alert.alert('Erreur', 'Impossible de mettre à jour');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion');
    }
    setIsLoading(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#C8A55F', marginBottom: 20 }}>
          Modifier les informations
        </Text>

        <Text style={{ color: '#C8A55F', marginBottom: 5 }}>Nom de la boutique</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({...formData, name: text})}
          placeholder="Nom de la boutique"
        />

        <Text style={{ color: '#C8A55F', marginBottom: 5 }}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => setFormData({...formData, email: text})}
          placeholder="Email"
          keyboardType="email-address"
        />

        <Text style={{ color: '#C8A55F', marginBottom: 5 }}>Adresse</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(text) => setFormData({...formData, address: text})}
          placeholder="Adresse complète"
          multiline
        />

        <Text style={{ color: '#C8A55F', marginBottom: 5 }}>Téléphone</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => setFormData({...formData, phone: text})}
          placeholder="Numéro de téléphone"
          keyboardType="phone-pad"
        />

        <Text style={{ color: '#C8A55F', marginBottom: 5 }}>WhatsApp</Text>
        <TextInput
          style={styles.input}
          value={formData.whatsapp}
          onChangeText={(text) => setFormData({...formData, whatsapp: text})}
          placeholder="Numéro WhatsApp"
          keyboardType="phone-pad"
        />

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#C8A55F', padding: 15, borderRadius: 8, alignItems: 'center' }}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#ccc', padding: 15, borderRadius: 8, alignItems: 'center' }}
            onPress={onCancel}
          >
            <Text style={{ color: '#333', fontWeight: 'bold' }}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};