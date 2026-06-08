import React, { lazy, Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * lazyScreen — يحمّل الشاشة فقط عند الحاجة (code splitting)
 *
 * مثال:
 *   const AdminDashboard = lazyScreen(() => import('../components/AdminDashboard'));
 */
export const lazyScreen = (importFn) => {
  const LazyComponent = lazy(importFn);
  return function LazyScreen(props) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
};

const LoadingScreen = () => (
  <View style={styles.loading}>
    <ActivityIndicator size="large" color="#C8A55F" />
  </View>
);

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
