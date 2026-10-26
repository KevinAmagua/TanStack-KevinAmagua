import React, { useState } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useFavorite } from '@/hooks/queries/useFavorite';
import { useCreateFavorite } from '@/hooks/mutations/useCreateFavorite';
import { useUpdateFavorite } from '@/hooks/mutations/useUpdateFavorite';
import { useDeleteFavorite } from '@/hooks/mutations/useDeleteFavorite';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function FavoriteDetailScreen() {
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
  const updateDraft = (field: keyof typeof draft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }));
    }
  };

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
    if (description.trim().length > 500) {
      newErrors.description = 'La descripción no puede superar los 500 caracteres';
    }
    if (notes.trim().length > 500) {
      newErrors.notes = 'Las notas no pueden superar los 500 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      Alert.alert('Validación', 'Por favor corrige los errores en el formulario');
      return;
    }

    if (isCreate) {
      const createdAt = new Date().toISOString();
      createMutation.mutate(
        { title: title.trim(), author: author.trim() || undefined, notes: notes.trim() || undefined, description: description.trim() || undefined, createdAt, updatedAt: createdAt },
        {
          onSuccess: () => {
            Alert.alert('Exito', 'Favorito creado correctamente', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          },
          onError: () => {
            Alert.alert('Error', 'No se pudo crear el favorito');
          }
        }
      );
    } else if (id) {
      updateMutation.mutate(
        { id: id, title: title.trim(), author: author.trim() || undefined, notes: notes.trim() || undefined, description: description.trim() || undefined },
        {
          onSuccess: () => {
            Alert.alert('Exito', 'Favorito actualizado correctamente', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          },
          onError: () => {
            Alert.alert('Error', 'No se pudo actualizar el favorito');
          }
        }
      );
    }
  };

  const handleDelete = () => {
    if (!id || isCreate) return;
    Alert.alert(
      'Eliminar favorito',
      '¿Estás seguro de que deseas eliminar este favorito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(id, {
              onSuccess: () => {
                Alert.alert('Exito', 'Favorito eliminado correctamente', [
                  { text: 'OK', onPress: () => router.back() }
                ]);
              },
              onError: () => {
                Alert.alert('Error', 'No se pudo eliminar el favorito');
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
        <ActivityIndicator size='large' />
      </ThemedView>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type='title' style={styles.title}>
          {isCreate ? 'Crear Favorito' : 'Editar Favorito'}
        </ThemedText>
        
        <ThemedText style={styles.label}>Titulo *</ThemedText>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          value={title}
          onChangeText={(value) => updateDraft('title', value)}
          placeholder='Titulo del libro'
          placeholderTextColor="#999"
        />
        {errors.title && <ThemedText style={styles.errorTextSmall}>{errors.title}</ThemedText>}
        
        <ThemedText style={styles.label}>Autor</ThemedText>
        <TextInput
          style={[styles.input, errors.author && styles.inputError]}
          value={author}
          onChangeText={(value) => updateDraft('author', value)}
          placeholder='Autor del libro'
          placeholderTextColor="#999"
        />
        {errors.author && <ThemedText style={styles.errorTextSmall}>{errors.author}</ThemedText>}
        
        <ThemedText style={styles.label}>Descripcion</ThemedText>
        <TextInput
          style={[styles.input, styles.textArea, errors.description && styles.inputError]}
          value={description}
          onChangeText={(value) => updateDraft('description', value)}
          placeholder='Descripcion'
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />
        {errors.description && <ThemedText style={styles.errorTextSmall}>{errors.description}</ThemedText>}
        
        <ThemedText style={styles.label}>Notas</ThemedText>
        <TextInput
          style={[styles.input, styles.textArea, errors.notes && styles.inputError]}
          value={notes}
          onChangeText={(value) => updateDraft('notes', value)}
          placeholder='Notas personales'
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />
        {errors.notes && <ThemedText style={styles.errorTextSmall}>{errors.notes}</ThemedText>}
        
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <ThemedText style={styles.saveButtonText}>
            {isSaving ? 'Guardando...' : (isCreate ? 'Crear' : 'Guardar')}
          </ThemedText>
        </TouchableOpacity>

        {!isCreate && (
          <TouchableOpacity
            style={[styles.deleteButton, deleteMutation.isPending && styles.saveButtonDisabled]}
            onPress={handleDelete}
            disabled={isSaving || deleteMutation.isPending}
          >
            <ThemedText style={styles.deleteButtonText}>
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
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
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});