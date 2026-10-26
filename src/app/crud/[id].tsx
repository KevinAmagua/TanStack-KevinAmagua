import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useFavorite } from '@/hooks/queries/useFavorite';
import { useCreateFavorite } from '@/hooks/mutations/useCreateFavorite';
import { useUpdateFavorite } from '@/hooks/mutations/useUpdateFavorite';
import { useDeleteFavorite } from '@/hooks/mutations/useDeleteFavorite';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BlurView } from 'expo-blur';

export default function CrudScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string | undefined;
  const isCreate = id === 'create' || !id;
  
  const { data: favorite, isLoading } = useFavorite(isCreate ? undefined : id);
  const createMutation = useCreateFavorite();
  const updateMutation = useUpdateFavorite();
  const deleteMutation = useDeleteFavorite();
  
  const [draft, setDraft] = useState<{
    title?: string;
    author?: string;
    notes?: string;
    description?: string;
  }>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const title = draft.title ?? favorite?.title ?? '';
  const author = draft.author ?? favorite?.author ?? '';
  const notes = draft.notes ?? favorite?.notes ?? '';
  const description = draft.description ?? favorite?.description ?? '';
  const updateDraft = (field: keyof typeof draft, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    if (!title.trim()) {
      newErrors.title = 'El título es obligatorio';
    } else if (title.trim().length < 2) {
      newErrors.title = 'El título debe tener al menos 2 caracteres';
    }
    if (author.trim() && author.trim().length < 2) {
      newErrors.author = 'El autor debe tener al menos 2 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      Alert.alert('Validación', 'Por favor corrige los errores');
      return;
    }

    if (isCreate) {
      const createdAt = new Date().toISOString();
      createMutation.mutate(
        { title: title.trim(), author: author.trim() || undefined, notes: notes.trim() || undefined, description: description.trim() || undefined, createdAt, updatedAt: createdAt },
        {
          onSuccess: () => {
            Alert.alert('Éxito', 'Registro creado en MockAPI', [
              { text: 'Ver lista', onPress: () => router.push('/(tabs)/gestor') },
              { text: 'Crear otro', onPress: () => { setDraft({ title: '', author: '', notes: '', description: '' }); setErrors({}); } }
            ]);
          },
          onError: () => {
            Alert.alert('Error', 'No se pudo crear el registro');
          }
        }
      );
    } else if (id) {
      updateMutation.mutate(
        { id: id, title: title.trim(), author: author.trim() || undefined, notes: notes.trim() || undefined, description: description.trim() || undefined },
        {
          onSuccess: () => {
            Alert.alert('Éxito', 'Registro actualizado en MockAPI', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          },
          onError: () => {
            Alert.alert('Error', 'No se pudo actualizar el registro');
          }
        }
      );
    }
  };

  const handleDelete = () => {
    if (!id || isCreate) return;
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
                Alert.alert('Éxito', 'Registro eliminado correctamente', [
                  { text: 'OK', onPress: () => router.back() }
                ]);
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

  if (!isCreate && isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <BlurView intensity={40} tint="light" style={styles.headerBlur}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            {isCreate ? 'CRUD - Crear' : 'CRUD - Editar'}
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Operaciones en MockAPI
          </ThemedText>
        </View>
      </BlurView>

      <BlurView intensity={25} tint="light" style={styles.formBlur}>
        <ThemedView style={styles.formContainer}>
          <ThemedText style={styles.label}>Título *</ThemedText>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={title}
            onChangeText={(text) => { updateDraft('title', text); if(errors.title) setErrors({...errors, title: ''}); }}
            placeholder="Ingrese el título"
            placeholderTextColor="#999"
          />
          {errors.title && <ThemedText style={styles.errorTextSmall}>{errors.title}</ThemedText>}
          
          <ThemedText style={styles.label}>Autor</ThemedText>
          <TextInput
            style={[styles.input, errors.author && styles.inputError]}
            value={author}
            onChangeText={(text) => { updateDraft('author', text); if(errors.author) setErrors({...errors, author: ''}); }}
            placeholder="Nombre del autor"
            placeholderTextColor="#999"
          />
          {errors.author && <ThemedText style={styles.errorTextSmall}>{errors.author}</ThemedText>}
          
          <ThemedText style={styles.label}>Descripción</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={(text) => updateDraft('description', text)}
            placeholder="Descripción del libro"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
          
          <ThemedText style={styles.label}>Notas</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={(text) => updateDraft('notes', text)}
            placeholder="Notas personales"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
          
           <TouchableOpacity
             style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
             onPress={handleSave}
             disabled={isSaving}
           >
             <ThemedText style={styles.saveButtonText}>
               {isSaving ? 'Procesando...' : (isCreate ? 'Crear en MockAPI' : 'Actualizar en MockAPI')}
             </ThemedText>
           </TouchableOpacity>

           {!isCreate && (
             <TouchableOpacity
               style={[styles.deleteButton, deleteMutation.isPending && styles.saveButtonDisabled]}
               onPress={handleDelete}
               disabled={isSaving || deleteMutation.isPending}
             >
               <ThemedText style={styles.deleteButtonText}>
                 {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar registro'}
               </ThemedText>
             </TouchableOpacity>
           )}
           
           <TouchableOpacity
             style={styles.cancelButton}
             onPress={() => router.back()}
             disabled={isSaving}
           >
            <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </BlurView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  headerBlur: {
    overflow: 'hidden',
    marginBottom: 16,
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
  formBlur: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  formContainer: {
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    color: '#000',
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    color: '#000',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorTextSmall: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});