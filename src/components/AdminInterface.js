import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, SafeAreaView } from 'react-native';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';
import CreateAdmin from './CreateAdmin';
import styles from './styles';
import { useTranslation } from '../translations';

export default function AdminInterface({ onBack }) {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  const handleLoginSuccess = (user) => {
    setAdminUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminUser(null);
  };

  if (!isLoggedIn) {
    return (
      <AdminLogin 
        onLoginSuccess={handleLoginSuccess}
        onBack={onBack}
      />
    );
  }

  if (currentView === 'createAdmin') {
    return (
      <CreateAdmin 
        onBack={() => setCurrentView('dashboard')}
        onAdminCreated={() => setCurrentView('dashboard')}
      />
    );
  }

  return (
    <ImageBackground 
      source={require('../../assets/b2.jpeg')} 
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={{ backgroundColor: '#2C3E50' }}>
        <View style={{ backgroundColor: '#2C3E50' }}>
          {/* Premier niveau - Titre */}
          <View style={{ paddingVertical: 20, paddingHorizontal: 30, alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 17, 
            color: '#C8A55F', 
            fontWeight: 'bold'
          }}>
            🛠️ {t('administration')}
          </Text>
          <Text style={{ 
            fontSize: 13, 
            color: '#C8A55F', 
            opacity: 0.7,
            marginTop: 4
          }}>
            {adminUser?.username}
          </Text>
        </View>
        
        {/* Deuxième niveau - Boutons */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingBottom: 12,
          borderTopWidth: 1,
          borderTopColor: 'rgba(200, 165, 95, 0.2)'
        }}>
          <TouchableOpacity onPress={onBack}>
            <Text style={[styles.colorText, { fontSize: 14 }]}>
              ← {t('back')}
            </Text>
          </TouchableOpacity>
          
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity 
              onPress={() => setCurrentView('createAdmin')}
              style={{ 
                backgroundColor: '#4CAF50', 
                paddingHorizontal: 12, 
                paddingVertical: 8, 
                borderRadius: 6
              }}
            >
              <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                + {t('admin')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleLogout}
              style={{
                backgroundColor: 'rgba(255, 107, 107, 0.2)',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 6
              }}
            >
              <Text style={{ color: '#ff6b6b', fontSize: 14, fontWeight: 'bold' }}>
                {t('logout')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </SafeAreaView>
      

      
      <AdminDashboard />
    </ImageBackground>
  );
}