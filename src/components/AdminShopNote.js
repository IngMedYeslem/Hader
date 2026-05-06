import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import styles from './styles';

export const AdminShopNote = ({ shop, visible, onClose, onSave }) => {
  const [note, setNote] = useState(shop.missingDataNote || '');

  const handleSave = async () => {
    try {
      const response = await fetch(`http://192.168.0.110:3000/api/shops/${shop._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missingDataNote: note })
      });

      if (response.ok) {
        Alert.alert('Succès', 'Note sauvegardée');
        onSave?.(note);
        onClose();
      } else {
        Alert.alert('Erreur', 'Impossible de sauvegarder');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.shopInfoOverlay}>
        <View style={styles.shopInfoContainer}>
          <Text style={styles.shopInfoTitle}>Note pour {shop.name}</Text>
          
          <Text style={{ color: '#FF6B35', marginBottom: 10 }}>
            Expliquer les problèmes ou données manquantes :
          </Text>
          
          <TextInput
            style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
            value={note}
            onChangeText={setNote}
            placeholder="Décrire les problèmes identifiés..."
            multiline
          />
          
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
            <TouchableOpacity 
              style={[styles.closeInfoBtn, { flex: 1, backgroundColor: '#FF6B35' }]} 
              onPress={handleSave}
            >
              <Text style={[styles.closeInfoBtnText, { color: 'white' }]}>Sauvegarder</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.closeInfoBtn, { flex: 1, backgroundColor: '#ccc' }]} 
              onPress={onClose}
            >
              <Text style={styles.closeInfoBtnText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};