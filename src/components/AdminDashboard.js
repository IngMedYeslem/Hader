import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, Linking, Platform } from 'react-native';
import styles from './styles';
import { useTranslation } from '../translations';
import { showPendingShops, clearLocalShops } from '../services/api';

const API_URL = 'http://172.20.10.6:3000/api';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [pendingLocalShops, setPendingLocalShops] = useState([]);
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

  const fetchPendingLocalShops = async () => {
    try {
      const localShops = await showPendingShops();
      setPendingLocalShops(localShops);
    } catch (error) {
      console.log('Erreur récupération boutiques locales:', error);
      setPendingLocalShops([]);
    }
  };

  const fetchShops = async () => {
    try {
      console.log('Récupération des boutiques depuis la vraie API...');
      
      // Récupérer toutes les boutiques depuis la vraie API
      const shopsResponse = await fetch(`${API_URL}/shops`);
      if (!shopsResponse.ok) {
        console.log('Erreur API boutiques:', shopsResponse.status);
        setShops([]);
        return;
      }
      
      const shops = await shopsResponse.json();
      console.log('Boutiques récupérées:', shops.length);
      
      // Récupérer les utilisateurs pour obtenir le statut d'approbation
      const usersResponse = await fetch(`${API_URL}/users`);
      const users = usersResponse.ok ? await usersResponse.json() : [];
      
      // Récupérer les produits pour compter ceux de chaque boutique
      const productsResponse = await fetch(`${API_URL}/debug/products`);
      const products = productsResponse.ok ? await productsResponse.json() : [];
      
      // Enrichir les boutiques avec le statut d'approbation et le nombre de produits
      const enrichedShops = shops.map(shop => {
        const linkedUser = users.find(user => user.linkedShop && user.linkedShop.id === shop._id);
        const productCount = products.filter(p => p.shopId === shop._id).length;
        return {
          ...shop,
          productCount,
          isValidated: linkedUser ? linkedUser.isApproved === true : false
        };
      });
      
      setShops(enrichedShops);
    } catch (error) {
      console.log('Erreur récupération boutiques:', error);
      setShops([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchShops();
    fetchPendingLocalShops();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    await fetchShops();
    await fetchPendingLocalShops();
    setRefreshing(false);
  };

  const handleApprove = async (userId, username) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/approve`, {
        method: 'POST'
      });
      if (response.ok) {
        Platform.OS === 'web' ? alert(`Compte de ${username} approuvé`) : Alert.alert('Succès', `Compte de ${username} approuvé`);
        fetchUsers();
      }
    } catch (error) {
      Platform.OS === 'web' ? alert('Erreur de connexion') : Alert.alert('Erreur', 'Erreur de connexion');
    }
  };

  const handleReject = async (userId, username) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le compte de ${username} ?`)) return;
    } else {
      const confirmed = await new Promise(resolve => {
        Alert.alert(
          'Confirmer la suppression',
          `Êtes-vous sûr de vouloir supprimer le compte de ${username} ?`,
          [
            { text: 'Annuler', onPress: () => resolve(false) },
            { text: 'Supprimer', style: 'destructive', onPress: () => resolve(true) }
          ]
        );
      });
      if (!confirmed) return;
    }
    
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        Platform.OS === 'web' ? alert(`Compte de ${username} supprimé`) : Alert.alert('Succès', `Compte de ${username} supprimé`);
        fetchUsers();
      }
    } catch (error) {
      Platform.OS === 'web' ? alert('Erreur de connexion') : Alert.alert('Erreur', 'Erreur de connexion');
    }
  };

  const handleLinkShop = async (userId, shopId, username) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/link-shop/${shopId}`, {
        method: 'POST'
      });
      if (response.ok) {
        Platform.OS === 'web' ? alert(`Boutique liée à ${username}`) : Alert.alert('Succès', `Boutique liée à ${username}`);
        fetchUsers();
      }
    } catch (error) {
      Platform.OS === 'web' ? alert('Erreur de connexion') : Alert.alert('Erreur', 'Erreur de connexion');
    }
  };

  const handleUnlinkShop = async (userId, username) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/unlink-shop`, {
        method: 'DELETE'
      });
      if (response.ok) {
        Platform.OS === 'web' ? alert(`Boutique déliée de ${username}`) : Alert.alert('Succès', `Boutique déliée de ${username}`);
        fetchUsers();
      }
    } catch (error) {
      Platform.OS === 'web' ? alert('Erreur de connexion') : Alert.alert('Erreur', 'Erreur de connexion');
    }
  };

  const handleValidateShop = async (shopId, shopName) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Êtes-vous sûr de vouloir valider la boutique "${shopName}" ?`)) return;
    } else {
      const confirmed = await new Promise(resolve => {
        Alert.alert(
          'Valider la boutique',
          `Êtes-vous sûr de vouloir valider la boutique "${shopName}" ?`,
          [
            { text: 'Annuler', onPress: () => resolve(false) },
            { text: 'Valider', onPress: () => resolve(true) }
          ]
        );
      });
      if (!confirmed) return;
    }
    
    try {
      const linkedUser = users.find(user => {
        return user.linkedShop && (user.linkedShop.id === shopId || user.linkedShop._id === shopId);
      });
      
      if (linkedUser) {
        const response = await fetch(`${API_URL}/users/${linkedUser.id}/approve`, {
          method: 'POST'
        });
        if (response.ok) {
          Platform.OS === 'web' ? alert(`Boutique "${shopName}" validée`) : Alert.alert('Succès', `Boutique "${shopName}" validée`);
          fetchUsers();
          fetchShops();
        } else {
          Platform.OS === 'web' ? alert('Erreur lors de la validation') : Alert.alert('Erreur', 'Erreur lors de la validation');
        }
      } else {
        Platform.OS === 'web' ? alert('Utilisateur lié non trouvé') : Alert.alert('Erreur', 'Utilisateur lié non trouvé');
      }
    } catch (error) {
      Platform.OS === 'web' ? alert('Erreur de connexion') : Alert.alert('Erreur', 'Erreur de connexion');
    }
  };

  const handleRejectShop = async (shopId, shopName) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`Êtes-vous sûr de vouloir rejeter la boutique "${shopName}" ?`)) return;
    } else {
      const confirmed = await new Promise(resolve => {
        Alert.alert(
          'Rejeter la boutique',
          `Êtes-vous sûr de vouloir rejeter la boutique "${shopName}" ?`,
          [
            { text: 'Annuler', onPress: () => resolve(false) },
            { text: 'Rejeter', style: 'destructive', onPress: () => resolve(true) }
          ]
        );
      });
      if (!confirmed) return;
    }
    
    try {
      const linkedUser = users.find(user => {
        return user.linkedShop && (user.linkedShop.id === shopId || user.linkedShop._id === shopId);
      });
      
      if (linkedUser) {
        const response = await fetch(`${API_URL}/users/${linkedUser.id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          Platform.OS === 'web' ? alert(`Boutique "${shopName}" rejetée`) : Alert.alert('Succès', `Boutique "${shopName}" rejetée`);
          fetchUsers();
          fetchShops();
        } else {
          Platform.OS === 'web' ? alert('Erreur lors du rejet') : Alert.alert('Erreur', 'Erreur lors du rejet');
        }
      } else {
        Platform.OS === 'web' ? alert('Utilisateur lié non trouvé') : Alert.alert('Erreur', 'Utilisateur lié non trouvé');
      }
    } catch (error) {
      Platform.OS === 'web' ? alert('Erreur de connexion') : Alert.alert('Erreur', 'Erreur de connexion');
    }
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
    const isValidated = item.isValidated === true;
    const isLocal = item.isLocal || false;
    
    return (
      <View style={[styles.card, { marginHorizontal: 10, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: isValidated ? '#4CAF50' : '#ff9800' }]}>
        <View style={{ padding: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#C8A55F', flex: 1 }} numberOfLines={1}>
              🏪 {item.name} {isLocal && '📱'}
            </Text>
            <View style={{ backgroundColor: isValidated ? '#d4edda' : '#fff3cd', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: isValidated ? '#155724' : '#856404' }}>
                {isValidated ? '✅ Validée' : isLocal ? '📱 Locale' : '⏳ Attente'}
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
          
          {!isValidated && shopFilter === 'pending' && (
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
    const localShopsWithStatus = pendingLocalShops.map(shop => ({
      ...shop,
      _id: `local_${shop.email}`,
      isValidated: false,
      productCount: 0,
      isLocal: true
    }));
    
    switch (shopFilter) {
      case 'validated':
        return shops.filter(shop => shop.isValidated !== false);
      case 'pending':
        return [...shops.filter(shop => shop.isValidated === false), ...localShopsWithStatus];
      default:
        return [...shops, ...localShopsWithStatus];
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

      
      <View style={{ flexDirection: 'row', marginHorizontal: 15, marginVertical: 8, gap: 8 }}>
        <TouchableOpacity
          style={[styles.filterBtn, { flex: 1, paddingVertical: 10 }, activeTab === 'users' && styles.filterBtnActive]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.filterText, { textAlign: 'center', fontSize: 13 }, activeTab === 'users' && styles.filterTextActive]}>
            👥 {t('users')} ({users.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterBtn, { flex: 1, paddingVertical: 10 }, activeTab === 'shops' && styles.filterBtnActive]}
          onPress={() => setActiveTab('shops')}
        >
          <Text style={[styles.filterText, { textAlign: 'center', fontSize: 13 }, activeTab === 'shops' && styles.filterTextActive]}>
            🏪 {t('shops')} ({shops.length + pendingLocalShops.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'shops' && (
        <View style={{ flexDirection: 'row', marginHorizontal: 15, marginBottom: 8, gap: 6 }}>
          <TouchableOpacity
            style={[styles.filterBtn, { flex: 1, paddingVertical: 6 }, shopFilter === 'all' && styles.filterBtnActive]}
            onPress={() => setShopFilter('all')}
          >
            <Text style={[styles.filterText, { textAlign: 'center', fontSize: 11 }, shopFilter === 'all' && styles.filterTextActive]}>
              {t('all')} ({shops.length + pendingLocalShops.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterBtn, { flex: 1, paddingVertical: 6 }, shopFilter === 'validated' && styles.filterBtnActive]}
            onPress={() => setShopFilter('validated')}
          >
            <Text style={[styles.filterText, { textAlign: 'center', fontSize: 11 }, shopFilter === 'validated' && styles.filterTextActive]}>
              ✅ {t('validated')} ({shops.filter(s => s.isValidated !== false).length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterBtn, { flex: 1, paddingVertical: 6 }, shopFilter === 'pending' && styles.filterBtnActive]}
            onPress={() => setShopFilter('pending')}
          >
            <Text style={[styles.filterText, { textAlign: 'center', fontSize: 11 }, shopFilter === 'pending' && styles.filterTextActive]}>
              ⏳ {t('pending')} ({shops.filter(s => s.isValidated === false).length + pendingLocalShops.length})
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