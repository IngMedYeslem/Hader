import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAccountRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAccount = useCallback(async (updatedData) => {
    setIsRefreshing(true);
    try {
      const currentUser = await AsyncStorage.getItem('user');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        const refreshedUser = { ...userData, ...updatedData };
        await AsyncStorage.setItem('user', JSON.stringify(refreshedUser));
      }
    } catch (error) {
      console.error('Erreur actualisation compte:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return { refreshAccount, isRefreshing };
};