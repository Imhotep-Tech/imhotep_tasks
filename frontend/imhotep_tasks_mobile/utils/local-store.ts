import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '@/components/tasks';

const TASKS_KEY_PREFIX = 'local_tasks:';

function getTasksKey(userId: string | number): string {
  return `${TASKS_KEY_PREFIX}${userId}`;
}

/**
 * Get all locally stored tasks for a user.
 */
export async function getAllLocalTasks(userId: string | number): Promise<Task[]> {
  try {
    const raw = await AsyncStorage.getItem(getTasksKey(userId));
    if (!raw) return [];
    const taskMap: Record<number, Task> = JSON.parse(raw);
    return Object.values(taskMap);
  } catch (error) {
    console.warn('[LocalStore] Failed to read tasks:', error);
    return [];
  }
}

/**
 * Merge tasks from an API response into the local store.
 * Existing tasks with matching IDs are updated; new tasks are added.
 */
export async function mergeTasksToStore(userId: string | number, tasks: Task[]): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(getTasksKey(userId));
    const taskMap: Record<number, Task> = raw ? JSON.parse(raw) : {};
    for (const task of tasks) {
      taskMap[task.id] = task;
    }
    await AsyncStorage.setItem(getTasksKey(userId), JSON.stringify(taskMap));
  } catch (error) {
    console.warn('[LocalStore] Failed to merge tasks:', error);
  }
}

/**
 * Replace ALL tasks in the local store (used after full sync).
 */
export async function setAllLocalTasks(userId: string | number, tasks: Task[]): Promise<void> {
  try {
    const taskMap: Record<number, Task> = {};
    for (const task of tasks) {
      taskMap[task.id] = task;
    }
    await AsyncStorage.setItem(getTasksKey(userId), JSON.stringify(taskMap));
  } catch (error) {
    console.warn('[LocalStore] Failed to set tasks:', error);
  }
}

/**
 * Update a single task in the local store.
 */
export async function updateLocalTask(userId: string | number, taskId: number, updates: Partial<Task>): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(getTasksKey(userId));
    const taskMap: Record<number, Task> = raw ? JSON.parse(raw) : {};
    if (taskMap[taskId]) {
      taskMap[taskId] = { ...taskMap[taskId], ...updates };
      await AsyncStorage.setItem(getTasksKey(userId), JSON.stringify(taskMap));
    }
  } catch (error) {
    console.warn('[LocalStore] Failed to update task:', error);
  }
}

/**
 * Add a single task to the local store.
 */
export async function addLocalTask(userId: string | number, task: Task): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(getTasksKey(userId));
    const taskMap: Record<number, Task> = raw ? JSON.parse(raw) : {};
    taskMap[task.id] = task;
    await AsyncStorage.setItem(getTasksKey(userId), JSON.stringify(taskMap));
  } catch (error) {
    console.warn('[LocalStore] Failed to add task:', error);
  }
}

/**
 * Remove a task from the local store.
 */
export async function removeLocalTask(userId: string | number, taskId: number): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(getTasksKey(userId));
    const taskMap: Record<number, Task> = raw ? JSON.parse(raw) : {};
    delete taskMap[taskId];
    await AsyncStorage.setItem(getTasksKey(userId), JSON.stringify(taskMap));
  } catch (error) {
    console.warn('[LocalStore] Failed to remove task:', error);
  }
}

/**
 * Remove multiple tasks from the local store.
 */
export async function removeLocalTasks(userId: string | number, taskIds: number[]): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(getTasksKey(userId));
    const taskMap: Record<number, Task> = raw ? JSON.parse(raw) : {};
    for (const id of taskIds) {
      delete taskMap[id];
    }
    await AsyncStorage.setItem(getTasksKey(userId), JSON.stringify(taskMap));
  } catch (error) {
    console.warn('[LocalStore] Failed to remove tasks:', error);
  }
}

/**
 * Clear the entire local store. Used on logout.
 */
export async function clearAllLocalStores(): Promise<void> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const storeKeys = allKeys.filter((k) => k.startsWith(TASKS_KEY_PREFIX));
    if (storeKeys.length > 0) {
      await AsyncStorage.multiRemove(storeKeys);
    }
  } catch (error) {
    console.warn('[LocalStore] Failed to clear stores:', error);
  }
}

/**
 * Filter tasks by page type from the local store.
 */
export function filterTasksByPageType(tasks: Task[], pageType: 'today-tasks' | 'next-week' | 'all'): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  switch (pageType) {
    case 'today-tasks': {
      return tasks.filter(task => {
        if (!task.due_date) return false;
        const dueDate = task.due_date.split('T')[0];
        // Today's tasks OR overdue incomplete tasks
        return dueDate === todayStr || (dueDate < todayStr && !task.status);
      }).sort((a, b) => {
        if (a.status !== b.status) return a.status ? 1 : -1;
        return (a.due_date || '').localeCompare(b.due_date || '');
      });
    }

    case 'next-week': {
      const weekLater = new Date(today);
      weekLater.setDate(weekLater.getDate() + 7);
      const weekLaterStr = weekLater.toISOString().split('T')[0];

      return tasks.filter(task => {
        if (!task.due_date) return false;
        const dueDate = task.due_date.split('T')[0];
        return dueDate >= todayStr && dueDate <= weekLaterStr;
      }).sort((a, b) => {
        if (a.status !== b.status) return a.status ? 1 : -1;
        return (a.due_date || '').localeCompare(b.due_date || '');
      });
    }

    case 'all': {
      return [...tasks].sort((a, b) => {
        if (a.status !== b.status) return a.status ? 1 : -1;
        return (a.due_date || '').localeCompare(b.due_date || '');
      });
    }

    default:
      return tasks;
  }
}
