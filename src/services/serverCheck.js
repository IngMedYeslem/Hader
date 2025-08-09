// Service pour vérifier si le serveur GraphQL est disponible
export const checkServerAvailability = async () => {
  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ __typename }'
      })
    });
    
    return response.ok;
  } catch (error) {
    console.log('Serveur non disponible:', error.message);
    return false;
  }
};

// Données de test pour l'interface globale
export const getMockProducts = () => [
  {
    id: '1',
    name: 'Smartphone Samsung Galaxy S23',
    price: 2500,
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300'],
    shop: { 
      username: 'TechStore Marrakech', 
      profileImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50' 
    }
  },
  {
    id: '2', 
    name: 'Laptop Dell Inspiron 15',
    price: 4500,
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300'],
    shop: { 
      username: 'ElectroShop Casablanca', 
      profileImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50' 
    }
  },
  {
    id: '3',
    name: 'Chaussures Nike Air Max',
    price: 800,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300'],
    shop: { 
      username: 'SportWorld Rabat', 
      profileImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50' 
    }
  },
  {
    id: '4',
    name: 'Montre Apple Watch Series 9',
    price: 1200,
    images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=300'],
    shop: { 
      username: 'TechStore Marrakech', 
      profileImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50' 
    }
  },
  {
    id: '5',
    name: 'Sac à dos Eastpak',
    price: 350,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300'],
    shop: { 
      username: 'Fashion Store Fès', 
      profileImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50' 
    }
  },
  {
    id: '6',
    name: 'Casque Sony WH-1000XM4',
    price: 950,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'],
    shop: { 
      username: 'AudioWorld Tanger', 
      profileImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50' 
    }
  }
];