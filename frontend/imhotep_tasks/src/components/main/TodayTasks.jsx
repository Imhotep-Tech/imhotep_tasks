import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../config/api';
import Footer from '../common/Footer';
import AddTask from './components/AddTask';
import TasksInfo from './components/TasksInfo';
import TasksData from './components/TasksData';

const TodayTasks = () => {
  const { user } = useAuth();

  // state
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');

  // fetch tasks
  const fetchTasks = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`api/tasks/today_tasks/?page=${pageNum}`);
      const data = res.data;
      setTasks(data.user_tasks || []);
      setPage(data.pagination?.page || 1);
      setNumPages(data.pagination?.num_pages || 1);
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
    fetchTasks(page);
  }, []);

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > numPages) return;
    fetchTasks(newPage);
  };

  const handleCreate = (serverResponse) => {
    const created = serverResponse.task ?? serverResponse;
    if (page === 1) {
      setTasks((prev) => [created, ...prev]);
    }
    // update counts
    setTotalTasks((prev) => (serverResponse.total_number_tasks ?? prev));
    setCompletedCount((prev) => (serverResponse.completed_tasks_count ?? prev));
    setPendingCount((prev) => (serverResponse.pending_tasks ?? prev));
  };

  // Only update state, API calls are handled in button components
  const handleComplete = (updatedTask, counts) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setTotalTasks(counts.total_number_tasks ?? totalTasks);
    setCompletedCount(counts.completed_tasks_count ?? completedCount);
    setPendingCount(counts.pending_tasks ?? pendingCount);
  };

  const handleDelete = (deletedId, counts) => {
    setTasks((prev) => prev.filter((t) => t.id !== deletedId));
    setTotalTasks(counts.total_number_tasks ?? Math.max(0, totalTasks - 1));
    setCompletedCount(counts.completed_tasks_count ?? completedCount);
    setPendingCount(counts.pending_tasks ?? Math.max(0, pendingCount - 1));
  };

  // Add this handler for update
  const handleUpdate = () => {
    fetchTasks(page);
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString();
    } catch {
      return iso;
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Today's Tasks</h1>
            <p className="text-gray-600 mt-1">Hello, {user?.username || 'User'}!</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowAdd(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow-md transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Task
            </button>
          </div>
        </div>

        <TasksInfo pendingCount={pendingCount} completedCount={completedCount} totalTasks={totalTasks}/>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Today's Tasks</h2>
          </div>

          <TasksData
            tasks={tasks}
            loading={loading}
            onEdit={(task) => window.location.href = `/tasks/update_task/${task.id}/`}
            onOpenAdd={() => setShowAdd(true)}
            onOpenDetails={() => {}}
            url_call="today-tasks"
            onCompleteTask={handleComplete}
            onDeleteTask={handleDelete}
            onUpdateTask={handleUpdate}
          />

        </div>

        {/* Pagination */}
        {numPages > 1 && (
          <div className="px-4 py-5 bg-gray-50 border-t border-gray-200">
            <nav className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button onClick={() => changePage(page - 1)} disabled={page <= 1} className="px-3 py-2 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50">
                  Previous
                </button>

                <span className="text-sm text-gray-700">Page {page} of {numPages}</span>

                <button onClick={() => changePage(page + 1)} disabled={page >= numPages} className="px-3 py-2 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50">
                  Next
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Showing page {page} — {totalTasks} tasks
              </p>
            </nav>
          </div>
        )}

        {showAdd && <AddTask onClose={() => setShowAdd(false)} onCreate={handleCreate} url_call="today-tasks" />}

      </div>
      <Footer />
    </>
  );
};

export default TodayTasks;