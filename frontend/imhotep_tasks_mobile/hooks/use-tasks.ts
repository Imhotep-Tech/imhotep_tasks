import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import api from '@/constants/api';
import { Task, TasksResponse, TaskFormData } from '@/components/tasks';
import { isOverdue } from '@/components/tasks';
import { useNetwork } from '@/contexts/NetworkContext';
import { useAuth } from '@/contexts/AuthContext';
import { enqueue, cancelToggleIfExists } from '@/utils/mutation-queue';
import {
  getAllLocalTasks,
  mergeTasksToStore,
  updateLocalTask,
  addLocalTask,
  removeLocalTask,
  removeLocalTasks,
  filterTasksByPageType,
} from '@/utils/local-store';

export type TaskPageType = 'today-tasks' | 'next-week' | 'all';

const MIN_LOADING_TIME = 500;
const withMinDelay = async <T,>(promise: Promise<T>, minMs: number = MIN_LOADING_TIME): Promise<T> => {
  const [result] = await Promise.all([
    promise,
    new Promise(resolve => setTimeout(resolve, minMs)),
  ]);
  return result;
};

interface UseTasksOptions {
  pageType: TaskPageType;
  sortOverdueFirst?: boolean;
}

interface UseTasksReturn {
  tasks: Task[];
  sortedTasks: Task[];
  page: number;
  numPages: number;
  totalTasks: number;
  completedCount: number;
  pendingCount: number;
  selectedIds: number[];
  selectionMode: boolean;
  loading: boolean;
  refreshing: boolean;
  formLoading: boolean;
  actionLoading: number | null;
  bulkLoading: boolean;
  showFormModal: boolean;
  formMode: 'add' | 'edit';
  editingTask: Task | null;
  detailsTask: Task | null;
  fetchTasks: (pageNum?: number, isRefresh?: boolean) => Promise<void>;
  onRefresh: () => void;
  handleLoadMore: () => void;
  openAddModal: () => void;
  openEditModal: (task: Task) => void;
  closeFormModal: () => void;
  setDetailsTask: (task: Task | null) => void;
  handleFormSubmit: (taskData: TaskFormData) => Promise<void>;
  handleToggleComplete: (task: Task) => Promise<void>;
  handleDeleteTask: (taskId: number) => Promise<void>;
  toggleSelect: (id: number) => void;
  selectAll: () => void;
  clearSelection: () => void;
  toggleSelectionMode: () => void;
  handleBulkDelete: () => Promise<void>;
  handleBulkComplete: () => Promise<void>;
  handleBulkUpdateDate: (newDate: string) => Promise<void>;
  handleBulkUpdateCategory: (newCategory: string) => Promise<void>;
}

const API_ENDPOINTS: Record<TaskPageType, string> = {
  'today-tasks': 'api/tasks/today_tasks/',
  'next-week': 'api/tasks/next_week_tasks/',
  'all': 'api/tasks/all_tasks/',
};

