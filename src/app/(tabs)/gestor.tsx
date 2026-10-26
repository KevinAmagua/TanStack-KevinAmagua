import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFavorites } from '@/hooks/queries/useFavorites';
import { useDeleteFavorite } from '@/hooks/mutations/useDeleteFavorite';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useQueryClient } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { OfflineBanner } from '@/components/OfflineBanner';
import { formatSavedAt } from '@/lib/dateFormatting';

export default function GestorScreen() {
  const { data: guardados, isLoading, refetch } = useFavorites();
  const deleteMutation = useDeleteFavorite();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const networkState = Network.useNetworkState();
  const isOffline =
    networkState.isConnected === false ||
    networkState.isInternetReachable === false;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar registro',
      '¿Estás seguro de que deseas eliminar este registro de MockAPI?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(id, {
              onSuccess: () => {
                Alert.alert('Éxito', 'Registro eliminado correctamente');
              },
              onError: () => {
                Alert.alert('Error', 'No se pudo eliminar el registro');
              }
            });
          }
        }
      ]
    );
  };

  const renderGuardado = ({ item }: any) => (
    <View style={styles.card}>
      <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
      {item.author && <ThemedText style={styles.cardSub}>{item.author}</ThemedText>}
      <ThemedText style={styles.savedAtText}>{formatSavedAt(item.createdAt)}</ThemedText>
      {item.description && <ThemedText style={styles.cardNotes} numberOfLines={2}>{item.description}</ThemedText>}
      {item.notes && <ThemedText style={styles.cardNotes} numberOfLines={2}>{item.notes}</ThemedText>}
      {item.id.startsWith('pending-') && (
        <ThemedText style={styles.pendingText}>Pendiente de sincronizar</ThemedText>
      )}
      <ThemedText style={styles.idText}>ID: {item.id}</ThemedText>
      <TouchableOpacity
        style={styles.deleteCardButton}
        onPress={() => handleDelete(item.id)}
        disabled={deleteMutation.isPending}
      >
        <ThemedText style={styles.deleteCardButtonText}>Eliminar</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Libros guardados</ThemedText>
        <ThemedText style={styles.headerSub}>Tu colección personal</ThemedText>
      </View>
      <OfflineBanner visible={isOffline} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.sectionTitle}>Todos los registros ({guardados?.length || 0})</ThemedText>
          <TouchableOpacity onPress={() => { refetch(); queryClient.invalidateQueries({ queryKey: ['favorites'] }); }}>
            <ThemedText style={styles.linkText}>Actualizar</ThemedText>
          </TouchableOpacity>
        </View>
        {isLoading && <ActivityIndicator size="small" color="#4f9deb" style={{ marginVertical: 12 }} />}
        {!isLoading && guardados && guardados.length === 0 && (
          <View style={styles.emptyBox}>
            <ThemedText style={styles.emptyTitle}>📖 Sin libros guardados</ThemedText>
            <ThemedText style={styles.muted}>Tu colección personal está vacía.</ThemedText>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => refetch()}>
              <ThemedText style={styles.emptyBtnText}>Actualizar / Reintentar</ThemedText>
            </TouchableOpacity>
          </View>
        )}
        <FlatList
          data={guardados || []}
          renderItem={renderGuardado}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f9deb" />
          }
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1419' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#161b22', borderBottomWidth: 1, borderBottomColor: '#30363d' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#f0f6fc' },
  headerSub: { marginTop: 4, color: '#8b949e', fontSize: 13 },
  content: { flex: 1, padding: 16 },
  sectionTitle: { color: '#f0f6fc', fontSize: 16, fontWeight: '700' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  linkText: { color: '#4f9deb', fontWeight: '600' },
  card: { backgroundColor: '#161b22', borderWidth: 1, borderColor: '#30363d', borderRadius: 12, padding: 14, marginBottom: 10 },
  cardTitle: { color: '#f0f6fc', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardSub: { color: '#8b949e', fontSize: 14 },
  savedAtText: { color: '#8b949e', fontSize: 12, marginTop: 6 },
  cardNotes: { color: '#8b949e', fontSize: 13, marginTop: 6 },
  pendingText: { color: '#ffb454', fontSize: 12, fontWeight: '600', marginTop: 6 },
  muted: { color: '#8b949e' },
  emptyBox: { padding: 24, alignItems: 'center', backgroundColor: '#161b22', borderRadius: 12, borderWidth: 1, borderColor: '#30363d' },
  emptyTitle: { color: '#f0f6fc', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyBtn: { backgroundColor: '#1f6feb', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginTop: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  idText: { color: '#6e7681', fontSize: 11, marginTop: 8 },
  deleteCardButton: {
    backgroundColor: '#f85149',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  deleteCardButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});