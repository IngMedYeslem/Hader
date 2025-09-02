import { Alert, Platform } from 'react-native';
import pushNotificationService from './pushNotifications';

class ValidationNotificationService {
  async notifyShopValidation(shopName) {
    const title = 'Boutique Validée ✅';
    const message = `Votre boutique "${shopName}" a été validée ! Vous pouvez maintenant ajouter des produits.`;

    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
    } else {
      // Notification push locale
      try {
        await pushNotificationService.scheduleLocalNotification({
          title,
          body: message,
          data: { type: 'shop_validation', shopName }
        });
      } catch (error) {
        console.log('Erreur notification push:', error);
      }

      // Alert de confirmation
      Alert.alert(title, message, [
        { text: 'Ajouter des produits', onPress: () => {} }
      ]);
    }
  }

  async notifyShopRejection(shopName, reason = '') {
    const title = 'Boutique Rejetée ❌';
    const message = `Votre boutique "${shopName}" a été rejetée.${reason ? ` Raison: ${reason}` : ''}`;

    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
    } else {
      try {
        await pushNotificationService.scheduleLocalNotification({
          title,
          body: message,
          data: { type: 'shop_rejection', shopName, reason }
        });
      } catch (error) {
        console.log('Erreur notification push:', error);
      }

      Alert.alert(title, message);
    }
  }
}

export default new ValidationNotificationService();