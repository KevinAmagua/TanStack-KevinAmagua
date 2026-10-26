import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function CacheDemoScreen() {
  const queryClient = useQueryClient();
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();

  const getStatusColor = (status: string) => {
    if (status === 'success') return '#238636';
    if (status === 'pending') return '#d29922';
    if (status === 'error') return '#f85149';
    return '#8b949e';
  };

  const renderQuery = ({ item }: any) => (
    <View style={styles.queryCard}>
      <View style={styles.queryHeader}>
        <ThemedText style={styles.queryKey}>{JSON.stringify(item.queryKey)}</ThemedText>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.state.status) }]}>
          <ThemedText style={styles.statusText}>{item.state.status}</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.queryInfo}>Actualizaciones: {item.state.dataUpdateCount}</ThemedText>
      <ThemedText style={styles.queryInfo}>{item.state.isFetching ? 'Fetching...' : 'En cache'}</ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Cache</ThemedText>
        <ThemedText style={styles.headerSub}>Inspección de TanStack Query</ThemedText>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{queries.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Queries activas</ThemedText>
        </View>
      </View>

      {queries.length === 0 ? (
        <View style={styles.centerContainer}>
          <ThemedText style={styles.messageText}>Sin queries en caché</ThemedText>
          <ThemedText style={styles.subMessageText}>Busca o guarda registros para ver el caché</ThemedText>
        </View>
      ) : (
        <FlatList
          data={queries}
          renderItem={renderQuery}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1419' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#161b22', borderBottomWidth: 1, borderBottomColor: '#30363d' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#f0f6fc' },
  headerSub: { marginTop: 4, color: '#8b949e', fontSize: 13 },
  statsContainer: { padding: 16 },
  statCard: { backgroundColor: '#161b22', borderWidth: 1, borderColor: '#30363d', borderRadius: 12, padding: 16, alignItems: 'center' },
  statNumber: { fontSize: 36, fontWeight: '700', color: '#4f9deb' },
  statLabel: { color: '#8b949e', marginTop: 4 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  messageText: { color: '#f0f6fc', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  subMessageText: { color: '#8b949e', textAlign: 'center', marginTop: 8 },
  listContainer: { padding: 16, paddingBottom: 40 },
  queryCard: { backgroundColor: '#161b22', borderWidth: 1, borderColor: '#30363d', borderRadius: 12, padding: 14, marginBottom: 10 },
  queryHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  queryKey: { flex: 1, color: '#f0f6fc', fontSize: 12, fontFamily: 'monospace' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  queryInfo: { color: '#8b949e', fontSize: 12, marginTop: 2 },
});