import React, { useState, useEffect } from 'react';
import { Platform, View, TouchableOpacity, Text } from 'react-native';
import { ApolloProvider } from '@apollo/client';
import client from './src/apolloClientSimple';
import { NavigationProvider } from './src/NavigationContext';
import { useTranslation } from './src/translations';
import ShopLogin from './src/components/ShopLogin';
import ShopDashboard from './src/components/ShopDashboard';
import GlobalInterface from './src/components/GlobalInterface';
import styles from './src/components/styles';

export default function App() {
  const { t } = useTranslation();
  const [currentShop, setCurrentShop] = useState(null);
  const [showGlobalInterface, setShowGlobalInterface] = useState(true);
  
  useEffect(() => {
    // Charger l'état de connexion au démarrage
    if (Platform.OS === 'web') {
      const savedShop = localStorage.getItem('currentShop');
      if (savedShop) {
        try {
          const shop = JSON.parse(savedShop);
          setCurrentShop(shop);
          console.log('Connexion restaurée au démarrage');
        } catch (error) {
          console.log('Erreur restauration connexion:', error);
        }
      }
    }
  }, []);
  
  const handleLogin = (shop) => {
    setCurrentShop(shop);
    // Sauvegarder pour restauration après rechargement
    if (Platform.OS === 'web') {
      localStorage.setItem('currentShop', JSON.stringify(shop));
    }
  };
  
  const handleLogout = () => {
    setCurrentShop(null);
    if (Platform.OS === 'web') {
      localStorage.removeItem('currentShop');
      localStorage.removeItem('currentPage');
      localStorage.removeItem('pageData');
    }
  };

  const renderContent = () => {
    if (showGlobalInterface) {
      return (
        <GlobalInterface 
          onShopLogin={() => setShowGlobalInterface(false)}
        />
      );
    }
    
    if (currentShop) {
      return (
        <ShopDashboard 
          shop={currentShop} 
          onLogout={() => {
            handleLogout();
            setShowGlobalInterface(true);
          }} 
        />
      );
    }
    
    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.headerGlobal, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 15, paddingTop: Platform.OS === 'ios' ? 45 : 15 }]}>
          <TouchableOpacity 
            onPress={() => setShowGlobalInterface(true)}
          >
            <Text style={{ color: '#C8A55F', fontSize: 16, fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>
              ← {t('backToMarketplace')}
            </Text>
          </TouchableOpacity>
          <View />
        </View>
        <ShopLogin onLogin={handleLogin} />
      </View>
    );
  };

  return (
    <ApolloProvider client={client}>
      <NavigationProvider>
        {renderContent()}
      </NavigationProvider>
    </ApolloProvider>
  );
}