import React from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useBookDetail } from '@/hooks/queries/useBookDetail';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function BookDetailScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const { data: book, isLoading, isError } = useBookDetail(id);

  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size='large' />
        <ThemedText style={styles.messageText}>Cargando detalle...</ThemedText>
      </ThemedView>
    );
  }

  if (isError || !book) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.errorText}>Error al cargar el libro</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type='title' style={styles.title}>{book.title}</ThemedText>
        <ThemedText style={styles.sectionTitle}>Autores</ThemedText>
        <ThemedText style={styles.text}>
          {book.authors.length > 0 ? book.authors.join(', ') : 'Desconocido'}
        </ThemedText>
        
        {book.firstPublishYear ? (
          <View>
            <ThemedText style={styles.sectionTitle}>Año de publicación</ThemedText>
            <ThemedText style={styles.text}>{book.firstPublishYear}</ThemedText>
          </View>
        ) : null}
        
        {book.firstPublishDate ? (
          <View>
            <ThemedText style={styles.sectionTitle}>Fecha de publicación</ThemedText>
            <ThemedText style={styles.text}>{book.firstPublishDate}</ThemedText>
          </View>
        ) : null}
        
        {book.description ? (
          <View>
            <ThemedText style={styles.sectionTitle}>Descripción</ThemedText>
            <ThemedText style={styles.description}>{book.description}</ThemedText>
          </View>
        ) : null}
        
        {book.subjects && book.subjects.length > 0 ? (
          <View>
            <ThemedText style={styles.sectionTitle}>Temas</ThemedText>
            <ThemedText style={styles.text}>{book.subjects.slice(0, 5).join(', ')}</ThemedText>
          </View>
        ) : null}
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
    padding: 20,
  },
  messageText: {
    marginTop: 12,
  },
  errorText: {
    color: '#FF3B30',
  },
  title: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});