import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
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

  const fetchUsers = async () => {
    try {
      const usersResponse = await fetch(`${API_URL}/users`);
      const usersData = await usersResponse.json();
      setUsers(usersData);
      
      // Essayer de récupérer les boutiques, mais ne pas échouer si ça ne marche pas
      try {
        const shopsResponse = await fetch(`${API_URL}/shops`);
        const shopsData = await shopsResponse.json();
        setShops(shopsData);
      } catch (shopError) {
        console.log('Pas de boutiques disponibles');
        setShops([]);
      }
      
      setError(null);
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
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

  const renderUser = ({ item }) => {
    const isShop = item.roles.includes('AJOUT-PROD');
    const isAdmin = item.roles.includes('ADMIN');
    const needsApproval = isShop && !item.isApproved;

    return (
      <View style={[styles.card, { marginHorizontal: 15, marginBottom: 15 }]}>
        <View style={{ padding: 15 }}>
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

  if (loading) return <Text style={styles.loadingText}>Chargement...</Text>;
  if (error) return <Text style={styles.errorText}>Erreur: {error}</Text>;

  const pendingShops = users.filter(user => 
    user.roles.includes('AJOUT-PROD') && !user.isApproved
  );

  return (
    <View style={styles.wrapper}>
      <View style={{ backgroundColor: '#2C3E50' }}>
        <Text style={[styles.authTitle, { fontSize: 20, padding: 15 }]}>
          {t('administration')}
        </Text>
      </View>
      
      {pendingShops.length > 0 && (
        <View style={{ backgroundColor: '#fff3cd', padding: 10, margin: 15, borderRadius: 8 }}>
          <Text style={{ color: '#856404', fontWeight: 'bold', textAlign: 'center' }}>
            {pendingShops.length} {t('shopsWaiting')}
          </Text>
        </View>
      )}
      
      <View style={{ flexDirection: 'row', margin: 15, gap: 10 }}>
        <TouchableOpacity
          style={[styles.submitBtn, { flex: 1, marginRight: 5, backgroundColor: '#4CAF50' }]}
          onPress={() => {
            // Navigation vers création admin
            Alert.prompt(
              'Créer un Admin',
              'Nom d\'utilisateur:',
              [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Suivant',
                  onPress: (username) => {
                    if (!username) return;
                    Alert.prompt(
                      'Créer un Admin',
                      'Email:',
                      [
                        { text: 'Annuler', style: 'cancel' },
                        {
                          text: 'Suivant',
                          onPress: (email) => {
                            if (!email) return;
                            Alert.prompt(
                              'Créer un Admin',
                              'Mot de passe:',
                              [
                                { text: 'Annuler', style: 'cancel' },
                                {
                                  text: 'Créer',
                                  onPress: async (password) => {
                                    if (!password) return;
                                    try {
                                      const response = await fetch(`${API_URL}/admin/create`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ username, email, password })
                                      });
                                      const data = await response.json();
                                      if (response.ok) {
                                        Alert.alert('Succès', `Admin ${username} créé`);
                                        fetchUsers();
                                      } else {
                                        Alert.alert('Erreur', data.error);
                                      }
                                    } catch (error) {
                                      Alert.alert('Erreur', 'Erreur de connexion');
                                    }
                                  }
                                }
                              ],
                              'secure-text'
                            );
                          }
                        }
                      ]
                    );
                  }
                }
              ]
            );
          }}
        >
          <Text style={styles.submitText}>
            👨💼 {t('createAdmin')}
          </Text>
        </TouchableOpacity>
        

        
        {users.length === 0 && (
          <TouchableOpacity
            style={[styles.submitBtn, { flex: 1, marginLeft: 5 }]}
            onPress={async () => {
              try {
                const response = await fetch(`${API_URL}/debug/create-test-users`, {
                  method: 'POST'
                });
                const data = await response.json();
                if (response.ok) {
                  Alert.alert('Succès', `${data.users.length} comptes créés`);
                  fetchUsers();
                } else {
                  Alert.alert('Erreur', data.error);
                }
              } catch (error) {
                Alert.alert('Erreur', 'Erreur de connexion');
              }
            }}
          >
            <Text style={styles.submitText}>
              {t('testAccounts')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}