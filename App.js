import React, { useState, useEffect } from 'react';
import { Platform, View, TouchableOpacity, Text } from 'react-native';
import { ApolloProvider } from '@apollo/client';
import client from './src/apolloClientSimple';
import { NavigationProvider } from './src/NavigationContext';
import ShopLogin from './src/components/ShopLogin';
import ShopDashboard from './src/components/ShopDashboard';
import GlobalInterface from './src/components/GlobalInterface';
import styles from './src/components/styles';

export default function App() {
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
        <View style={[styles.headerGlobal, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 }]}>
          <TouchableOpacity 
            onPress={() => setShowGlobalInterface(true)}
          >
            <Text style={{ color: '#C8A55F', fontSize: 14, fontWeight: 'bold' }}>
              ← Retour au Marketplace
            </Text>
          </TouchableOpacity>
          <Text style={styles.textcoprit}>Connexion Boutique</Text>
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