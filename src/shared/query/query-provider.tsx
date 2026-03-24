import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  QueryClient,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import React from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { ApiError } from '@/shared/api/api-error';
import { createVersionedStorageKey } from '@/shared/storage/storage-keys';

const QUERY_CACHE_KEY = createVersionedStorageKey('query', 'cache', 1);

function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === 'configuration') {
      return false;
    }

    if (error.status && error.status >= 400 && error.status < 500) {
      return false;
    }
  }

  return failureCount < 2;
}

function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 1000 * 60 * 60 * 24,
        retry: shouldRetry,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

const queryClient = createAppQueryClient();

const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: QUERY_CACHE_KEY,
  throttleTime: 1000,
});

function useReactQueryAppStateSync() {
  React.useEffect(() => {
    const onAppStateChange = (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
      onlineManager.setOnline(true);
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    onAppStateChange(AppState.currentState);

    return () => {
      subscription.remove();
    };
  }, []);
}

export function AppQueryProvider({ children }: { children: React.ReactNode }) {
  useReactQueryAppStateSync();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: 1000 * 60 * 60 * 12,
      }}>
      {children}
    </PersistQueryClientProvider>
  );
}

export { queryClient };
