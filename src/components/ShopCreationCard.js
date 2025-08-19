import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Animated, PanGestureHandler, State } from 'react-native';
import { shopAPI } from '../services/api';
import styles from './styles';

const ShopCreationCard = ({ onShopCreated, visible, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const translateY = new Animated.Value(0);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const result = await shopAPI.register(formData);
      Alert.alert('Succès', 'Boutique créée avec succès');
      onShopCreated?.(result);
      setFormData({ name: '', email: '', password: '', phone: '', address: '' });
      onClose?.();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la boutique');
    } finally {
      setLoading(false);
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      if (event.nativeEvent.translationY > 100) {
        onClose?.();
      }
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  if (!visible) return null;

  return (
    <View style={cardStyles.overlay}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View 
          style={[
            cardStyles.card,
            { transform: [{ translateY }] }
          ]}
        >
          <View style={cardStyles.handle} />
          
          <Text style={cardStyles.title}>Créer une boutique</Text>
          
          <View style={cardStyles.inputSection}>
            <TextInput
              style={[styles.addProductInput, cardStyles.input]}
              placeholder="Nom de la boutique *"
              placeholderTextColor="#999"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />
            
            <TextInput
              style={[styles.addProductInput, cardStyles.input]}
              placeholder="Email *"
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
            />
            
            <TextInput
              style={[styles.addProductInput, cardStyles.input]}
              placeholder="Mot de passe *"
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
            />
            
            <TextInput
              style={[styles.addProductInput, cardStyles.input]}
              placeholder="Téléphone"
              placeholderTextColor="#999"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />
            
            <TextInput
              style={[styles.addProductInput, cardStyles.input]}
              placeholder="Adresse"
              placeholderTextColor="#999"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              multiline
            />
          </View>
          
          <TouchableOpacity 
            style={[
              styles.submitBtn, 
              cardStyles.button,
              loading && cardStyles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={[styles.submitText, cardStyles.buttonText]}>
              {loading ? 'Création...' : 'Créer la boutique'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const cardStyles = {
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputSection: {
    backgroundColor: 'rgba(200, 165, 95, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontSize: 16,
  },
};

export default ShopCreationCard;