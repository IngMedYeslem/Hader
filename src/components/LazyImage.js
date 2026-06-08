import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Image, View, Animated, Platform, StyleSheet } from 'react-native';

/**
 * LazyImage — تحميل الصور فقط عند ظهورها في الشاشة
 * - على الويب: Intersection Observer API
 * - على الموبايل: يحمّل فوراً مع animation تدريجية
 */
const LazyImage = ({
  source,
  style,
  resizeMode = 'cover',
  placeholderColor = '#f0e6d3',
  onLoad,
  onError,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(Platform.OS !== 'web');
  const [error, setError] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const containerRef = useRef(null);

  // على الويب: Intersection Observer لتحميل الصورة فقط عند الظهور
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // ابدأ التحميل 200px قبل الظهور
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    onLoad?.();
  }, [opacity, onLoad]);

  const handleError = useCallback(() => {
    setError(true);
    setLoaded(true);
    onError?.();
  }, [onError]);

  const flatStyle = StyleSheet.flatten(style) || {};
  const { width, height, borderRadius, ...containerStyle } = flatStyle;

  return (
    <View
      ref={containerRef}
      style={[
        styles.container,
        { width, height, borderRadius, backgroundColor: placeholderColor },
        containerStyle,
      ]}
    >
      {/* Placeholder shimmer */}
      {!loaded && <View style={[StyleSheet.absoluteFill, styles.placeholder]} />}

      {/* الصورة الحقيقية */}
      {visible && !error && (
        <Animated.Image
          source={source}
          style={[StyleSheet.absoluteFill, { opacity, borderRadius }]}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}

      {/* Fallback عند الخطأ */}
      {error && (
        <View style={[StyleSheet.absoluteFill, styles.errorBox]}>
          <View style={styles.errorIcon} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0e6d3',
  },
  placeholder: {
    backgroundColor: '#f0e6d3',
  },
  errorBox: {
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0d0b8',
  },
});

export default React.memo(LazyImage);
