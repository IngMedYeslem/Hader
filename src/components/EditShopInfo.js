import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import styles from './styles';

const SHOP_CATEGORIES = [
  { id: 'food', icon: '🍔' },
  { id: 'grocery', icon: '🛒' },
  { id: 'pharmacy', icon: '💊' },
  { id: 'electronics', icon: '📱' },
  { id: 'fashion', icon: '👗' },
  { id: 'other', icon: '📦' },
];

export const EditShopInfo = ({ shop, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: shop.name || '',
    email: shop.email || '',
    address: shop.address || '',
    phone: shop.phone || '',
    whatsapp: shop.whatsapp || '',
    description: shop.description || '',
    stock: shop.stock?.toString() || '0',
    category: shop.category || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.address || !formData.phone) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires');
      return;
    }

    setIsLoading(true);
    try {
      const dataToSend = {
        ...formData,
        stock: parseInt(formData.stock) || 0
      };

      const response = await fetch(`http://192.168.0.132:3000/api/shops/${shop._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
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
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF6B35', marginBottom: 20 }}>
          Modifier les informations
        </Text>

        <Text style={{ color: '#FF6B35', marginBottom: 5 }}>Nom de la boutique</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({...formData, name: text})}
          placeholder="Nom de la boutique"
        />

        <Text style={{ color: '#FF6B35', marginBottom: 5 }}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => setFormData({...formData, email: text})}
          placeholder="Email"
          keyboardType="email-address"
        />

        <Text style={{ color: '#FF6B35', marginBottom: 5 }}>Adresse</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(text) => setFormData({...formData, address: text})}
          placeholder="Adresse complète"
          multiline
        />

        <Text style={{ color: '#FF6B35', marginBottom: 5 }}>Téléphone</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => setFormData({...formData, phone: text})}
          placeholder="Numéro de téléphone"
          keyboardType="phone-pad"
        />

        <Text style={{ color: '#FF6B35', marginBottom: 5 }}>WhatsApp</Text>
        <TextInput
          style={styles.input}
          value={formData.whatsapp}
          onChangeText={(text) => setFormData({...formData, whatsapp: text})}
          placeholder="Numéro WhatsApp"
          keyboardType="phone-pad"
        />

        <Text style={{ color: '#FF6B35', marginBottom: 5 }}>Description</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={formData.description}
          onChangeText={(text) => setFormData({...formData, description: text})}
          placeholder="Description de la boutique"
          multiline
          numberOfLines={3}
        />

        <Text style={{ color: '#FF6B35', marginBottom: 5 }}>Stock disponible</Text>
        <TextInput
          style={styles.input}
          value={formData.stock}
          onChangeText={(text) => setFormData({...formData, stock: text})}
          placeholder="Quantité en stock"
          keyboardType="numeric"
        />

        <Text style={{ color: '#FF6B35', marginBottom: 5 }}>Catégorie</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 }}>
          {SHOP_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setFormData({...formData, category: cat.id})}
              style={{
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
                backgroundColor: formData.category === cat.id ? '#FF6B35' : 'rgba(255,107,53,0.08)',
                borderWidth: 1,
                borderColor: formData.category === cat.id ? '#FF6B35' : 'rgba(255,107,53,0.2)',
              }}
            >
              <Text style={{ fontSize: 14, marginRight: 4 }}>{cat.icon}</Text>
              <Text style={{ fontSize: 12, color: formData.category === cat.id ? 'white' : '#FF6B35', fontWeight: '600' }}>
                {cat.id}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#FF6B35', padding: 15, borderRadius: 8, alignItems: 'center' }}
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