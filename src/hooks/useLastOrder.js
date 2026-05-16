import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEY = 'last_active_order';
const TERMINAL = ['delivered', 'cancelled', 'failed'];

const storage = {
  get: async () => {
    if (Platform.OS === 'web') return JSON.parse(localStorage.getItem(KEY) || 'null');
    const v = await AsyncStorage.getItem(KEY);
    return v ? JSON.parse(v) : null;
  },
  set: async (order) => {
    const val = JSON.stringify(order);
    if (Platform.OS === 'web') localStorage.setItem(KEY, val);
    else await AsyncStorage.setItem(KEY, val);
  },
  clear: async () => {
    if (Platform.OS === 'web') localStorage.removeItem(KEY);
    else await AsyncStorage.removeItem(KEY);
  },
};

export const saveLastOrder = (order) => storage.set(order);
export const clearLastOrder = () => storage.clear();
export const isTerminalStatus = (status) => TERMINAL.includes(status);

export function useLastOrder() {
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    storage.get().then(order => order && setLastOrder(order));
  }, []);

  const save = async (order) => {
    await storage.set(order);
    setLastOrder(order);
  };

  const clear = async () => {
    await storage.clear();
    setLastOrder(null);
  };

  const update = async (fields) => {
    const updated = { ...lastOrder, ...fields };
    await storage.set(updated);
    setLastOrder(updated);
  };

  return { lastOrder, saveLastOrder: save, clearLastOrder: clear, updateLastOrder: update };
}
