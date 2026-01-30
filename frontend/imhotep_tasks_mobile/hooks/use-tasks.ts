import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import api from '@/constants/api';
import { Task, TasksResponse, TaskFormData } from '@/components/tasks';
import { isOverdue } from '@/components/tasks';

export type TaskPageType = 'today-tasks' | 'next-week' | 'all';

interface UseTasksOptions {
  pageType: TaskPageType;
  sortOverdueFirst?: boolean;
}

interface UseTasksReturn {
  // Data
  tasks: Task[];
  sortedTasks: Task[];
  page: number;
  numPages: number;
  totalTasks: number;
  completedCount: number;
  pendingCount: number;
  
  // Loading states
  loading: boolean;
  refreshing: boolean;
  formLoading: boolean;
  actionLoading: number | null;
  
  // Modal states
  showFormModal: boolean;
  formMode: 'add' | 'edit';
  editingTask: Task | null;
  detailsTask: Task | null;
  
  // Actions
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
}

const API_ENDPOINTS: Record<TaskPageType, string> = {
  'today-tasks': 'api/tasks/today_tasks/',
  'next-week': 'api/tasks/next_week_tasks/',
  'all': 'api/tasks/all_tasks/',
};

export function useTasks({ pageType, sortOverdueFirst = true }: UseTasksOptions): UseTasksReturn {
  // Data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailsTask, setDetailsTask] = useState<Task | null>(null);

  const url_call = pageType;
  const endpoint = API_ENDPOINTS[pageType];

  // Track initial order - only sort on fetch, not on toggle
  const [initialOrder, setInitialOrder] = useState<number[]>([]);

  // Sort tasks with overdue at the top - only on initial load
  const sortedTasks = useMemo(() => {
    if (!sortOverdueFirst || initialOrder.length === 0) return tasks;
    
    // Maintain the initial order established on fetch
    return [...tasks].sort((a, b) => {
      const aIndex = initialOrder.indexOf(a.id);
      const bIndex = initialOrder.indexOf(b.id);
      
      // If both are in the initial order, maintain that order
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // New tasks (not in initial order) go to the top
      if (aIndex === -1 && bIndex !== -1) return -1;
      if (aIndex !== -1 && bIndex === -1) return 1;
      
      return 0;
    });
  }, [tasks, sortOverdueFirst, initialOrder]);

  // Fetch tasks
  const fetchTasks = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await api.get<TasksResponse>(`${endpoint}?page=${pageNum}`);
      const data = res.data;
      const fetchedTasks = data.user_tasks || [];
      
      // Sort tasks with overdue first on initial fetch
      if (sortOverdueFirst) {
        const sorted = [...fetchedTasks].sort((a, b) => {
          const aOverdue = isOverdue(a.due_date, a.status);
          const bOverdue = isOverdue(b.due_date, b.status);

          // Overdue tasks first
          if (aOverdue && !bOverdue) return -1;
          if (!aOverdue && bOverdue) return 1;

          // Then by completion status (pending first)
          if (!a.status && b.status) return -1;
          if (a.status && !b.status) return 1;

          return 0;
        });
        
        // Store the initial sorted order
        setInitialOrder(sorted.map(t => t.id));
        setTasks(sorted);
      } else {
        setInitialOrder(fetchedTasks.map(t => t.id));
        setTasks(fetchedTasks);
      }
      
      setPage(data.pagination?.page || 1);
      setNumPages(data.pagination?.num_pages || 1);
      setTotalTasks(data.total_number_tasks ?? 0);
      setCompletedCount(data.completed_tasks_count ?? 0);
      setPendingCount(data.pending_tasks ?? 0);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      Alert.alert('Error', 'Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [endpoint, sortOverdueFirst]);

  const onRefresh = useCallback(() => {
    fetchTasks(1, true);
  }, [fetchTasks]);

  const handleLoadMore = useCallback(() => {
    if (page < numPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTasks(nextPage);
    }
  }, [page, numPages, loading, fetchTasks]);

  // Modal handlers
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
        url_call,
      };
      const res = await api.post('api/tasks/add_task/', payload);
      const serverResponse = res.data;
      const created = serverResponse.task ?? serverResponse;

      if (page === 1) {
        setTasks((prev) => [created, ...prev]);
      }

      setTotalTasks((prev) => serverResponse.total_number_tasks ?? prev);
      setCompletedCount((prev) => serverResponse.completed_tasks_count ?? prev);
      setPendingCount((prev) => serverResponse.pending_tasks ?? prev);
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    } finally {
      setFormLoading(false);
    }
  }, [url_call, page]);

  // Update task
  const handleUpdateTask = useCallback(async (taskData: TaskFormData) => {
    if (!editingTask) return;

    setFormLoading(true);
    try {
      const payload = {
        task_title: taskData.task_title,
        task_details: taskData.task_details,
        due_date: taskData.due_date || null,
        url_call,
      };
      const res = await api.patch(`api/tasks/update_task/${editingTask.id}/`, payload);
      const serverResponse = res.data;
      const updated = serverResponse.task ?? { ...editingTask, ...taskData };

      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? updated : t))
      );

      if (serverResponse.total_number_tasks !== undefined) {
        setTotalTasks(serverResponse.total_number_tasks);
      }
      if (serverResponse.completed_tasks_count !== undefined) {
        setCompletedCount(serverResponse.completed_tasks_count);
      }
      if (serverResponse.pending_tasks !== undefined) {
        setPendingCount(serverResponse.pending_tasks);
      }
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    } finally {
      setFormLoading(false);
    }
  }, [editingTask, url_call]);

  // Form submit handler
  const handleFormSubmit = useCallback(async (taskData: TaskFormData) => {
    if (formMode === 'edit') {
      await handleUpdateTask(taskData);
    } else {
      await handleCreateTask(taskData);
    }
  }, [formMode, handleUpdateTask, handleCreateTask]);

  // Toggle complete
  const handleToggleComplete = useCallback(async (task: Task) => {
    setActionLoading(task.id);
    try {
      const res = await api.post(`api/tasks/task_complete/${task.id}/`, {
        url_call,
      });
      const data = res.data;
      const updatedTask = data.task ?? { ...task, status: !task.status };

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updatedTask : t))
      );
      setTotalTasks((prev) => data.total_number_tasks ?? prev);
      setCompletedCount((prev) => data.completed_tasks_count ?? prev);
      setPendingCount((prev) => data.pending_tasks ?? prev);
    } catch (err) {
      console.error('Error completing task:', err);
      Alert.alert('Error', 'Failed to update task.');
    } finally {
      setActionLoading(null);
    }
  }, [url_call]);

  // Delete task
  const handleDeleteTask = useCallback(async (taskId: number) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(taskId);
            try {
              const res = await api.delete(`api/tasks/delete_task/${taskId}/`, {
                data: { url_call },
              });
              const data = res.data;

              setTasks((prev) => prev.filter((t) => t.id !== taskId));
              setTotalTasks((prev) => data.total_number_tasks ?? Math.max(0, prev - 1));
              setCompletedCount((prev) => data.completed_tasks_count ?? prev);
              setPendingCount((prev) => data.pending_tasks ?? Math.max(0, prev - 1));
            } catch (err) {
              console.error('Error deleting task:', err);
              Alert.alert('Error', 'Failed to delete task.');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  }, [url_call]);

  return {
    // Data
    tasks,
    sortedTasks,
    page,
    numPages,
    totalTasks,
    completedCount,
    pendingCount,
    
    // Loading states
    loading,
    refreshing,
    formLoading,
    actionLoading,
    
    // Modal states
    showFormModal,
    formMode,
    editingTask,
    detailsTask,
    
    // Actions
    fetchTasks,
    onRefresh,
    handleLoadMore,
    openAddModal,
    openEditModal,
    closeFormModal,
    setDetailsTask,
    handleFormSubmit,
    handleToggleComplete,
    handleDeleteTask,
  };
}
