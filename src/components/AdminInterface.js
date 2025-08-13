import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
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
      <View style={{ backgroundColor: '#2C3E50', paddingVertical: 12, paddingHorizontal: 15 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={onBack} style={{ minWidth: 60 }}>
            <Text style={[styles.colorText, { fontSize: 14 }]}>
              ← {t('back')}
            </Text>
          </TouchableOpacity>
          
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#C8A55F', fontWeight: 'bold' }}>
              {adminUser?.username}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', minWidth: 60, justifyContent: 'flex-end' }}>
            <TouchableOpacity 
              onPress={() => setCurrentView('createAdmin')}
              style={{ backgroundColor: '#4CAF50', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6 }}
            >
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                + {t('admin')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={{ color: '#ff6b6b', fontSize: 11, fontWeight: 'bold' }}>
                {t('logout')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      

      
      <AdminDashboard />
    </ImageBackground>
  );
}