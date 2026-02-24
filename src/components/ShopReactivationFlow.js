import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

export const ShopReactivationFlow = ({ shopId }) => {
  const [shopStatus, setShopStatus] = useState('rejected');
  const [isLoading, setIsLoading] = useState(false);

  // 1. Vérifier le statut au démarrage
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Vérifier toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch(`http://192.168.0.138:3000/api/shops/${shopId}/status`);
      const data = await response.json();
      setShopStatus(data.status);
    } catch (error) {
      console.log('Erreur vérification statut:', error);
    }
  };

  // 2. Demander la réactivation
  const requestReactivation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://192.168.0.138:3000/api/shops/${shopId}/reactivate`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setShopStatus('pending_reactivation');
        Alert.alert('Succès', 'Demande envoyée. Vous serez notifié du résultat.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer la demande');
    }
    setIsLoading(false);
  };

  // 3. Affichage selon le statut
  if (shopStatus === 'approved') {
    return (
      <View style={{ padding: 20, backgroundColor: '#d4edda', borderRadius: 8 }}>
        <Text style={{ color: '#155724', fontWeight: 'bold' }}>
          ✅ Boutique active
        </Text>
      </View>
    );
  }

  if (shopStatus === 'pending_reactivation') {
    return (
      <View style={{ padding: 20, backgroundColor: '#d1ecf1', borderRadius: 8 }}>
        <Text style={{ color: '#0c5460', fontWeight: 'bold' }}>
          ⏳ Demande en cours d'examen
        </Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20, backgroundColor: '#f8d7da', borderRadius: 8 }}>
      <Text style={{ color: '#721c24', fontWeight: 'bold', marginBottom: 10 }}>
        ❌ Boutique suspendue
      </Text>
      <Text style={{ marginBottom: 15 }}>
        Réglez les problèmes puis demandez la réactivation
      </Text>
      <TouchableOpacity
        onPress={requestReactivation}
        disabled={isLoading}
        style={{
          backgroundColor: '#007bff',
          padding: 12,
          borderRadius: 6,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {isLoading ? 'Envoi...' : 'Demander réactivation'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};