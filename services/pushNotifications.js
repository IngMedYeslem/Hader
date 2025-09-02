import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function getExpoPushToken() {
  if (!Device.isDevice) {
    console.log('Mode développement - notifications push désactivées');
    return 'dev-token';
  }

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  try {
    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'f4c5d89a-8df8-42e8-85d1-19deee902f1a'
    })).data;
    return token;
  } catch (error) {
    console.log('Mode développement - token simulé');
    return 'dev-token';
  }
}

export async function sendPushNotification(expoPushToken, title, body, data = {}) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: expoPushToken,
      title,
      body,
      data,
    }),
  });
}