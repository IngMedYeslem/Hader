import { API_CONFIG } from '../config/api';

// Service pour vérifier si le serveur est disponible
export const checkServerAvailability = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);
  
  try {
    console.log('Test connexion serveur:', API_CONFIG.BASE_URL);
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    console.log('Réponse serveur principal:', response.status, response.ok);
    return response.ok;
  } catch (error) {
    clearTimeout(timeoutId);
    console.log('Serveur principal non disponible:', error.message);
    
    const fallbackController = new AbortController();
    const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 3000);
    
    try {
      console.log('Test connexion fallback:', API_CONFIG.FALLBACK_URL);
      const fallbackResponse = await fetch(`${API_CONFIG.FALLBACK_URL}/health`, {
        method: 'GET',
        signal: fallbackController.signal
      });
      clearTimeout(fallbackTimeoutId);
      console.log('Réponse serveur fallback:', fallbackResponse.status, fallbackResponse.ok);
      return fallbackResponse.ok;
    } catch (fallbackError) {
      clearTimeout(fallbackTimeoutId);
      console.log('Serveur fallback non disponible:', fallbackError.message);
      return false;
    }
  }
};

// Obtenir l'état détaillé du serveur
export const getServerStatus = async () => {
  console.log('=== Vérification état serveur ===');
  const isAvailable = await checkServerAvailability();
  console.log('État final du serveur:', isAvailable ? '✅ Connecté' : '❌ Non disponible');
  return {
    isAvailable,
    message: isAvailable ? 'Serveur connecté' : 'Serveur non disponible'
  };
};

