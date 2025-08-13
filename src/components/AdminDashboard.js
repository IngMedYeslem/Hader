import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, Linking } from 'react-native';
import styles from './styles';
import { useTranslation } from '../translations';

const API_URL = 'http://192.168.100.121:3000/api';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [shopFilter, setShopFilter] = useState('all'); // 'all', 'validated', 'pending'

  const fetchUsers = async () => {
    try {
      const usersResponse = await fetch(`${API_URL}/users`);
      const usersData = await usersResponse.json();
      setUsers(usersData);
      
      setError(null);
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      console.log('Récupération des boutiques...');
      
      // Récupérer toutes les boutiques depuis l'API simple
      const shopsResponse = await fetch('http://192.168.100.121:3000/api/debug/products');
      if (!shopsResponse.ok) {
        throw new Error('Erreur API produits');
      }
      
      const products = await shopsResponse.json();
      console.log('Produits récupérés:', products.length);
      
      // Extraire les IDs uniques des boutiques
      const shopIds = [...new Set(products.map(p => p.shopId).filter(Boolean))];
      console.log('IDs boutiques trouvés:', shopIds);
      
      // Récupérer les détails de chaque boutique
      const shopsData = await Promise.all(
        shopIds.map(async (shopId) => {
          try {
            const shopResponse = await fetch(`http://192.168.100.121:3000/api/shops/${shopId}`);
            if (!shopResponse.ok) {
              console.log(`Erreur boutique ${shopId}:`, shopResponse.status);
              return null;
            }
            
            const shop = await shopResponse.json();
            
            // Compter les produits de cette boutique
            const productCount = products.filter(p => p.shopId === shopId).length;
            
            return {
              ...shop,
              productCount,
              products: products.filter(p => p.shopId === shopId),
              isValidated: Math.random() > 0.5 // Simulation - à remplacer par vraie logique
            };
          } catch (error) {
            console.log(`Erreur détail boutique ${shopId}:`, error);
            return null;
          }
        })
      );
      
      const validShops = shopsData.filter(Boolean);
      console.log('Boutiques valides:', validShops.length);
      setShops(validShops);
    } catch (error) {
      console.log('Erreur récupération boutiques:', error);
      setShops([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchShops();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    await fetchShops();
    setRefreshing(false);
  };

  const handleApprove = async (userId, username) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/approve`, {
        method: 'POST'
      });
      if (response.ok) {
        Alert.alert('Succès', `Compte de ${username} approuvé`);
        fetchUsers();
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion');
    }
  };

  const handleReject = async (userId, username) => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer le compte de ${username} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE'
              });
              if (response.ok) {
                Alert.alert('Succès', `Compte de ${username} supprimé`);
                fetchUsers();
              }
            } catch (error) {
              Alert.alert('Erreur', 'Erreur de connexion');
            }
          }
        }
      ]
    );
  };

  const handleLinkShop = async (userId, shopId, username) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/link-shop/${shopId}`, {
        method: 'POST'
      });
      if (response.ok) {
        Alert.alert('Succès', `Boutique liée à ${username}`);
        fetchUsers();
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion');
    }
  };

  const handleUnlinkShop = async (userId, username) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/unlink-shop`, {
        method: 'DELETE'
      });
      if (response.ok) {
        Alert.alert('Succès', `Boutique déliée de ${username}`);
        fetchUsers();
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur de connexion');
    }
  };

  const handleValidateShop = async (shopId, shopName) => {
    Alert.alert(
      'Valider la boutique',
      `Êtes-vous sûr de vouloir valider la boutique "${shopName}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Valider',
          onPress: async () => {
            try {
              // Simuler la validation (à adapter selon votre API)
              console.log(`Validation boutique ${shopId}`);
              Alert.alert('Succès', `Boutique "${shopName}" validée`);
              fetchShops(); // Rafraîchir la liste
            } catch (error) {
              Alert.alert('Erreur', 'Erreur de connexion');
            }
          }
        }
      ]
    );
  };

  const handleRejectShop = async (shopId, shopName) => {
    Alert.alert(
      'Rejeter la boutique',
      `Êtes-vous sûr de vouloir rejeter la boutique "${shopName}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Rejeter',
          style: 'destructive',
          onPress: async () => {
            try {
              // Simuler le rejet (à adapter selon votre API)
              console.log(`Rejet boutique ${shopId}`);
              Alert.alert('Succès', `Boutique "${shopName}" rejetée`);
              fetchShops(); // Rafraîchir la liste
            } catch (error) {
              Alert.alert('Erreur', 'Erreur de connexion');
            }
          }
        }
      ]
    );
  };

  const renderUser = ({ item }) => {
    const isShop = item.roles.includes('AJOUT-PROD');
    const isAdmin = item.roles.includes('ADMIN');
    const needsApproval = isShop && !item.isApproved;

    return (
      <View style={[styles.card, { marginHorizontal: 8, marginBottom: 8 }]}>
        <View style={{ padding: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#C8A55F', marginBottom: 6 }}>{item.username}</Text>
          <Text style={{ color: '#C8A55F', marginBottom: 5 }}>{item.email}</Text>
          <Text style={{ color: '#C8A55F', marginBottom: 5 }}>
            Rôles: {item.roles.join(', ')}
          </Text>
          
          {item.linkedShop && (
            <Text style={{ color: '#C8A55F', marginBottom: 5, fontSize: 12 }}>
              🏪 Lié à: {item.linkedShop.name}
            </Text>
          )}
          
          {item.isApproved ? (
            <View style={{ backgroundColor: '#d4edda', padding: 8, borderRadius: 5 }}>
              <Text style={{ color: '#155724', fontWeight: 'bold' }}>
                ✅ Approuvé
              </Text>
              {item.approvedAt && (
                <Text style={{ color: '#155724', fontSize: 12 }}>
                  Le {new Date(item.approvedAt).toLocaleDateString()}
                  {item.approvedBy && ` par ${item.approvedBy}`}
                </Text>
              )}
            </View>
          ) : needsApproval ? (
            <View>
              <View style={{ backgroundColor: '#fff3cd', padding: 8, borderRadius: 5, marginBottom: 10 }}>
                <Text style={{ color: '#856404', fontWeight: 'bold' }}>
                  ⏳ En attente d'approbation
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={[styles.submitBtn, { flex: 1, marginRight: 5, backgroundColor: '#4CAF50' }]}
                  onPress={() => handleApprove(item.id, item.username)}
                >
                  <Text style={styles.submitText}>Approuver</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, { flex: 1, marginLeft: 5, backgroundColor: '#f44336' }]}
                  onPress={() => handleReject(item.id, item.username)}
                >
                  <Text style={styles.submitText}>Rejeter</Text>
                </TouchableOpacity>
              </View>
              
              {isShop && !item.linkedShop && shops.length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontSize: 12, marginBottom: 5, color: '#C8A55F' }}>Boutiques disponibles: {shops.length}</Text>
                </View>
              )}
            </View>
          ) : (
            <View>
              <View style={{ backgroundColor: 'rgba(200, 165, 95, 0.2)', padding: 8, borderRadius: 5, marginBottom: 10 }}>
                <Text style={{ color: '#C8A55F' }}>Utilisateur standard</Text>
              </View>
              
              {item.linkedShop && (
                <TouchableOpacity
                  style={{ backgroundColor: '#f44336', padding: 8, borderRadius: 5 }}
                  onPress={() => handleUnlinkShop(item.id, item.username)}
                >
                  <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>
                    Délier de {item.linkedShop.name}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderShop = ({ item }) => {
    const isValidated = item.isValidated !== false;
    
    return (
      <View style={[styles.card, { marginHorizontal: 10, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: isValidated ? '#4CAF50' : '#ff9800' }]}>
        <View style={{ padding: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#C8A55F', flex: 1 }} numberOfLines={1}>
              🏪 {item.name}
            </Text>
            <View style={{ backgroundColor: isValidated ? '#d4edda' : '#fff3cd', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: isValidated ? '#155724' : '#856404' }}>
                {isValidated ? '✅ Validée' : '⏳ Attente'}
              </Text>
            </View>
          </View>
          
          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: '#C8A55F', fontSize: 13, marginBottom: 3 }}>📧 {item.email}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)}>
              <Text style={{ color: '#007AFF', fontSize: 13, marginBottom: 3, textDecorationLine: 'underline' }}>📱 {item.phone}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${item.whatsapp.replace(/[^0-9]/g, '')}`)}>
              <Text style={{ color: '#25D366', fontSize: 13, marginBottom: 3, textDecorationLine: 'underline' }}>🟢 {item.whatsapp}</Text>
            </TouchableOpacity>
            <Text style={{ color: '#C8A55F', fontSize: 13, marginBottom: 3 }}>📍 {item.address}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ backgroundColor: 'rgba(200, 165, 95, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ color: '#C8A55F', fontSize: 12, fontWeight: 'bold' }}>
                📦 {item.productCount} produits
              </Text>
            </View>
          </View>
          
          {!isValidated && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#4CAF50', paddingVertical: 8, borderRadius: 6, alignItems: 'center' }}
                onPress={() => handleValidateShop(item._id, item.name)}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>Valider</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#f44336', paddingVertical: 8, borderRadius: 6, alignItems: 'center' }}
                onPress={() => handleRejectShop(item._id, item.name)}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>Rejeter</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) return <Text style={styles.loadingText}>Chargement...</Text>;
  if (error) return <Text style={styles.errorText}>Erreur: {error}</Text>;
  
  console.log('AdminDashboard - Rendu:', { activeTab, usersCount: users.length, shopsCount: shops.length });
  
  const getFilteredShops = () => {
    switch (shopFilter) {
      case 'validated':
        return shops.filter(shop => shop.isValidated !== false);
      case 'pending':
        return shops.filter(shop => shop.isValidated === false);
      default:
        return shops;
    }
  };
  
  const getEmptyMessage = () => {
    switch (shopFilter) {
      case 'validated':
        return 'Aucune boutique validée';
      case 'pending':
        return 'Aucune boutique en attente';
      default:
        return 'Aucune boutique trouvée';
    }
  };

  const pendingShops = users.filter(user => 
    user.roles.includes('AJOUT-PROD') && !user.isApproved
  );

  return (
    <View style={styles.wrapper}>
      <View style={{ backgroundColor: '#2C3E50', paddingVertical: 15, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#C8A55F', textAlign: 'center' }}>
          🛠️ {t('administration')}
        </Text>
        <Text style={{ fontSize: 14, color: 'rgba(200, 165, 95, 0.8)', textAlign: 'center', marginTop: 4 }}>
          {t('userAndShopManagement')}
        </Text>
      </View>
      
      {pendingShops.length > 0 && (
        <View style={{ backgroundColor: '#fff3cd', padding: 8, marginHorizontal: 10, marginVertical: 5, borderRadius: 6 }}>
          <Text style={{ color: '#856404', fontWeight: 'bold', textAlign: 'center' }}>
            {pendingShops.length} {t('shopsWaiting')}
          </Text>
        </View>
      )}
      

      
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginHorizontal: 15, marginVertical: 12, gap: 10 }}>
        <TouchableOpacity
          style={[styles.filterBtn, { flex: 1, paddingVertical: 12 }, activeTab === 'users' && styles.filterBtnActive]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.filterText, { textAlign: 'center', fontSize: 14, fontWeight: '600' }, activeTab === 'users' && styles.filterTextActive]}>
            👥 {t('users')} ({users.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterBtn, { flex: 1, paddingVertical: 12 }, activeTab === 'shops' && styles.filterBtnActive]}
          onPress={() => setActiveTab('shops')}
        >
          <Text style={[styles.filterText, { textAlign: 'center', fontSize: 14, fontWeight: '600' }, activeTab === 'shops' && styles.filterTextActive]}>
            🏪 {t('shops')} ({shops.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'shops' && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginHorizontal: 15, marginBottom: 10, gap: 6 }}>
          <TouchableOpacity
            style={[styles.filterBtn, { flex: 1, paddingVertical: 8 }, shopFilter === 'all' && styles.filterBtnActive]}
            onPress={() => setShopFilter('all')}
          >
            <Text style={[styles.filterText, { textAlign: 'center', fontSize: 12, fontWeight: '500' }, shopFilter === 'all' && styles.filterTextActive]}>
              {t('all')} ({shops.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterBtn, { flex: 1, paddingVertical: 8 }, shopFilter === 'validated' && styles.filterBtnActive]}
            onPress={() => setShopFilter('validated')}
          >
            <Text style={[styles.filterText, { textAlign: 'center', fontSize: 12, fontWeight: '500' }, shopFilter === 'validated' && styles.filterTextActive]}>
              ✅ {t('validated')} ({shops.filter(s => s.isValidated !== false).length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterBtn, { flex: 1, paddingVertical: 8 }, shopFilter === 'pending' && styles.filterBtnActive]}
            onPress={() => setShopFilter('pending')}
          >
            <Text style={[styles.filterText, { textAlign: 'center', fontSize: 12, fontWeight: '500' }, shopFilter === 'pending' && styles.filterTextActive]}>
              ⏳ {t('pending')} ({shops.filter(s => s.isValidated === false).length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
      


      <FlatList
        data={activeTab === 'users' ? users : getFilteredShops()}
        renderItem={activeTab === 'users' ? renderUser : renderShop}
        keyExtractor={(item) => activeTab === 'users' ? item.id : item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 5 }}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#C8A55F', fontSize: 16, textAlign: 'center' }}>
              {activeTab === 'users' ? 'Aucun utilisateur trouvé' : getEmptyMessage()}
            </Text>
            {activeTab === 'shops' && (
              <Text style={{ color: '#666', fontSize: 12, textAlign: 'center', marginTop: 10 }}>
                Vérifiez que le serveur est démarré sur le port 3000
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
}