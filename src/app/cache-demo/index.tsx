import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { queryClient } from '@/lib/queryClient';
import { BlurView } from 'expo-blur';

export default function CacheDemoScreen() {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();
  
  const getStatusColor = (status: string) => {
    if (status === 'success') return '#34C759';
    if (status === 'pending') return '#FF9500';
    if (status === 'error') return '#FF3B30';
    return '#999';
  };

  const renderQuery = ({ item }: any) => (
    <BlurView intensity={20} tint="light" style={styles.queryCardBlur}>
      <View style={styles.queryCard}>
        <View style={styles.queryHeader}>
          <ThemedText type="smallBold" style={styles.queryKey}>
            {JSON.stringify(item.queryKey)}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.state.status) }]}>
            <ThemedText style={styles.statusText}>{item.state.status}</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.queryInfo}>
          Data actualizado: {item.state.dataUpdateCount} veces
        </ThemedText>
        <ThemedText style={styles.queryInfo}>
          Estado: {item.state.isFetching ? 'Actualizando...' : 'En caché'}
        </ThemedText>
      </View>
    </BlurView>
  );

  return (
    <ThemedView style={styles.container}>
      <BlurView intensity={30} tint="light" style={styles.headerBlur}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Demo de Caché
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Estado de TanStack Query Cache
          </ThemedText>
        </View>
      </BlurView>

      <View style={styles.statsContainer}>
        <BlurView intensity={25} tint="light" style={styles.statBlur}>
          <View style={styles.statCard}>
            <ThemedText style={styles.statNumber}>{queries.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Queries en caché</ThemedText>
          </View>
        </BlurView>
      </View>

      {queries.length === 0 ? (
        <View style={styles.centerContainer}>
          <ThemedText style={styles.messageText}>
            No hay queries en caché
          </ThemedText>
          <ThemedText style={styles.subMessageText}>
            Busca libros o carga favoritos para ver el caché
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={queries}
          renderItem={renderQuery}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={() => {}}>
        <ThemedText style={styles.refreshButtonText}>Actualizar Vista</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  headerBlur: {
    overflow: 'hidden',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  statsContainer: {
    padding: 16,
  },
  statBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCard: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  messageText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subMessageText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  queryCardBlur: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  queryCard: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  queryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  queryKey: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  queryInfo: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});