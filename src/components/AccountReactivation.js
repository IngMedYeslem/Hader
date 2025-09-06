import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { AccountReactivationService } from '../../services/accountReactivation';

export const AccountReactivation = ({ shopId, onStatusChange }) => {
  const [status, setStatus] = useState('rejected');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    const subscription = AccountReactivationService.subscribeToStatusUpdates(
      shopId, 
      (data) => {
        setStatus(data.status);
        onStatusChange?.(data.status);
        
        if (data.status === 'approved') {
          Alert.alert('Compte réactivé', 'Votre boutique est maintenant active !');
        }
      }
    );

    return () => subscription.close();
  }, [shopId]);

  const handleReactivationRequest = async () => {
    setIsRequesting(true);
    try {
      await AccountReactivationService.requestReactivation(shopId, []);
      Alert.alert('Demande envoyée', 'Votre demande de réactivation a été soumise.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de soumettre la demande.');
    }
    setIsRequesting(false);
  };

  if (status === 'approved') return null;

  return (
    <View style={{ padding: 20, backgroundColor: '#fff3cd', margin: 10, borderRadius: 8 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
        Compte suspendu
      </Text>
      <Text style={{ marginBottom: 15 }}>
        Votre boutique a été suspendue. Réglez les problèmes identifiés et demandez la réactivation.
      </Text>
      <TouchableOpacity
        onPress={handleReactivationRequest}
        disabled={isRequesting}
        style={{
          backgroundColor: '#007bff',
          padding: 12,
          borderRadius: 6,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {isRequesting ? 'En cours...' : 'Demander la réactivation'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};