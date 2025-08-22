import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ImageBackground, Platform, Animated, KeyboardAvoidingView } from 'react-native';
import * as Location from 'expo-location';
import SimplePasswordInput from './SimplePasswordInput';
import styles from './styles';
import { useTranslation } from '../translations';

export default function ShopRegisterScreen({ navigation }) {
  const { t } = useTranslation();
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
  const slideAnim = useState(new Animated.Value(300))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!formData.username || !formData.email || !formData.password || !formData.address || !formData.phone || !formData.whatsapp || !formData.latitude || !formData.longitude) {
      Platform.OS === 'web' ? alert('Tous les champs sont obligatoires') : Alert.alert('Erreur', 'Tous les champs sont obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Platform.OS === 'web' ? alert('Les mots de passe ne correspondent pas') : Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (Platform.OS === 'web') {
      alert('Votre demande de création de compte boutique a été enregistrée. Un administrateur va l\'examiner.');
      navigation.goBack();
    } else {
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
    }
  };

  const steps = [
    { title: '🏪 Informations boutique', fields: ['username', 'address'] },
    { title: '📧 Contact', fields: ['email', 'phone', 'whatsapp'] },
    { title: '🔐 Sécurité', fields: ['password', 'confirmPassword'] },
    { title: '📍 Localisation', fields: [] }
  ];

  const renderStepIndicator = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
      {steps.map((_, index) => (
        <View key={index} style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: index <= currentStep ? '#C8A55F' : '#ddd',
          marginHorizontal: 4
        }} />
      ))}
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <ImageBackground 
        source={require('../../assets/b2.jpeg')} 
        style={styles.background}
        resizeMode="cover"
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.centeredContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[
              styles.card,
              {
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim
              }
            ]}>
              <Text style={[styles.authTitle, { fontSize: 16, marginBottom: 5 }]}>
                {t('shopRegistration')}
              </Text>
              {renderStepIndicator()}
              <Text style={{ fontSize: 12, marginBottom: 8, textAlign: 'center', color: '#C8A55F', fontWeight: 'bold' }}>
                {steps[currentStep].title}
              </Text>

              <View style={{ backgroundColor: 'rgba(200, 165, 95, 0.1)', padding: 6, borderRadius: 6, marginBottom: 6 }}>
                {currentStep === 0 && (
                  <>
                    <TextInput
                      style={[styles.addProductInput, { marginBottom: 5, height: 32, fontSize: 12, paddingVertical: 6 }]}
                      placeholder={`🏪 ${t('shopName')} *`}
                      placeholderTextColor="#999"
                      value={formData.username}
                      onChangeText={(text) => setFormData({...formData, username: text})}
                    />
                    <TextInput
                      style={[styles.addProductInput, { height: 40, fontSize: 12, textAlignVertical: 'top', paddingVertical: 6 }]}
                      placeholder={`📍 ${t('address')} *`}
                      placeholderTextColor="#999"
                      value={formData.address}
                      onChangeText={(text) => setFormData({...formData, address: text})}
                      multiline
                      numberOfLines={2}
                    />
                  </>
                )}
                
                {currentStep === 1 && (
                  <>
                    <TextInput
                      style={[styles.addProductInput, { marginBottom: 5, height: 32, fontSize: 12, paddingVertical: 6 }]}
                      placeholder={`📧 ${t('email')} *`}
                      placeholderTextColor="#999"
                      value={formData.email}
                      onChangeText={(text) => setFormData({...formData, email: text})}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <TextInput
                      style={[styles.addProductInput, { marginBottom: 5, height: 32, fontSize: 12, paddingVertical: 6 }]}
                      placeholder={`📞 ${t('phone')} *`}
                      placeholderTextColor="#999"
                      value={formData.phone}
                      onChangeText={(text) => setFormData({...formData, phone: text})}
                      keyboardType="phone-pad"
                    />
                    <TextInput
                      style={[styles.addProductInput, { height: 32, fontSize: 12, paddingVertical: 6 }]}
                      placeholder={`📱 ${t('whatsapp')} *`}
                      placeholderTextColor="#999"
                      value={formData.whatsapp}
                      onChangeText={(text) => setFormData({...formData, whatsapp: text})}
                      keyboardType="phone-pad"
                    />
                  </>
                )}
                
                {currentStep === 2 && (
                  <>
                    <SimplePasswordInput
                      style={[styles.addProductInput, { marginBottom: 5, height: 32, fontSize: 12, paddingVertical: 6 }]}
                      placeholder={`🔐 ${t('password')} *`}
                      placeholderTextColor="#999"
                      value={formData.password}
                      onChangeText={(text) => setFormData({...formData, password: text})}
                    />
                    <SimplePasswordInput
                      style={[styles.addProductInput, { height: 32, fontSize: 12, paddingVertical: 6 }]}
                      placeholder={`🔒 ${t('confirmPassword')} *`}
                      placeholderTextColor="#999"
                      value={formData.confirmPassword}
                      onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
                    />
                  </>
                )}
                
                {currentStep === 3 && (
                  <TouchableOpacity 
                    style={[styles.submitBtn, { backgroundColor: '#4CAF50', marginBottom: 10 }]} 
                    onPress={async () => {
                      try {
                        const { status } = await Location.requestForegroundPermissionsAsync();
                        if (status !== 'granted') {
                          Platform.OS === 'web' ? alert('Permission de localisation requise') : Alert.alert('Permission refusée', 'Permission de localisation requise');
                          return;
                        }
                        const location = await Location.getCurrentPositionAsync({});
                        setFormData({
                          ...formData,
                          latitude: location.coords.latitude.toString(),
                          longitude: location.coords.longitude.toString()
                        });
                        Platform.OS === 'web' ? alert('Localisation obtenue automatiquement') : Alert.alert('Succès', 'Localisation obtenue automatiquement');
                      } catch (error) {
                        Platform.OS === 'web' ? alert('Impossible d\'obtenir la localisation') : Alert.alert('Erreur', 'Impossible d\'obtenir la localisation');
                      }
                    }}
                  >
                    <Text style={[styles.submitText, { fontSize: 14 }]}>📍 Obtenir ma localisation</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                {currentStep > 0 && (
                  <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: '#6c757d', flex: 0.45 }]}
                    onPress={() => setCurrentStep(currentStep - 1)}
                  >
                    <Text style={styles.submitText}>← Précédent</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[
                    styles.submitBtn, 
                    { 
                      opacity: loading ? 0.7 : 1,
                      flex: currentStep === 0 ? 1 : 0.45
                    }
                  ]}
                  onPress={currentStep === 3 ? handleRegister : () => setCurrentStep(currentStep + 1)}
                  disabled={loading}
                >
                  <Text style={styles.submitText}>
                    {loading ? t('creating') : currentStep === 3 ? t('createShopAccount') : 'Suivant →'}
                  </Text>
                </TouchableOpacity>
              </View>

            <View style={{ backgroundColor: '#fff3cd', padding: 4, borderRadius: 4, marginTop: 6 }}>
              <Text style={{ color: '#856404', fontSize: 9, textAlign: 'center', fontWeight: 'bold', marginBottom: 2 }}>
                ⚠️ {t('important')}
              </Text>
              <Text style={{ color: '#856404', fontSize: 9, textAlign: 'center', marginBottom: 2 }}>
                {t('allFieldsRequired')}
              </Text>
              <Text style={{ color: '#856404', fontSize: 9, textAlign: 'center' }}>
                {t('accountPending')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.colorText}>{t('alreadyAccount')} {t('connect')}</Text>
            </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}