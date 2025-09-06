// Service de réactivation de compte après rejet
export const AccountReactivationService = {
  // Vérifier le statut du compte
  async checkAccountStatus(shopId) {
    const response = await fetch(`${process.env.API_URL}/api/shops/${shopId}/status`);
    return response.json();
  },

  // Demander la réactivation
  async requestReactivation(shopId, documents) {
    const formData = new FormData();
    documents.forEach(doc => formData.append('documents', doc));
    
    const response = await fetch(`${process.env.API_URL}/api/shops/${shopId}/reactivate`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  // Écouter les notifications de changement de statut
  subscribeToStatusUpdates(shopId, callback) {
    const eventSource = new EventSource(`${process.env.API_URL}/api/shops/${shopId}/status-updates`);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };
    return eventSource;
  }
};