import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../config/api';
import Footer from '../common/Footer';
import AddTask from './components/AddTask';
import TasksInfo from './components/TasksInfo';
import TasksData from './components/TasksData';

const TodayTasks = () => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const url_call = "today-tasks";

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('api/tasks/today_tasks/');
      const data = res.data;
      setTasks(data.user_tasks || []);
      setTotalTasks(data.total_number_tasks ?? 0);
      setCompletedCount(data.completed_tasks_count ?? 0);
      setPendingCount(data.pending_tasks ?? 0);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = (serverResponse) => {
    const created = serverResponse.task ?? serverResponse;
    setTasks((prev) => [created, ...prev]);
    setTotalTasks((prev) => (serverResponse.total_number_tasks ?? prev));
    setCompletedCount((prev) => (serverResponse.completed_tasks_count ?? prev));
    setPendingCount((prev) => (serverResponse.pending_tasks ?? prev));
  };

  const clearSelection = () => setSelectedIds([]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = (alreadyAll) => {
    if (alreadyAll) setSelectedIds([]);
    else setSelectedIds(tasks.map(t => t.id));
  };

  const handleBulkAction = async (action, value) => {
    if (selectedIds.length === 0) return;
    try {
      setBulkLoading(true);
      if (action === 'delete') {
        await axios.delete('api/tasks/multiple_delete_task/', {
          data: { task_ids: selectedIds, url_call }
        });
      } else if (action === 'complete_toggle') {
        await axios.post('api/tasks/multiple_task_complete/', {
          task_ids: selectedIds, url_call
        });
      } else if (action === 'update_date') {
        await axios.patch('api/tasks/multiple_update_task_dates/', {
          task_ids: selectedIds,
          due_date: value,
          url_call
        });
      } else if (action === 'update_category') {
        await axios.patch('api/tasks/multiple_update_task_category/', {
          task_ids: selectedIds,
          task_category: value,
          url_call
        });
      }
      await fetchTasks();
      clearSelection();
    } catch (e) {
      console.error(e);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleComplete = (updatedTask, counts) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setTotalTasks(counts.total_number_tasks ?? totalTasks);
    setCompletedCount(counts.completed_tasks_count ?? completedCount);
    setPendingCount(counts.pending_tasks ?? pendingCount);
    clearSelection();
  };

  const handleDelete = (deletedId, counts) => {
    setTasks((prev) => prev.filter((t) => t.id !== deletedId));
    setTotalTasks(counts.total_number_tasks ?? Math.max(0, totalTasks - 1));
    setCompletedCount(counts.completed_tasks_count ?? completedCount);
    setPendingCount(counts.pending_tasks ?? Math.max(0, pendingCount - 1));
    clearSelection();
  };

  const handleUpdate = () => {
    fetchTasks();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-slate-50 dark:bg-[#080C14]">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl relative z-10">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Today's Overview
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
              Welcome back, {user?.first_name || user?.username || 'Productive Hero'} 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Here is your daily task breakdown and progress status.
            </p>
          </div>

          <div>
            <button
              onClick={() => setShowAdd(true)}
              className="glass-button flex items-center shadow-indigo-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <TasksInfo
          pendingCount={pendingCount}
          completedCount={completedCount}
          totalTasks={totalTasks}
          selectedCount={selectedIds.length}
          onBulkAction={handleBulkAction}
          bulkLoading={bulkLoading}
        />

        {/* Main Task List Glass Panel */}
        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-slate-200/70 dark:border-white/10">
          <div className="px-6 py-4 bg-slate-100/70 dark:bg-slate-900/80 border-b border-slate-200/70 dark:border-white/10 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              Today's Schedule
            </h2>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          <TasksData
            tasks={tasks}
            loading={loading}
            url_call={url_call}
            onCompleteTask={handleComplete}
            onDeleteTask={handleDelete}
            onUpdateTask={handleUpdate}
            onOpenAdd={() => setShowAdd(true)}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onSelectAll={selectAll}
            consolidateDone
          />
        </div>

        {showAdd && <AddTask onClose={() => setShowAdd(false)} onCreate={handleCreate} url_call="today-tasks" />}

      </div>

      <Footer />
    </div>
  );
};

export default TodayTasks;