import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import api from '@/constants/api';
import {
  getQueue,
  deduplicateQueue,
  dequeue,
  incrementRetry,
  clearQueue,
  getQueueLength,
  QueuedMutation,
} from '@/utils/mutation-queue';

interface NetworkContextType {
  isOnline: boolean;
  pendingCount: number;
  refreshPendingCount: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType>({
  isOnline: true,
  pendingCount: 0,
  refreshPendingCount: async () => {},
});

export const useNetwork = () => useContext(NetworkContext);

// Max retries before discarding a mutation
const MAX_RETRIES = 5;

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const isSyncing = useRef(false);
  const syncCallbacksRef = useRef<Array<() => void>>([]);

  // Track pending mutation count
  const refreshPendingCount = useCallback(async () => {
    const count = await getQueueLength();
    setPendingCount(count);
  }, []);

  // Process the offline mutation queue when coming back online
  const processMutationQueue = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    try {
      // Deduplicate first: for each taskId, keep only the latest mutation
      const queue = await deduplicateQueue();

      if (queue.length === 0) {
        isSyncing.current = false;
        return;
      }

      console.log(`[SyncManager] Processing ${queue.length} queued mutations...`);

      for (const mutation of queue) {
        try {
          // Skip mutations that have been retried too many times
          if (mutation.retryCount >= MAX_RETRIES) {
            console.warn(`[SyncManager] Discarding mutation ${mutation.id} after ${MAX_RETRIES} retries`);
            await dequeue(mutation.id);
            continue;
          }

          // Execute the mutation
          switch (mutation.method) {
            case 'POST':
              await api.post(mutation.endpoint, mutation.payload);
              break;
            case 'PATCH':
              await api.patch(mutation.endpoint, mutation.payload);
              break;
            case 'DELETE':
              await api.delete(mutation.endpoint, { data: mutation.payload });
              break;
          }

          // Success — remove from queue
          await dequeue(mutation.id);
          console.log(`[SyncManager] Synced mutation: ${mutation.action} (${mutation.id})`);
        } catch (error: any) {
          const status = error?.response?.status;

          if (status && status >= 400 && status < 500) {
            // Client error (4xx) — discard, the data is invalid
            console.warn(`[SyncManager] Discarding mutation ${mutation.id} due to ${status} error`);
            await dequeue(mutation.id);
          } else {
            // Server error (5xx) or network error — keep in queue for retry
            console.warn(`[SyncManager] Keeping mutation ${mutation.id} for retry (error: ${error.message})`);
            await incrementRetry(mutation.id);
          }
        }
      }

      // After sync, notify any registered callbacks (e.g., task list refresh)
      for (const cb of syncCallbacksRef.current) {
        try {
          cb();
        } catch (e) {
          // ignore callback errors
        }
      }
    } catch (error) {
      console.error('[SyncManager] Queue processing failed:', error);
    } finally {
      await refreshPendingCount();
      isSyncing.current = false;
    }
  }, [refreshPendingCount]);

  // Monitor network state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      setIsOnline((prev) => {
        // Transition from offline → online: process queue
        if (!prev && online) {
          console.log('[NetworkContext] Back online — syncing queued mutations...');
          processMutationQueue();
        }
        return online;
      });
    });

    // Initial check
    NetInfo.fetch().then((state) => {
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);
      if (online) {
        processMutationQueue();
      }
    });

    // Also refresh pending count on start
    refreshPendingCount();

    return () => {
      unsubscribe();
    };
  }, [processMutationQueue, refreshPendingCount]);

  // Also check when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        NetInfo.fetch().then((state) => {
          const online = !!(state.isConnected && state.isInternetReachable !== false);
          setIsOnline(online);
          if (online) {
            processMutationQueue();
          }
        });
        refreshPendingCount();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [processMutationQueue, refreshPendingCount]);

  return (
    <NetworkContext.Provider value={{ isOnline, pendingCount, refreshPendingCount }}>
      {children}
    </NetworkContext.Provider>
  );
}
