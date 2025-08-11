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
      <View style={{ backgroundColor: '#2C3E50', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 }}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.colorText}>
            {t('back')}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.authTitle, { fontSize: 16, padding: 8 }]}>👨💼 Admin - {adminUser?.username}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={{ color: '#ff6b6b', fontSize: 12, fontWeight: 'bold' }}>
            {t('logout')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 10, gap: 10 }}>
        <TouchableOpacity
          style={[styles.filterBtn, currentView === 'dashboard' && styles.filterBtnActive]}
          onPress={() => setCurrentView('dashboard')}
        >
          <Text style={[styles.filterText, currentView === 'dashboard' && styles.filterTextActive]}>{t('accountValidation')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterBtn, currentView === 'createAdmin' && styles.filterBtnActive]}
          onPress={() => setCurrentView('createAdmin')}
        >
          <Text style={[styles.filterText, currentView === 'createAdmin' && styles.filterTextActive]}>{t('createAdmin')}</Text>
        </TouchableOpacity>
      </View>
      
      <AdminDashboard />
    </ImageBackground>
  );
}