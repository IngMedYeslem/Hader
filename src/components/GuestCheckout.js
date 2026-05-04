import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { API_URL } from '../config/api';
import * as Device from 'expo-device';

const GuestCheckout = ({ route, navigation }) => {
  const { cartItems } = route.params;
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [displayedOtp, setDisplayedOtp] = useState(null);
  const [step, setStep] = useState(1); // 1: info, 2: OTP verification

  const createOrder = async () => {
    if (!phoneNumber || !shippingAddress) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      const deviceId = Device.osInternalBuildId || 'web';
      const items = cartItems.map(item => ({
        productId: item._id,
        quantity: item.quantity || 1
      }));

      const response = await fetch(`${API_URL}/api/orders/guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, deviceId, items, shippingAddress })
      });

      const data = await response.json();
      if (data.success) {
        setOrderId(data.orderId);
        setDisplayedOtp(data.softOtp);
        setStep(2);
      } else {
        Alert.alert('Erreur', data.error);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la commande');
    }
  };

  const verifyOtp = async () => {
    if (otp !== displayedOtp) {
      Alert.alert('Erreur', 'Code OTP incorrect');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Succès', 'Commande confirmée!', [
          { text: 'OK', onPress: () => navigation.navigate('OrderTracking', { orderNumber: data.order.orderNumber, phoneNumber }) }
        ]);
      } else {
        Alert.alert('Erreur', data.error);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Vérification échouée');
    }
  };

  if (step === 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Confirmation de commande</Text>
        <View style={styles.otpBox}>
          <Text style={styles.otpLabel}>Votre code de confirmation:</Text>
          <Text style={styles.otpCode}>{displayedOtp}</Text>
          <Text style={styles.otpNote}>Valide 5 minutes</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Entrez le code ci-dessus"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
        />
        <TouchableOpacity style={styles.button} onPress={verifyOtp}>
          <Text style={styles.buttonText}>Confirmer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finaliser la commande</Text>
      <TextInput
        style={styles.input}
        placeholder="Numéro de téléphone"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Adresse de livraison"
        value={shippingAddress}
        onChangeText={setShippingAddress}
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={createOrder}>
        <Text style={styles.buttonText}>Passer commande</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: '#2ecc71', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  otpBox: { backgroundColor: '#f0f0f0', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  otpLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  otpCode: { fontSize: 36, fontWeight: 'bold', color: '#2ecc71', letterSpacing: 4 },
  otpNote: { fontSize: 12, color: '#e74c3c', marginTop: 8 }
});

export default GuestCheckout;
