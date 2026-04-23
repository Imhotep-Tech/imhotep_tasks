import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'offline_mutation_queue';

export type MutationAction =
  | 'add_task'
  | 'update_task'
  | 'delete_task'
  | 'toggle_complete'
  | 'bulk_delete'
  | 'bulk_complete'
  | 'bulk_update_date'
  | 'bulk_update_category';

export interface QueuedMutation {
  id: string;
  action: MutationAction;
  endpoint: string;
  method: 'POST' | 'PATCH' | 'DELETE';
  payload: any;
  taskId?: number;       // Server-side task ID (for updates/deletes)
  tempId?: string;       // Client-side temp ID (for creates)
  timestamp: string;     // ISO string — when the user performed the action
  retryCount: number;
}

/**
 * Generate a simple unique ID for queue entries.
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get all queued mutations, sorted by timestamp (oldest first).
 */
export async function getQueue(): Promise<QueuedMutation[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const queue: QueuedMutation[] = JSON.parse(raw);
    return queue.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (error) {
    console.warn('[MutationQueue] Failed to read queue:', error);
    return [];
  }
}

/**
 * Save the entire queue back to storage.
 */
async function saveQueue(queue: QueuedMutation[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.warn('[MutationQueue] Failed to save queue:', error);
  }
}

/**
 * Add a mutation to the queue.
 */
export async function enqueue(
  mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>
): Promise<QueuedMutation> {
  const queue = await getQueue();
  const entry: QueuedMutation = {
    ...mutation,
    id: generateId(),
    timestamp: new Date().toISOString(),
    retryCount: 0,
  };
  queue.push(entry);
  await saveQueue(queue);
  return entry;
}

/**
 * Remove a single mutation from the queue by its ID.
 */
export async function dequeue(id: string): Promise<void> {
  const queue = await getQueue();
  const filtered = queue.filter((m) => m.id !== id);
  await saveQueue(filtered);
}

/**
 * Deduplicate the queue: for each taskId, keep only the mutation
 * with the latest timestamp. Mutations without a taskId (e.g., creates)
 * are always kept.
 */
export async function deduplicateQueue(): Promise<QueuedMutation[]> {
  const queue = await getQueue();

  // Separate mutations with and without taskId
  const withoutTaskId: QueuedMutation[] = [];
  const byTaskId = new Map<number, QueuedMutation>();

  for (const mutation of queue) {
    if (!mutation.taskId) {
      withoutTaskId.push(mutation);
    } else {
      const existing = byTaskId.get(mutation.taskId);
      if (!existing || new Date(mutation.timestamp) > new Date(existing.timestamp)) {
        byTaskId.set(mutation.taskId, mutation);
      }
    }
  }

  const deduplicated = [...withoutTaskId, ...byTaskId.values()].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  await saveQueue(deduplicated);
  return deduplicated;
}

/**
 * Get the number of pending mutations in the queue.
 */
export async function getQueueLength(): Promise<number> {
  const queue = await getQueue();
  return queue.length;
}

/**
 * Clear all mutations from the queue. Used on logout.
 */
export async function clearQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
  } catch (error) {
    console.warn('[MutationQueue] Failed to clear queue:', error);
  }
}

/**
 * Increment the retry count for a mutation.
 */
export async function incrementRetry(id: string): Promise<void> {
  const queue = await getQueue();
  const mutation = queue.find((m) => m.id === id);
  if (mutation) {
    mutation.retryCount += 1;
    await saveQueue(queue);
  }
}

/**
 * Check if a toggle_complete mutation for this taskId already exists in the queue.
 * If yes, remove it (they cancel out) and return true.
 * If no, return false (caller should enqueue a new toggle).
 */
export async function cancelToggleIfExists(taskId: number): Promise<boolean> {
  const queue = await getQueue();
  const existingToggle = queue.find(
    (m) => m.action === 'toggle_complete' && m.taskId === taskId
  );

  if (existingToggle) {
    await dequeue(existingToggle.id);
    return true; // Cancelled — no net change
  }

  return false; // No existing toggle found
}