export function useTasks({ pageType, sortOverdueFirst = true }: UseTasksOptions): UseTasksReturn {
  const { isOnline, refreshPendingCount } = useNetwork();
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailsTask, setDetailsTask] = useState<Task | null>(null);

  const url_call = pageType;
  const endpoint = API_ENDPOINTS[pageType];
  const userId = user?.id || user?.pk || 'unknown';

  const [initialOrder, setInitialOrder] = useState<number[]>([]);

  const sortedTasks = useMemo(() => {
    if (!sortOverdueFirst || initialOrder.length === 0) return tasks;
    return [...tasks].sort((a, b) => {
      const aIndex = initialOrder.indexOf(a.id);
      const bIndex = initialOrder.indexOf(b.id);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex === -1 && bIndex !== -1) return -1;
      if (aIndex !== -1 && bIndex === -1) return 1;
      return 0;
    });
  }, [tasks, sortOverdueFirst, initialOrder]);

  // Helper to apply fetched tasks to state
  const applyFetchedTasks = useCallback((
    fetchedTasks: Task[],
    data: TasksResponse,
    pageNum: number,
    isRefresh: boolean,
  ) => {
    const shouldAppend = pageType !== 'today-tasks' && pageNum > 1 && !isRefresh;

    const tasksToUse = sortOverdueFirst
      ? [...fetchedTasks].sort((a, b) => {
          const aOverdue = isOverdue(a.due_date, a.status);
          const bOverdue = isOverdue(b.due_date, b.status);
          if (aOverdue && !bOverdue) return -1;
          if (!aOverdue && bOverdue) return 1;
          if (!a.status && b.status) return -1;
          if (a.status && !b.status) return 1;
          return 0;
        })
      : fetchedTasks;

    if (shouldAppend) {
      setTasks((prev) => {
        const seen = new Set(prev.map((t) => t.id));
        const merged = [...prev];
        tasksToUse.forEach((t) => { if (!seen.has(t.id)) merged.push(t); });
        return merged;
      });
      setInitialOrder((prev) => {
        const seen = new Set(prev);
        const next = [...prev];
        tasksToUse.forEach((t) => { if (!seen.has(t.id)) next.push(t.id); });
        return next;
      });
    } else {
      setInitialOrder(tasksToUse.map(t => t.id));
      setTasks(tasksToUse);
    }

    setPage(data.pagination?.page || 1);
    setNumPages(data.pagination?.num_pages || 1);
    setTotalTasks(data.total_number_tasks ?? 0);
    setCompletedCount(data.completed_tasks_count ?? 0);
    setPendingCount(data.pending_tasks ?? 0);
  }, [pageType, sortOverdueFirst]);

  // Load tasks from unified local store, filtered by page type
  const loadFromLocalStore = useCallback(async (): Promise<boolean> => {
    const allTasks = await getAllLocalTasks(userId);
    if (allTasks.length === 0) return false;

    const filtered = filterTasksByPageType(allTasks, pageType);
    const completed = filtered.filter(t => t.status).length;

    setTasks(filtered);
    setInitialOrder(filtered.map(t => t.id));
    setPage(1);
    setNumPages(1);
    setTotalTasks(filtered.length);
    setCompletedCount(completed);
    setPendingCount(filtered.length - completed);
    return true;
  }, [userId, pageType]);

  // Fetch tasks — online-first, offline reads from unified local store
  const fetchTasks = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    if (isOnline) {
      try {
        const url = pageType === 'today-tasks' ? endpoint : `${endpoint}?page=${pageNum}`;
        const res = await api.get<TasksResponse>(url);
        const data = res.data;
        const fetchedTasks = data.user_tasks || [];

        applyFetchedTasks(fetchedTasks, data, pageNum, isRefresh);

        // Merge into unified local store (background)
        mergeTasksToStore(userId, fetchedTasks).catch(() => {});
      } catch (err: any) {
        const isNetworkError = !err?.response;
        if (isNetworkError) {
          const loaded = await loadFromLocalStore();
          if (!loaded) {
            Alert.alert('Error', 'No internet connection and no cached data available.');
          }
        } else {
          console.error('Error fetching tasks:', err);
          Alert.alert('Error', 'Failed to load tasks. Please try again.');
        }
      }
    } else {
      // OFFLINE: load from unified local store
      console.log(`[Tasks] Offline — loading ${pageType} from local store`);
      const loaded = await loadFromLocalStore();
      if (!loaded) {
        console.log('[Tasks] No local data available');
      }
    }

    setLoading(false);
    setRefreshing(false);
  }, [endpoint, pageType, isOnline, userId, applyFetchedTasks, loadFromLocalStore]);

  const onRefresh = useCallback(() => {
    fetchTasks(1, true);
  }, [fetchTasks]);

  const handleLoadMore = useCallback(() => {
    if (pageType === 'today-tasks') return;
    if (page < numPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTasks(nextPage);
    }
  }, [pageType, page, numPages, loading, fetchTasks]);

  const openAddModal = useCallback(() => {
    setFormMode('add');
    setEditingTask(null);
    setShowFormModal(true);
  }, []);

  const openEditModal = useCallback((task: Task) => {
    setFormMode('edit');
    setEditingTask(task);
    setShowFormModal(true);
  }, []);

  const closeFormModal = useCallback(() => {
    setShowFormModal(false);
    setEditingTask(null);
  }, []);

  // Create task
  const handleCreateTask = useCallback(async (taskData: TaskFormData) => {
    setFormLoading(true);
    try {
      const payload = {
        task_title: taskData.task_title,
        task_details: taskData.task_details,
        due_date: taskData.due_date || null,
        task_category: taskData.task_category || 'general',
        url_call,
      };

      if (isOnline) {
        const res = await api.post('api/tasks/add_task/', payload);
        const serverResponse = res.data;
        const created = serverResponse.task ?? serverResponse;

        if (page === 1) setTasks((prev) => [created, ...prev]);
        setTotalTasks((prev) => serverResponse.total_number_tasks ?? prev);
        setCompletedCount((prev) => serverResponse.completed_tasks_count ?? prev);
        setPendingCount((prev) => serverResponse.pending_tasks ?? prev);

        // Add to local store
        addLocalTask(userId, created).catch(() => {});
      } else {
        await enqueue({
          action: 'add_task',
          endpoint: 'api/tasks/add_task/',
          method: 'POST',
          payload,
        });
        await refreshPendingCount();

        const tempTask: Task = {
          id: -(Date.now()),
          task_title: taskData.task_title,
          task_details: taskData.task_details,
          due_date: taskData.due_date || undefined,
          task_category: taskData.task_category || 'general',
          status: false,
        };

        // Add to local store + in-memory state
        await addLocalTask(userId, tempTask);
        if (page === 1) setTasks((prev) => [tempTask, ...prev]);
        setTotalTasks((prev) => prev + 1);
        setPendingCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    } finally {
      setFormLoading(false);
    }
  }, [url_call, page, isOnline, userId, refreshPendingCount]);

  // Update task
  const handleUpdateTask = useCallback(async (taskData: TaskFormData) => {
    if (!editingTask) return;
    setFormLoading(true);
    try {
      const payload = {
        task_title: taskData.task_title,
        task_details: taskData.task_details,
        due_date: taskData.due_date || null,
        task_category: taskData.task_category || 'general',
        url_call,
      };

      if (isOnline) {
        const res = await api.patch(`api/tasks/update_task/${editingTask.id}/`, payload);
        const serverResponse = res.data;
        const updated = serverResponse.task ?? { ...editingTask, ...taskData };

        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
        if (serverResponse.total_number_tasks !== undefined) setTotalTasks(serverResponse.total_number_tasks);
        if (serverResponse.completed_tasks_count !== undefined) setCompletedCount(serverResponse.completed_tasks_count);
        if (serverResponse.pending_tasks !== undefined) setPendingCount(serverResponse.pending_tasks);

        // Update local store
        updateLocalTask(userId, editingTask.id, updated).catch(() => {});
      } else {
        await enqueue({
          action: 'update_task',
          endpoint: `api/tasks/update_task/${editingTask.id}/`,
          method: 'PATCH',
          payload,
          taskId: editingTask.id,
        });
        await refreshPendingCount();

        const optimistic = { ...editingTask, ...taskData };
        await updateLocalTask(userId, editingTask.id, optimistic);
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? optimistic : t)));
      }
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    } finally {
      setFormLoading(false);
    }
  }, [editingTask, url_call, isOnline, userId, refreshPendingCount]);

  const handleFormSubmit = useCallback(async (taskData: TaskFormData) => {
    if (formMode === 'edit') {
      await handleUpdateTask(taskData);
    } else {
      await handleCreateTask(taskData);
    }
  }, [formMode, handleUpdateTask, handleCreateTask]);

  // Toggle complete — with offline cancellation
  const handleToggleComplete = useCallback(async (task: Task) => {
    setActionLoading(task.id);
    try {
      if (isOnline) {
        const res = await withMinDelay(
          api.post(`api/tasks/task_complete/${task.id}/`, { url_call })
        );
        const data = res.data;
        const updatedTask = data.task ?? { ...task, status: !task.status };

        setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
        setTotalTasks((prev) => data.total_number_tasks ?? prev);
        setCompletedCount((prev) => data.completed_tasks_count ?? prev);
        setPendingCount((prev) => data.pending_tasks ?? prev);

        // Update local store
        updateLocalTask(userId, task.id, updatedTask).catch(() => {});
      } else {
        // Check if toggling cancels an existing queued toggle
        const cancelled = await cancelToggleIfExists(task.id);
        if (!cancelled) {
          // No existing toggle — enqueue a new one
          await enqueue({
            action: 'toggle_complete',
            endpoint: `api/tasks/task_complete/${task.id}/`,
            method: 'POST',
            payload: { url_call },
            taskId: task.id,
          });
        }
        await refreshPendingCount();

        // Always update local store + in-memory state
        const newStatus = !task.status;
        await updateLocalTask(userId, task.id, { status: newStatus });
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));

        if (newStatus) {
          setCompletedCount((prev) => prev + 1);
          setPendingCount((prev) => Math.max(0, prev - 1));
        } else {
          setCompletedCount((prev) => Math.max(0, prev - 1));
          setPendingCount((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.error('Error completing task:', err);
      Alert.alert('Error', 'Failed to update task.');
    } finally {
      setActionLoading(null);
    }
  }, [url_call, isOnline, userId, refreshPendingCount]);

  // Delete task
  const handleDeleteTask = useCallback(async (taskId: number) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(taskId);
          try {
            if (isOnline) {
              const res = await api.delete(`api/tasks/delete_task/${taskId}/`, { data: { url_call } });
              const data = res.data;
              setTasks((prev) => prev.filter((t) => t.id !== taskId));
              setTotalTasks((prev) => data.total_number_tasks ?? Math.max(0, prev - 1));
              setCompletedCount((prev) => data.completed_tasks_count ?? prev);
              setPendingCount((prev) => data.pending_tasks ?? Math.max(0, prev - 1));
              removeLocalTask(userId, taskId).catch(() => {});
            } else {
              await enqueue({
                action: 'delete_task',
                endpoint: `api/tasks/delete_task/${taskId}/`,
                method: 'DELETE',
                payload: { url_call },
                taskId,
              });
              await refreshPendingCount();

              const deletedTask = tasks.find(t => t.id === taskId);
              await removeLocalTask(userId, taskId);
              setTasks((prev) => prev.filter((t) => t.id !== taskId));
              setTotalTasks((prev) => Math.max(0, prev - 1));
              if (deletedTask?.status) {
                setCompletedCount((prev) => Math.max(0, prev - 1));
              } else {
                setPendingCount((prev) => Math.max(0, prev - 1));
              }
            }
          } catch (err) {
            console.error('Error deleting task:', err);
            Alert.alert('Error', 'Failed to delete task.');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  }, [url_call, isOnline, tasks, userId, refreshPendingCount]);

  // Selection handlers
  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(selectedIds.length === tasks.length ? [] : tasks.map(t => t.id));
  }, [tasks, selectedIds.length]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setSelectionMode(false);
  }, []);

  const toggleSelectionMode = useCallback(() => {
    if (selectionMode) setSelectedIds([]);
    setSelectionMode(prev => !prev);
  }, [selectionMode]);

  // Bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    Alert.alert(
      'Delete Tasks',
      `Are you sure you want to delete ${selectedIds.length} task${selectedIds.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBulkLoading(true);
            try {
              if (isOnline) {
                await api.delete('api/tasks/multiple_delete_task/', {
                  data: { task_ids: selectedIds, url_call }
                });
                await fetchTasks(page);
                removeLocalTasks(userId, selectedIds).catch(() => {});
              } else {
                await enqueue({
                  action: 'bulk_delete',
                  endpoint: 'api/tasks/multiple_delete_task/',
                  method: 'DELETE',
                  payload: { task_ids: selectedIds, url_call },
                });
                await refreshPendingCount();
                await removeLocalTasks(userId, selectedIds);
                setTasks((prev) => prev.filter((t) => !selectedIds.includes(t.id)));
                setTotalTasks((prev) => Math.max(0, prev - selectedIds.length));
              }
              clearSelection();
            } catch (err) {
              console.error('Error bulk deleting tasks:', err);
              Alert.alert('Error', 'Failed to delete tasks.');
            } finally {
              setBulkLoading(false);
            }
          },
        },
      ]
    );
  }, [selectedIds, url_call, page, fetchTasks, clearSelection, isOnline, userId, refreshPendingCount]);

  // Bulk complete
  const handleBulkComplete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      if (isOnline) {
        await api.post('api/tasks/multiple_task_complete/', { task_ids: selectedIds, url_call });
        await fetchTasks(page);
      } else {
        await enqueue({
          action: 'bulk_complete',
          endpoint: 'api/tasks/multiple_task_complete/',
          method: 'POST',
          payload: { task_ids: selectedIds, url_call },
        });
        await refreshPendingCount();

        // Update local store for each selected task
        const allLocal = await getAllLocalTasks(userId);
        for (const id of selectedIds) {
          const task = allLocal.find(t => t.id === id);
          if (task) await updateLocalTask(userId, id, { status: !task.status });
        }
        setTasks((prev) =>
          prev.map((t) => selectedIds.includes(t.id) ? { ...t, status: !t.status } : t)
        );
      }
      clearSelection();
    } catch (err) {
      console.error('Error bulk completing tasks:', err);
      Alert.alert('Error', 'Failed to update tasks.');
    } finally {
      setBulkLoading(false);
    }
  }, [selectedIds, url_call, page, fetchTasks, clearSelection, isOnline, userId, refreshPendingCount]);

  // Bulk update date
  const handleBulkUpdateDate = useCallback(async (newDate: string) => {
    if (selectedIds.length === 0 || !newDate) return;
    setBulkLoading(true);
    try {
      if (isOnline) {
        await api.patch('api/tasks/multiple_update_task_dates/', {
          task_ids: selectedIds, due_date: newDate, url_call
        });
        await fetchTasks(page);
      } else {
        await enqueue({
          action: 'bulk_update_date',
          endpoint: 'api/tasks/multiple_update_task_dates/',
          method: 'PATCH',
          payload: { task_ids: selectedIds, due_date: newDate, url_call },
        });
        await refreshPendingCount();
        for (const id of selectedIds) {
          await updateLocalTask(userId, id, { due_date: newDate });
        }
        setTasks((prev) =>
          prev.map((t) => selectedIds.includes(t.id) ? { ...t, due_date: newDate } : t)
        );
      }
      clearSelection();
    } catch (err) {
      console.error('Error bulk updating dates:', err);
      Alert.alert('Error', 'Failed to update task dates.');
    } finally {
      setBulkLoading(false);
    }
  }, [selectedIds, url_call, page, fetchTasks, clearSelection, isOnline, userId, refreshPendingCount]);

  // Bulk update category
  const handleBulkUpdateCategory = useCallback(async (newCategory: string) => {
    const category = (newCategory || '').trim().toLowerCase();
    if (selectedIds.length === 0 || !category) return;
    setBulkLoading(true);
    try {
      if (isOnline) {
        await api.patch('api/tasks/multiple_update_task_category/', {
          task_ids: selectedIds, task_category: category, url_call
        });
        await fetchTasks(page);
      } else {
        await enqueue({
          action: 'bulk_update_category',
          endpoint: 'api/tasks/multiple_update_task_category/',
          method: 'PATCH',
          payload: { task_ids: selectedIds, task_category: category, url_call },
        });
        await refreshPendingCount();
        for (const id of selectedIds) {
          await updateLocalTask(userId, id, { task_category: category });
        }
        setTasks((prev) =>
          prev.map((t) => selectedIds.includes(t.id) ? { ...t, task_category: category } : t)
        );
      }
      clearSelection();
    } catch (err) {
      console.error('Error bulk updating category:', err);
      Alert.alert('Error', 'Failed to update task category.');
    } finally {
      setBulkLoading(false);
    }
  }, [selectedIds, url_call, page, fetchTasks, clearSelection, isOnline, userId, refreshPendingCount]);

  return {
    tasks, sortedTasks, page, numPages, totalTasks, completedCount, pendingCount,
    selectedIds, selectionMode,
    loading, refreshing, formLoading, actionLoading, bulkLoading,
    showFormModal, formMode, editingTask, detailsTask,
    fetchTasks, onRefresh, handleLoadMore,
    openAddModal, openEditModal, closeFormModal, setDetailsTask,
    handleFormSubmit, handleToggleComplete, handleDeleteTask,
    toggleSelect, selectAll, clearSelection, toggleSelectionMode,
    handleBulkDelete, handleBulkComplete, handleBulkUpdateDate, handleBulkUpdateCategory,
  };
}
