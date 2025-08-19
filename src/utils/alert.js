import { Platform, Alert } from 'react-native';

export const showAlert = (title, message) => {
  if (Platform.OS === 'web') {
    alert(message);
  } else {
    Alert.alert(title, message);
  }
};

export const showConfirm = (title, message) => {
  if (Platform.OS === 'web') {
    return window.confirm(message);
  } else {
    return new Promise(resolve => {
      Alert.alert(
        title,
        message,
        [
          { text: 'Annuler', onPress: () => resolve(false) },
          { text: 'OK', onPress: () => resolve(true) }
        ]
      );
    });
  }
};