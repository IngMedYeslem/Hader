import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

export const fetchProductsWithShops = async () => {
  try {
    const productsResponse = await fetch(`${API_BASE_URL}/debug/products`);
    
    if (!productsResponse.ok) throw new Error('Erreur récupération produits');
    
    const products = await productsResponse.json();
    
    // Limiter le nombre de produits pour éviter OOM
    const limitedProducts = products.slice(0, 20);
    
    // Pour chaque produit, récupérer les infos de la boutique
    const productsWithShops = await Promise.all(
      limitedProducts.map(async (product) => {
        let shop = null;
        if (product.shopId) {
          try {
            const shopResponse = await fetch(`${API_BASE_URL}/shops/${product.shopId}`);
            if (shopResponse.ok) {
              shop = await shopResponse.json();
            }
          } catch (error) {
            // Ignorer l'erreur et continuer
          }
        }
        
        return {
          id: product._id,
          name: product.name,
          price: product.price,
          images: (product.images || []).slice(0, 3), // Limiter à 3 images max
          videos: (product.videos || []).slice(0, 1), // Limiter à 1 vidéo max
          shop: shop ? {
            id: shop._id,
            username: shop.name,
            phone: shop.phone,
            whatsapp: shop.whatsapp,
            email: shop.email,
            address: shop.address,
            profileImage: null
          } : null
        };
      })
    );
    
    return productsWithShops;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    return response.ok;
  } catch (error) {
    return false;
  }
};