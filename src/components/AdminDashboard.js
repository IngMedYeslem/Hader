import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, Linking, Platform } from 'react-native';
import styles from './styles';
import { useTranslation } from '../translations';
import { showPendingShops, clearLocalShops } from '../services/api';
import { API_URL } from '../config/api';
import ShopRatingBadge from './ShopRatingBadge';



export default function AdminDashboard() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [pendingLocalShops, setPendingLocalShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [shopFilter, setShopFilter] = useState('all'); // 'all', 'validated', 'pending', 'rejected'

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
      // جلب المستخدمين والمتاجر معاً
      const [usersResponse, shopsResponse] = await Promise.all([
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/shops/all`).catch(() => fetch(`${API_URL}/shops`))
      ]);

      const usersData = usersResponse.ok ? await usersResponse.json() : [];
      const shopsData = shopsResponse.ok ? await shopsResponse.json() : [];

      // بناء خريطة المتاجر من API
      const shopsMap = {};
      shopsData.forEach(shop => { shopsMap[shop._id] = shop; });

      // جمع كل المتاجر: من API + من linkedShop للمستخدمين غير الموجودين
      const allShopsMap = { ...shopsMap };
      usersData.forEach(user => {
        if (user.linkedShop) {
          const id = user.linkedShop.id || user.linkedShop._id;
          if (id && !allShopsMap[id]) {
            allShopsMap[id] = { ...user.linkedShop, _id: id };
          }
        }
      });

      const enrichedShops = Object.values(allShopsMap).map(shop => {
        const linkedUser = usersData.find(user =>
          user.linkedShop && (user.linkedShop.id === shop._id || user.linkedShop._id === shop._id)
        );
        return {
          ...shop,
          productCount: shop.productCount ?? 0,
          isValidated: linkedUser ? linkedUser.isApproved === true : false,
          isRejected: linkedUser ? linkedUser.isRejected === true : false,
          rejectionReason: linkedUser ? linkedUser.rejectionReason : null
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
    
    // Actualisation automatique toutes les 30 secondes
    const interval = setInterval(() => {
      fetchUsers();
      fetchShops();
      fetchPendingLocalShops();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUsers(), fetchShops(), fetchPendingLocalShops()]);
    setRefreshing(false);
  };

  const handleApprove = async (userId, username) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/approve`, {
        method: 'POST'
      });
      if (response.ok) {
        const msg = t('accountApproved').replace('%s', username);
        Platform.OS === 'web' ? alert(msg) : Alert.alert(t('success'), msg);
        await Promise.all([fetchUsers(), fetchShops(), fetchPendingLocalShops()]);
      }
    } catch (error) {
      Platform.OS === 'web' ? alert(t('connectionError')) : Alert.alert(t('error'), t('connectionError'));
    }
  };

  const handleReject = async (userId, username) => {
    let reason = t('incompleteInfo');
    
    if (Platform.OS === 'web') {
      const userReason = window.prompt(`${t('rejectReasonFor')} ${username}:`, reason);
      if (userReason === null) return;
      reason = userReason || reason;
    } else {
      const confirmed = await new Promise(resolve => {
        Alert.alert(
          t('rejectAccount'),
          `${t('wantToReject')} ${username} ?\n\n${t('reason')}: ${reason}`,
          [
            { text: t('cancel'), onPress: () => resolve(false) },
            { text: t('reject'), onPress: () => resolve(true) }
          ]
        );
      });
      if (!confirmed) return;
    }
    
    try {
      const response = await fetch(`${API_URL}/users/${userId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        const msg = t('accountRejectedMsg').replace('%s', username);
        Platform.OS === 'web' ? alert(msg) : Alert.alert(t('success'), msg);
        await Promise.all([fetchUsers(), fetchShops(), fetchPendingLocalShops()]);
      }
    } catch (error) {
      Platform.OS === 'web' ? alert(t('connectionError')) : Alert.alert(t('error'), t('connectionError'));
    }
  };



  const handleLinkShop = async (userId, shopId, username) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/link-shop/${shopId}`, {
        method: 'POST'
      });
      if (response.ok) {
        const msg = t('shopLinked').replace('%s', username);
        Platform.OS === 'web' ? alert(msg) : Alert.alert(t('success'), msg);
        await Promise.all([fetchUsers(), fetchShops(), fetchPendingLocalShops()]);
      }
    } catch (error) {
      Platform.OS === 'web' ? alert(t('connectionError')) : Alert.alert(t('error'), t('connectionError'));
    }
  };

  const handleUnlinkShop = async (userId, username) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/unlink-shop`, {
        method: 'DELETE'
      });
      if (response.ok) {
        const msg = t('shopUnlinked').replace('%s', username);
        Platform.OS === 'web' ? alert(msg) : Alert.alert(t('success'), msg);
        await Promise.all([fetchUsers(), fetchShops(), fetchPendingLocalShops()]);
      }
    } catch (error) {
      Platform.OS === 'web' ? alert(t('connectionError')) : Alert.alert(t('error'), t('connectionError'));
    }
  };

  const handleValidateShop = async (shopId, shopName) => {
    if (Platform.OS === 'web') {
      if (!window.confirm(`هل أنت متأكد أنك تريد اعتماد المتجر "${shopName}"?`)) return;
    } else {
      const confirmed = await new Promise(resolve => {
        Alert.alert(
          t('validateShop'),
          `هل أنت متأكد أنك تريد اعتماد المتجر "${shopName}"?`,
          [
            { text: t('cancel'), onPress: () => resolve(false) },
            { text: t('approve'), onPress: () => resolve(true) }
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
        console.log('🔔 Validation boutique - linkedUser:', linkedUser);
        const response = await fetch(`${API_URL}/users/${linkedUser.id}/approve`, {
          method: 'POST'
        });
        if (response.ok) {
          const msg = t('shopValidated').replace('%s', shopName);
          Platform.OS === 'web' ? alert(msg) : Alert.alert(t('success'), msg);
          if (shopFilter === 'rejected') {
            setShopFilter('validated');
          }
          await Promise.all([fetchUsers(), fetchShops(), fetchPendingLocalShops()]);
        } else {
          Platform.OS === 'web' ? alert(t('validationError')) : Alert.alert(t('error'), t('validationError'));
        }
      } else {
        Platform.OS === 'web' ? alert(t('linkedUserNotFound')) : Alert.alert(t('error'), t('linkedUserNotFound'));
      }
    } catch (error) {
      Platform.OS === 'web' ? alert(t('connectionError')) : Alert.alert(t('error'), t('connectionError'));
    }
  };

  const handleRejectShop = async (shopId, shopName) => {
    let reason = t('shopNonCompliant');
    
    if (Platform.OS === 'web') {
      const userReason = window.prompt(`${t('rejectReasonFor')} "${shopName}":`, reason);
      if (userReason === null) return;
      reason = userReason || reason;
    } else {
      const confirmed = await new Promise(resolve => {
        Alert.alert(
          t('rejectShop'),
          `${t('wantToRejectShop')} "${shopName}" ?\n\n${t('reason')}: ${reason}`,
          [
            { text: t('cancel'), onPress: () => resolve(false) },
            { text: t('reject'), style: 'destructive', onPress: () => resolve(true) }
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
        const response = await fetch(`${API_URL}/users/${linkedUser.id}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason })
        });
        if (response.ok) {
          const msg = t('shopRejected').replace('%s', shopName);
          Platform.OS === 'web' ? alert(msg) : Alert.alert(t('success'), msg);
          await Promise.all([fetchUsers(), fetchShops(), fetchPendingLocalShops()]);
        } else {
          Platform.OS === 'web' ? alert(t('rejectionError')) : Alert.alert(t('error'), t('rejectionError'));
        }
      } else {
        Platform.OS === 'web' ? alert(t('linkedUserNotFound')) : Alert.alert(t('error'), t('linkedUserNotFound'));
      }
    } catch (error) {
      Platform.OS === 'web' ? alert(t('connectionError')) : Alert.alert(t('error'), t('connectionError'));
    }
  };



  const renderUser = ({ item }) => {
    const isShop = item.roles.includes('AJOUT-PROD');
    const needsApproval = isShop && !item.isApproved;

    return (
      <View style={{ backgroundColor: 'white', borderRadius: 12, marginBottom: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
        <View style={{ padding: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#333', flex: 1, marginRight: 8 }}>{item.username}</Text>
            {item.isApproved ? (
              <View style={{ backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, minWidth: 90, alignItems: 'center' }}>
                <Text style={{ color: '#2e7d32', fontSize: 11, fontWeight: 'bold' }}>✅ {t('approved')}</Text>
              </View>
            ) : item.isRejected ? (
              <View style={{ backgroundColor: '#fdecea', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, minWidth: 90, alignItems: 'center' }}>
                <Text style={{ color: '#c62828', fontSize: 11, fontWeight: 'bold' }}>❌ {t('reject')}</Text>
              </View>
            ) : needsApproval ? (
              <View style={{ backgroundColor: '#fff8e1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, minWidth: 90, alignItems: 'center' }}>
                <Text style={{ color: '#f57f17', fontSize: 11, fontWeight: 'bold' }}>⏳ {t('pending')}</Text>
              </View>
            ) : null}
          </View>
          <Text style={{ color: '#555', fontSize: 13, marginBottom: 3 }}>{item.email}</Text>
          <Text style={{ color: '#777', fontSize: 12 }}>{item.roles.join(', ')}</Text>
          {item.linkedShop && (
            <Text style={{ color: '#FF6B35', fontSize: 12, marginTop: 4 }}>🏪 {item.linkedShop.name}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderShop = ({ item }) => {
    const isValidated = item.isValidated === true;
    const isRejected = item.isRejected === true;
    const isLocal = item.isLocal || false;

    const statusColor = isValidated ? '#2e7d32' : isRejected ? '#c62828' : '#f57f17';
    const statusBg = isValidated ? '#e8f5e9' : isRejected ? '#fdecea' : '#fff8e1';
    const statusText = isValidated ? `✅ ${t('validated')}` : isRejected ? `❌ ${t('reject')}` : `⏳ ${t('pending')}`;
    const borderColor = isValidated ? '#2ecc71' : isRejected ? '#e74c3c' : '#C8A55F';

    return (
      <View style={{ backgroundColor: 'white', borderRadius: 12, marginBottom: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, borderLeftWidth: 4, borderLeftColor: borderColor }}>
        <View style={{ padding: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#333', flex: 1, marginRight: 8 }} numberOfLines={1}>
              🏪 {item.name}
            </Text>
            <View style={{ backgroundColor: statusBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, minWidth: 90, alignItems: 'center' }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: statusColor }}>{statusText}</Text>
            </View>
          </View>

          <Text style={{ color: '#555', fontSize: 13, marginBottom: 2 }}>📧 {item.email}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)}>
            <Text style={{ color: '#FF6B35', fontSize: 13, marginBottom: 2 }}>📱 {item.phone}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${item.whatsapp?.replace(/[^0-9]/g, '')}`)}>  
            <Text style={{ color: '#25D366', fontSize: 13, marginBottom: 2 }}>🟢 {item.whatsapp}</Text>
          </TouchableOpacity>
          <Text style={{ color: '#777', fontSize: 12, marginBottom: 6 }}>📍 {item.address}</Text>
          {item.category ? (
            <Text style={{ color: '#FF6B35', fontSize: 12, marginBottom: 6 }}>🏷️ {item.category}</Text>
          ) : null}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#FF6B35', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
              <Text style={{ color: '#333', fontSize: 12, fontWeight: '600' }}>📦 {item.productCount} {t('productsCount')}</Text>
            </View>
            <ShopRatingBadge averageRating={item.averageRating} totalRatings={item.totalRatings} />
            {item.location && (
              <TouchableOpacity onPress={() => Linking.openURL(`https://www.google.com/maps?q=${item.location.latitude},${item.location.longitude}`)}>
                <Text style={{ color: '#FF6B35', fontSize: 12 }}>🗺️ {t('map')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {isRejected && item.rejectionReason && (
            <View style={{ backgroundColor: '#fdecea', padding: 10, borderRadius: 8, marginTop: 8 }}>
              <Text style={{ color: '#c62828', fontSize: 12 }}>{t('reason')}: {item.rejectionReason}</Text>
            </View>
          )}

          {!isValidated && !isRejected && shopFilter === 'pending' && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#2ecc71', paddingVertical: 9, borderRadius: 8, alignItems: 'center' }}
                onPress={() => handleValidateShop(item._id, item.name)}
              >
                <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>{t('validate')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#f44336', paddingVertical: 9, borderRadius: 8, alignItems: 'center' }}
                onPress={async () => {
                  const linkedUser = users.find(user => user.linkedShop && (user.linkedShop.id === item._id || user.linkedShop._id === item._id));
                  if (linkedUser) await handleRejectShop(item._id, item.name);
                  else Platform.OS === 'web' ? alert(t('linkedUserNotFound')) : Alert.alert(t('error'), t('linkedUserNotFound'));
                }}
              >
                <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>{t('reject')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {isRejected && (
            <TouchableOpacity
              style={{ backgroundColor: '#FF6B35', paddingVertical: 9, borderRadius: 8, alignItems: 'center', marginTop: 10 }}
              onPress={() => handleValidateShop(item._id, item.name)}
            >
              <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>🔄 {t('reactivate')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) return <Text style={styles.loadingText}>{t('loading')}</Text>;
  if (error) return <Text style={styles.errorText}>{t('error')}: {error}</Text>;
  
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
        return shops.filter(shop => shop.isValidated === true);
      case 'pending':
        return [...shops.filter(shop => !shop.isValidated && !shop.isRejected), ...localShopsWithStatus];
      case 'rejected':
        return shops.filter(shop => shop.isRejected === true);
      default:
        return [...shops, ...localShopsWithStatus];
    }
  };
  
  const getEmptyMessage = () => {
    switch (shopFilter) {
      case 'validated': return t('noShopValidated');
      case 'pending': return t('noShopPending');
      case 'rejected': return t('noShopRejected');
      default: return t('noShopFound');
    }
  };

  const pendingShops = users.filter(user => 
    user.roles.includes('AJOUT-PROD') && !user.isApproved
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FF6B35' }}>
      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: 'white', marginHorizontal: 16, marginTop: 12, borderRadius: 25, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 }}>
        <TouchableOpacity
          style={{ flex: 1, paddingVertical: 10, borderRadius: 22, backgroundColor: activeTab === 'users' ? '#FF6B35' : 'transparent', alignItems: 'center' }}
          onPress={() => setActiveTab('users')}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: activeTab === 'users' ? 'white' : '#666' }}>
            👥 {t('users')} ({users.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, paddingVertical: 10, borderRadius: 22, backgroundColor: activeTab === 'shops' ? '#FF6B35' : 'transparent', alignItems: 'center' }}
          onPress={() => setActiveTab('shops')}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: activeTab === 'shops' ? 'white' : '#666' }}>
            🏪 {t('shops')} ({shops.length + pendingLocalShops.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'shops' && (
        <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 10, gap: 6 }}>
          {[['all', t('all'), shops.length + pendingLocalShops.length],
            ['validated', '✅', shops.filter(s => s.isValidated).length],
            ['pending', '⏳', shops.filter(s => !s.isValidated && !s.isRejected).length + pendingLocalShops.length],
            ['rejected', '❌', shops.filter(s => s.isRejected).length]
          ].map(([key, label, count]) => (
            <TouchableOpacity
              key={key}
              style={{ flex: 1, paddingVertical: 7, borderRadius: 20, backgroundColor: shopFilter === key ? '#2C3E50' : 'white', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 }}
              onPress={() => setShopFilter(key)}
            >
              <Text style={{ fontSize: 10, fontWeight: '600', color: shopFilter === key ? 'white' : '#555' }}>{label}</Text>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: shopFilter === key ? 'white' : '#FF6B35' }}>{count}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={activeTab === 'users' ? users : getFilteredShops()}
        renderItem={activeTab === 'users' ? renderUser : renderShop}
        keyExtractor={(item) => activeTab === 'users' ? item.id : item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor='#FF6B35' />}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16, paddingTop: 12 }}
        ListEmptyComponent={
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 36 }}>🔍</Text>
            <Text style={{ color: '#777', fontSize: 15, textAlign: 'center', marginTop: 10 }}>
              {activeTab === 'users' ? t('noUserFound') : getEmptyMessage()}
            </Text>
          </View>
        }
      />
    </View>
  );
}