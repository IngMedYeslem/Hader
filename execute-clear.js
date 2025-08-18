import AsyncStorage from '@react-native-async-storage/async-storage';

AsyncStorage.removeItem('localShops').then(() => {
  console.log('✅ Boutiques locales supprimées');
}).catch(error => {
  console.error('❌ Erreur:', error);
});