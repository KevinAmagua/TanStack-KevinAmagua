/**
 * Root Layout
 */
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { queryClient } from '@/lib/queryClient';
import { initializeNetworkManager } from '@/lib/network';
import { persistOptions } from '@/lib/persister';
import { queryKeys } from '@/lib/queryKeys';
import type { Favorite } from '@/types/favorite.types';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    initializeNetworkManager(queryClient);
  }, []);
  
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
      onSuccess={async () => {
        const cachedFavorites =
          queryClient.getQueryData<Favorite[]>(queryKeys.favorites.list())?.length ?? 0;
        const pausedMutations = queryClient
          .getMutationCache()
          .getAll()
          .filter((mutation) => mutation.state.isPaused).length;
        console.info(
          `[${new Date().toISOString()}] [persistence] cache restored; cached favorites: ${cachedFavorites}; paused mutations: ${pausedMutations}`
        );
        await queryClient.resumePausedMutations();
      }}
      onError={() => {
        console.error(
          `[${new Date().toISOString()}] [persistence] cache restore or mutation resume failed`
        );
      }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}