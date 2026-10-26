import React, { useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, RefreshControl } from 'react-native';
import { useBooks } from '@/hooks/queries/useBooks';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Book } from '@/types/book.types';
import { useCreateFavorite } from '@/hooks/mutations/useCreateFavorite';
import { useUpdateFavorite } from '@/hooks/mutations/useUpdateFavorite';
import { useDeleteFavorite } from '@/hooks/mutations/useDeleteFavorite';
import { useFavorites } from '@/hooks/queries/useFavorites';
import { useQueryClient } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ToastBanner } from '@/components/ToastBanner';
import { formatSavedAt } from '@/lib/dateFormatting';

type TabView = 'buscar' | 'guardados';

export default function BibliotecaGestorScreen() {
  const [activeTab, setActiveTab] = useState<TabView>('buscar');
  const [searchQuery, setSearchQuery] = useState('');
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const { data: books, isLoading, isError } = useBooks(
    query ? { query } : undefined
  );
  const { data: guardados, isLoading: loadingGuardados, refetch: refetchGuardados } = useFavorites();
  const createFavorite = useCreateFavorite();
  const updateFavorite = useUpdateFavorite();
  const deleteFavorite = useDeleteFavorite();

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchGuardados();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar registro',
      '¿Estás seguro de que deseas eliminar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteFavorite.mutate(id, {
              onSuccess: () => {
                showToast('Registro eliminado correctamente', 'success');
                if (editingId === id) {
                  limpiarFormulario();
                }
                refetchGuardados();
              },
              onError: () => {
                showToast('No se pudo eliminar el registro', 'error');
              }
            });
          }
        }
      ]
    );
  };
  const queryClient = useQueryClient();
  const networkState = Network.useNetworkState();
  const isOffline =
    networkState.isConnected === false ||
    networkState.isInternetReachable === false;

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      Alert.alert('Atención', 'Escribe algo para buscar');
      return;
    }
    setQuery(searchQuery.trim());
  };

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formTitle.trim()) {
      newErrors.title = 'El título es obligatorio';
    } else if (formTitle.trim().length < 2) {
      newErrors.title = 'El título debe tener al menos 2 caracteres';
    }
    if (formAuthor.trim() && formAuthor.trim().length < 2) {
      newErrors.author = 'El autor debe tener al menos 2 caracteres';
    }
    if (formDescription.trim().length > 500) {
      newErrors.description = 'La descripción no puede superar los 500 caracteres';
    }
    if (formNotes.trim().length > 500) {
      newErrors.notes = 'Las notas no pueden superar los 500 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const guardarDesdeApi = (book: Book) => {
    const createdAt = new Date().toISOString();
    createFavorite.mutate(
      {
        title: book.title,
        author: book.authors.length > 0 ? book.authors.join(', ') : undefined,
        createdAt,
        updatedAt: createdAt,
      },
      {
        onSuccess: () => {
          showToast('¡Libro guardado correctamente en MockAPI!', 'success');
        },
        onError: (err: any) => {
          showToast('No se pudo guardar: ' + (err?.message || 'Error'), 'error');
        }
      }
    );
  };

  const guardarManual = () => {
    if (!validate()) {
      showToast('Por favor corrige los errores del formulario', 'error');
      return;
    }
    if (editingId) {
      updateFavorite.mutate(
        { id: editingId, title: formTitle.trim(), author: formAuthor.trim() || undefined, notes: formNotes.trim() || undefined, description: formDescription.trim() || undefined },
        {
          onSuccess: () => {
            showToast('¡Registro actualizado correctamente!', 'success');
            limpiarFormulario();
            refetchGuardados();
            setActiveTab('guardados');
          },
          onError: (err: any) => {
            showToast('No se pudo actualizar: ' + (err?.message || 'Error'), 'error');
          }
        }
      );
    } else {
      const createdAt = new Date().toISOString();
      createFavorite.mutate(
        { title: formTitle.trim(), author: formAuthor.trim() || undefined, notes: formNotes.trim() || undefined, description: formDescription.trim() || undefined, createdAt, updatedAt: createdAt },
        {
          onSuccess: () => {
            showToast('¡Registro creado correctamente!', 'success');
            limpiarFormulario();
            setActiveTab('guardados');
          },
          onError: (err: any) => {
            showToast('No se pudo crear: ' + (err?.message || 'Error'), 'error');
          }
        }
      );
    }
  };

  const editarRegistro = (item: any) => {
    setEditingId(item.id);
    setFormTitle(item.title || '');
    setFormAuthor(item.author || '');
    setFormNotes(item.notes || '');
    setFormDescription(item.description || '');
    setErrors({});
    setActiveTab('buscar');
  };

  const limpiarFormulario = () => {
    setEditingId(null);
    setFormTitle('');
    setFormAuthor('');
    setFormNotes('');
    setFormDescription('');
    setErrors({});
  };

  const renderLibroApi = ({ item }: { item: Book }) => (
    <View style={styles.card}>
      <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
      <ThemedText style={styles.cardSub}>{item.authors.length > 0 ? item.authors.join(', ') : 'Sin autor'}</ThemedText>
      {item.firstPublishYear && <ThemedText style={styles.cardMeta}>{item.firstPublishYear}</ThemedText>}
      <TouchableOpacity style={styles.btnGuardar} onPress={() => guardarDesdeApi(item)} disabled={createFavorite.isPending}>
        <ThemedText style={styles.btnText}>Guardar</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderGuardado = ({ item }: any) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => editarRegistro(item)}
        disabled={item.id.startsWith('pending-')}>
        <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
        {item.author && <ThemedText style={styles.cardSub}>{item.author}</ThemedText>}
        {item.notes && <ThemedText style={styles.cardNotes} numberOfLines={2}>{item.notes}</ThemedText>}
        <ThemedText style={styles.savedAtText}>{formatSavedAt(item.createdAt)}</ThemedText>
        {item.id.startsWith('pending-') && (
          <ThemedText style={styles.pendingText}>Pendiente de sincronizar</ThemedText>
        )}
        {!item.id.startsWith('pending-') && (
          <ThemedText style={styles.editHint}>Tocar para editar</ThemedText>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteCardButton}
        onPress={() => handleDelete(item.id)}
        disabled={deleteFavorite.isPending}
      >
        <ThemedText style={styles.deleteCardButtonText}>Eliminar</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ToastBanner
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Biblioteca</ThemedText>
        <ThemedText style={styles.headerSub}>Busca libros y organiza tu colección personal</ThemedText>
      </View>
      <OfflineBanner visible={isOffline} />

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'buscar' && styles.tabActive]} onPress={() => { setActiveTab('buscar'); limpiarFormulario(); }}>
          <ThemedText style={[styles.tabText, activeTab === 'buscar' && styles.tabTextActive]}>
            {editingId ? 'Editar' : 'Buscar / Crear'}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'guardados' && styles.tabActive]} onPress={() => { setActiveTab('guardados'); refetchGuardados(); }}>
          <ThemedText style={[styles.tabText, activeTab === 'guardados' && styles.tabTextActive]}>Guardados ({guardados?.length || 0})</ThemedText>
        </TouchableOpacity>
      </View>

      {activeTab === 'buscar' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.input}
              placeholder="Buscar en OpenLibrary..."
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.btnSearch} onPress={handleSearch}>
              <ThemedText style={styles.btnText}>Buscar</ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.sectionTitle}>
            {editingId ? 'Editar registro' : 'Crear registro manual'}
          </ThemedText>
          
          <TextInput style={[styles.formInput, errors.title && styles.formInputError]} placeholder="Título *" placeholderTextColor="#6b7280" value={formTitle} onChangeText={(t) => { setFormTitle(t); if(errors.title) setErrors({...errors, title: ''}); }} />
          {errors.title && <ThemedText style={styles.errorSmall}>{errors.title}</ThemedText>}
          
          <TextInput style={[styles.formInput, errors.author && styles.formInputError]} placeholder="Autor" placeholderTextColor="#6b7280" value={formAuthor} onChangeText={(t) => { setFormAuthor(t); if(errors.author) setErrors({...errors, author: ''}); }} />
          {errors.author && <ThemedText style={styles.errorSmall}>{errors.author}</ThemedText>}

          <TextInput style={[styles.formInput, errors.description && styles.formInputError]} placeholder="Descripción" placeholderTextColor="#6b7280" value={formDescription} onChangeText={(t) => { setFormDescription(t); if(errors.description) setErrors({...errors, description: ''}); }} />
          {errors.description && <ThemedText style={styles.errorSmall}>{errors.description}</ThemedText>}

          <TextInput style={[styles.formInput, { height: 80, textAlignVertical: 'top', paddingTop: 10 }, errors.notes && styles.formInputError]} placeholder="Notas" placeholderTextColor="#6b7280" value={formNotes} onChangeText={(t) => { setFormNotes(t); if(errors.notes) setErrors({...errors, notes: ''}); }} multiline />
          {errors.notes && <ThemedText style={styles.errorSmall}>{errors.notes}</ThemedText>}
          
          <TouchableOpacity style={styles.btnPrimary} onPress={guardarManual} disabled={createFavorite.isPending || updateFavorite.isPending}>
            <ThemedText style={styles.btnText}>
              {createFavorite.isPending || updateFavorite.isPending
                ? 'Procesando...'
                : editingId
                  ? 'Actualizar en MockAPI'
                  : 'Guardar en MockAPI'}
            </ThemedText>
          </TouchableOpacity>
          {editingId && (
            <>
              <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(editingId)} disabled={deleteFavorite.isPending}>
                <ThemedText style={styles.btnText}>Eliminar registro</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSecondary} onPress={limpiarFormulario}>
                <ThemedText style={styles.btnSecondaryText}>Cancelar edición</ThemedText>
              </TouchableOpacity>
            </>
          )}

          <ThemedText style={[styles.sectionTitle, { marginTop: 24 }]}>
            Resultados OpenLibrary
          </ThemedText>
          {isLoading && <ActivityIndicator size="small" color="#4f9deb" style={{ marginVertical: 12 }} />}
          {isError && <ThemedText style={styles.errorText}>Error al buscar en OpenLibrary</ThemedText>}
          {!isLoading && !isError && query && books && books.length === 0 && <ThemedText style={styles.muted}>Sin resultados</ThemedText>}
          {books && books.map((book, idx) => <View key={book.id + idx}>{renderLibroApi({ item: book })}</View>)}
        </ScrollView>
      )}

      {activeTab === 'guardados' && (
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <ThemedText style={styles.sectionTitle}>Registros guardados</ThemedText>
            <TouchableOpacity onPress={() => { refetchGuardados(); queryClient.invalidateQueries({ queryKey: ['favorites'] }); }}>
              <ThemedText style={styles.linkText}>Actualizar</ThemedText>
            </TouchableOpacity>
          </View>
          {loadingGuardados && <ActivityIndicator size="small" color="#4f9deb" style={{ marginVertical: 12 }} />}
          {!loadingGuardados && guardados && guardados.length === 0 && (
            <View style={styles.emptyBox}>
              <ThemedText style={styles.emptyTitle}>📖 Sin registros guardados</ThemedText>
              <ThemedText style={styles.muted}>Busca libros en OpenLibrary o crea uno manual</ThemedText>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setActiveTab('buscar')}>
                <ThemedText style={styles.emptyBtnText}>Ir a Buscar / Crear</ThemedText>
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
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1419' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#161b22', borderBottomWidth: 1, borderBottomColor: '#30363d' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#f0f6fc' },
  headerSub: { marginTop: 4, color: '#8b949e', fontSize: 13 },
  tabs: { flexDirection: 'row', backgroundColor: '#161b22', borderBottomWidth: 1, borderBottomColor: '#30363d' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#4f9deb' },
  tabText: { color: '#8b949e', fontWeight: '600' },
  tabTextActive: { color: '#4f9deb' },
  content: { flex: 1, padding: 16 },
  searchBox: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: { flex: 1, height: 44, backgroundColor: '#161b22', borderWidth: 1, borderColor: '#30363d', borderRadius: 10, paddingHorizontal: 12, color: '#f0f6fc' },
  btnSearch: { backgroundColor: '#238636', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '600' },
  sectionTitle: { color: '#f0f6fc', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: '#161b22', borderWidth: 1, borderColor: '#30363d', borderRadius: 12, padding: 14, marginBottom: 10 },
  cardTitle: { color: '#f0f6fc', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardSub: { color: '#8b949e', fontSize: 14 },
  cardMeta: { color: '#8b949e', fontSize: 12, marginTop: 4 },
  cardNotes: { color: '#8b949e', fontSize: 13, marginTop: 6 },
  savedAtText: { color: '#8b949e', fontSize: 12, marginTop: 6 },
  pendingText: { color: '#ffb454', fontSize: 12, fontWeight: '600', marginTop: 6 },
  btnGuardar: { backgroundColor: '#1f6feb', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start', marginTop: 10 },
  formInput: { height: 44, backgroundColor: '#161b22', borderWidth: 1, borderColor: '#30363d', borderRadius: 10, paddingHorizontal: 12, color: '#f0f6fc', marginBottom: 10 },
  formInputError: { borderColor: '#f85149' },
  errorSmall: { color: '#f85149', fontSize: 12, marginTop: -6, marginBottom: 8 },
  errorText: { color: '#f85149' },
  muted: { color: '#8b949e' },
  btnPrimary: { backgroundColor: '#238636', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnDelete: { backgroundColor: '#f85149', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnSecondary: { paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#30363d' },
  btnSecondaryText: { color: '#8b949e' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  linkText: { color: '#4f9deb', fontWeight: '600' },
  editHint: { color: '#4f9deb', fontSize: 12, marginTop: 6 },
  emptyBox: { padding: 24, alignItems: 'center', backgroundColor: '#161b22', borderRadius: 12, borderWidth: 1, borderColor: '#30363d' },
  emptyTitle: { color: '#f0f6fc', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyBtn: { backgroundColor: '#1f6feb', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginTop: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
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