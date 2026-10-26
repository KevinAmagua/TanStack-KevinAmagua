/**
 * Network Manager Configuration
 * Sincroniza los cambios de conectividad de Expo Network con TanStack Query.
 */

import { onlineManager } from '@tanstack/react-query';
import * as Network from 'expo-network';
import type { QueryClient } from '@tanstack/react-query';

let initialized = false;

function updateOnlineStatus(
  state: Pick<Network.NetworkState, 'isConnected' | 'isInternetReachable'>,
  queryClient: QueryClient
) {
  const isOnline =
    state.isConnected === true && state.isInternetReachable !== false;
  const wasOnline = onlineManager.isOnline();

  onlineManager.setOnline(isOnline);
  if (wasOnline !== isOnline) {
    const pendingCount = queryClient
      .getMutationCache()
      .getAll()
      .filter((mutation) => mutation.state.isPaused).length;
    console.info(
      `[${new Date().toISOString()}] [network] ${
        isOnline ? 'online' : 'offline'
      }; paused mutations: ${pendingCount}`
    );
  }
}

export function initializeNetworkManager(queryClient: QueryClient): void {
  if (initialized) return;
  initialized = true;

  onlineManager.setOnline(false);
  Network.addNetworkStateListener((state) =>
    updateOnlineStatus(state, queryClient)
  );

  void Network.getNetworkStateAsync()
    .then((state) => updateOnlineStatus(state, queryClient))
    .catch((error: unknown) => {
      onlineManager.setOnline(false);
      console.error(
        `[${new Date().toISOString()}] [network] Could not read network state`,
        error
      );
    });
}

export function setOnlineStatus(isOnline: boolean, queryClient?: QueryClient) {
  if (queryClient) {
    updateOnlineStatus(
      { isConnected: isOnline, isInternetReachable: isOnline },
      queryClient
    );
  } else {
    onlineManager.setOnline(isOnline);
  }
}

export { onlineManager };
