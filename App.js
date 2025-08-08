import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationProvider } from './src/NavigationContext';
import ShopLogin from './src/components/ShopLogin';
import ShopDashboard from './src/components/ShopDashboard';

export default function App() {
  const [currentShop, setCurrentShop] = useState(null);
  
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
    }
  };

  return (
    <NavigationProvider>
      {currentShop ? (
        <ShopDashboard 
          shop={currentShop} 
          onLogout={handleLogout} 
        />
      ) : (
        <ShopLogin onLogin={handleLogin} />
      )}
    </NavigationProvider>
  );
}