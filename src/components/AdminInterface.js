import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';
import CreateAdmin from './CreateAdmin';
import styles from './styles';

export default function AdminInterface({ onBack }) {
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
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View style={{ backgroundColor: '#2C3E50', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 }}>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ color: '#C8A55F', fontSize: 14, fontWeight: 'bold' }}>
            ← Retour
          </Text>
        </TouchableOpacity>
        <Text style={{ color: '#C8A55F', fontSize: 14, textAlign: 'center', fontWeight: 'bold', padding: 8 }}>👨💼 Admin - {adminUser?.username}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={{ color: '#ff6b6b', fontSize: 12, fontWeight: 'bold' }}>
            Déconnexion
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 10, gap: 10 }}>
        <TouchableOpacity
          style={{ backgroundColor: currentView === 'dashboard' ? '#C8A55F' : '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 }}
          onPress={() => setCurrentView('dashboard')}
        >
          <Text style={{ color: currentView === 'dashboard' ? 'white' : '#666', fontSize: 12, fontWeight: 'bold' }}>Validation Comptes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{ backgroundColor: currentView === 'createAdmin' ? '#C8A55F' : '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 }}
          onPress={() => setCurrentView('createAdmin')}
        >
          <Text style={{ color: currentView === 'createAdmin' ? 'white' : '#666', fontSize: 12, fontWeight: 'bold' }}>Créer Admin</Text>
        </TouchableOpacity>
      </View>
      
      <AdminDashboard />
    </ImageBackground>
  );
}