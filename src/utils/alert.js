import { Platform, Alert } from 'react-native';

export const showAlert = (title, message, buttons = []) => {
  if (Platform.OS === 'web') {
    // Sur le web, utiliser confirm() natif
    if (buttons.length === 2) {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed && buttons[1].onPress) {
        buttons[1].onPress();
      } else if (!confirmed && buttons[0].onPress) {
        buttons[0].onPress();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
      if (buttons[0]?.onPress) {
        buttons[0].onPress();
      }
    }
  } else {
    // Sur mobile, utiliser Alert natif
    Alert.alert(title, message, buttons);
  }
};