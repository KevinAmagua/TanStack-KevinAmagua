/**
 * ToastBanner Component
 * Responsabilidad: Mostrar notificaciones flotantes no intrusivas (toasts)
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { ThemedText } from './themed-text';

interface ToastBannerProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  onHide?: () => void;
}

export function ToastBanner({ message, type = 'success', visible, onHide }: ToastBannerProps) {
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onHide) onHide();
      });
    }
  }, [visible, opacity, onHide]);

  if (!visible) return null;

  const backgroundColor =
    type === 'error' ? '#f85149' : type === 'success' ? '#238636' : '#1f6feb';

  return (
    <Animated.View style={[styles.container, { backgroundColor, opacity }]}>
      <ThemedText style={styles.text}>{message}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 10,
    zIndex: 9999,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
