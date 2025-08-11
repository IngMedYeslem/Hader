import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles';

export default function GlobalNavbar({ onShopLogin, onAdminAccess, productCount = 0, shopCount = 0 }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setIsAdmin(user.role && user.role.includes('ADMIN'));
        }
      } catch (error) {
        console.log('Erreur vérification admin:', error);
      }
    };
    checkAdminStatus();
  }, []);

  return (
    <View style={[styles.headerGlobal, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 }]}>
      <View>
        <Text style={styles.textcoprit}>🛍️ Marketplace Global</Text>
        <Text style={{ color: '#C8A55F', fontSize: 12, opacity: 0.8 }}>
          {productCount} produits • {shopCount} boutiques
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {true && (
          <TouchableOpacity 
            onPress={onAdminAccess} 
            style={{ backgroundColor: 'rgba(220, 53, 69, 0.2)', padding: 8, borderRadius: 15 }}
          >
            <Text style={{ color: '#dc3545', fontSize: 12, fontWeight: 'bold' }}>
              👨‍💼 Admin
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onShopLogin} style={{ backgroundColor: 'rgba(200, 165, 95, 0.2)', padding: 8, borderRadius: 15 }}>
          <Text style={{ color: '#C8A55F', fontSize: 14, fontWeight: 'bold' }}>
            Espace Boutique →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}