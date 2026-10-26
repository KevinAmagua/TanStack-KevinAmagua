/**
 * OfflineBanner Component
 * Responsabilidad: Banner indicador de modo offline
 * Debe mostrarse cuando !isOnline
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export interface OfflineBannerProps {
  visible?: boolean;
  message?: string;
}

export function OfflineBanner({ 
  visible = false, 
  message = 'Sin conexión - Mostrando datos guardados' 
}: OfflineBannerProps) {
  if (!visible) return null;

  return (
    <View style={styles.banner}>
      <ThemedText style={styles.text}>{message}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FF9500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});
