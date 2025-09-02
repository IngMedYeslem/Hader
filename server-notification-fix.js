// Configuration pour notifications en arrière-plan
const message = {
  to: expoPushToken,
  title: "Boutique validée ✅",
  body: "Votre boutique a été validée",
  data: { type: "shop_validated" },
  priority: "high",
  channelId: "default"
};

// Envoyer avec fetch
await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(message)
});