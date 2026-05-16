import React, { useState, useEffect } from 'react';
import { Platform, View, TouchableOpacity, Text, I18nManager } from 'react-native';
import { ApolloProvider } from '@apollo/client';
import client from './src/apolloClientSimple';
import { NavigationProvider } from './src/NavigationContext';
import { CartProvider } from './src/contexts/CartContext';
import { useTranslation, getLanguage, isRTLLanguage } from './src/translations';
import { useRTLCursor } from './src/hooks/useRTLCursor';

// Screens
import HomeScreenHS from './src/components/HomeScreenHS';
import RestaurantScreen from './src/components/RestaurantScreen';
import CartScreen from './src/components/CartScreen';
import CheckoutScreen from './src/components/CheckoutScreen';
import OrderTrackingScreen from './src/components/OrderTrackingScreen';
import ReviewForm from './src/components/ReviewForm';
import ShopLogin from './src/components/ShopLogin';
import ShopDashboard from './src/components/ShopDashboard';
import AdminInterface from './src/components/AdminInterface';
import styles from './src/components/styles';
import pushNotificationService from './src/services/pushNotifications';

const clearCache = async () => {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.includes('products') || key.includes('shops') || key.includes('cache')) {
            localStorage.removeItem(key);
          }
        });
      }
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.includes('products') || k.includes('shops') || k.includes('cache'));
      if (cacheKeys.length > 0) await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (e) {}
};

// VIEWS: 'home' | 'restaurant' | 'cart' | 'checkout' | 'tracking' | 'review' | 'shopLogin' | 'shopDashboard' | 'admin'
function AppContent() {
  const { t } = useTranslation();
  const [view, setView] = useState('home');
  const [selectedShop, setSelectedShop] = useState(null);
  const [currentShop, setCurrentShop] = useState(null); // shop owner session
  const [currentOrder, setCurrentOrder] = useState(null);
  const [previousView, setPreviousView] = useState('home');

  useRTLCursor();

  useEffect(() => {
    clearCache();
    pushNotificationService.initialize().catch(() => {});
    initializeDirection();
    loadSavedShop();
  }, []);

  const navigate = (newView) => {
    setPreviousView(view);
    setView(newView);
  };

  const initializeDirection = async () => {
    try {
      let savedLang;
      if (Platform.OS === 'web') {
        savedLang = localStorage.getItem('selectedLanguage') || localStorage.getItem('language');
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        savedLang = await AsyncStorage.getItem('selectedLanguage') || await AsyncStorage.getItem('language');
      }
      const currentLang = savedLang || getLanguage();
      const shouldBeRTL = isRTLLanguage(currentLang);
      if (Platform.OS === 'web') {
        if (typeof document !== 'undefined') {
          document.documentElement.dir = shouldBeRTL ? 'rtl' : 'ltr';
          document.documentElement.style.direction = shouldBeRTL ? 'rtl' : 'ltr';
        }
      } else {
        if (shouldBeRTL !== I18nManager.isRTL) {
          I18nManager.allowRTL(shouldBeRTL);
          I18nManager.forceRTL(shouldBeRTL);
        }
      }
    } catch (e) {}
  };

  const loadSavedShop = async () => {
    try {
      let savedShop;
      if (Platform.OS === 'web') {
        savedShop = localStorage.getItem('currentShop');
      } else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        savedShop = await AsyncStorage.getItem('currentShop');
      }
      if (savedShop) {
        const shop = JSON.parse(savedShop);
        setCurrentShop(shop);
        setView('shopDashboard');
      }
    } catch (e) {}
  };

  const handleShopLogin = async (shop) => {
    setCurrentShop(shop);
    setView('shopDashboard');
    if (Platform.OS === 'web') {
      localStorage.setItem('currentShop', JSON.stringify(shop));
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('currentShop', JSON.stringify(shop));
      await AsyncStorage.setItem('userId', shop._id);
    }
  };

  const handleLogout = () => {
    setCurrentShop(null);
    setView('home');
    if (Platform.OS === 'web') {
      localStorage.removeItem('currentShop');
      localStorage.removeItem('currentPage');
      localStorage.removeItem('pageData');
    }
  };

  const handleOrderPlaced = (order) => {
    setCurrentOrder(order);
    setView('tracking');
  };

  switch (view) {
    case 'shopDashboard':
      return (
        <ShopDashboard shop={currentShop} onLogout={handleLogout} />
      );

    case 'shopLogin':
      return (
        <View style={{ flex: 1 }}>
          <View style={[styles.headerGlobal, {
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingHorizontal: 15, paddingVertical: 15,
            paddingTop: Platform.OS === 'ios' ? 45 : 15
          }]}>
            <TouchableOpacity onPress={() => setView('home')}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                ← {t('backToMarketplace')}
              </Text>
            </TouchableOpacity>
          </View>
          <ShopLogin onLogin={handleShopLogin} />
        </View>
      );

    case 'admin':
      return <AdminInterface onBack={() => setView('home')} />;

    case 'restaurant':
      return (
        <RestaurantScreen
          shop={selectedShop}
          onBack={() => setView('home')}
          onOpenCart={() => navigate('cart')}
        />
      );

    case 'cart':
      return (
        <CartScreen
          onBack={() => setView(previousView === 'cart' ? 'home' : previousView)}
          onCheckout={() => navigate('checkout')}
        />
      );

    case 'checkout':
      return (
        <CheckoutScreen
          onBack={() => setView('cart')}
          onOrderPlaced={handleOrderPlaced}
        />
      );

    case 'tracking':
      return (
        <OrderTrackingScreen
          order={currentOrder}
          onBack={() => setView('home')}
          onNewOrder={() => setView('home')}
          onReview={() => navigate('review')}
        />
      );

    case 'review':
      return (
        <ReviewForm
          orderId={currentOrder?._id}
          customerPhone={currentOrder?.phone}
          customerName={currentOrder?.customerName || ''}
          shopName={selectedShop?.name || selectedShop?.username || ''}
          onDone={() => setView('home')}
          onBack={() => setView('tracking')}
        />
      );

    default:
      return (
        <HomeScreenHS
          onSelectShop={(shop) => {
            setSelectedShop(shop);
            navigate('restaurant');
          }}
          onShopLogin={() => navigate('shopLogin')}
          onAdminAccess={() => navigate('admin')}
          onOpenCart={() => navigate('cart')}
          onResumeOrder={(order) => {
            setCurrentOrder(order);
            navigate('tracking');
          }}
        />
      );
  }
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <NavigationProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </NavigationProvider>
    </ApolloProvider>
  );
}
