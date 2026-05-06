import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
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
    return <AdminLogin onLoginSuccess={handleLoginSuccess} onBack={onBack} />;
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
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <SafeAreaView style={{ backgroundColor: '#FF6B35' }}>
        <View style={{ backgroundColor: '#FF6B35', paddingHorizontal: 16, paddingVertical: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={onBack}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 }}
            >
              <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>← {t('back')}</Text>
            </TouchableOpacity>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>🛠️ {t('administration')}</Text>
              {adminUser?.username && (
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{adminUser.username}</Text>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => setCurrentView('createAdmin')}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 }}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>+ {t('admin')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 }}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>{t('logout')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <AdminDashboard />
    </View>
  );
}