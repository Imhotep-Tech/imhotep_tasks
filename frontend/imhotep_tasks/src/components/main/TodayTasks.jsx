import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../config/api';
import Footer from '../common/Footer';
import AddTask from './components/AddTask';
import TasksInfo from './components/TasksInfo';
import TasksData from './components/TasksData';
import SeeMoreDetails from './components/SeeMoreDetails';
import UpdateTask from './components/UpdateTask';

const TodayTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/tasks/today_tasks/');
      // Backend may return an array or an object with tasks/results — normalize to an array
      const payload = res.data;
      let items = [];
      if (Array.isArray(payload)) {
        items = payload;
      } else if (payload) {
        if (Array.isArray(payload.tasks)) items = payload.tasks;
        else if (Array.isArray(payload.results)) items = payload.results;
        else if (Array.isArray(payload.data)) items = payload.data;
        else items = [];
      }

      setTasks(items);
    } catch (err) {
      console.error(err);
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (newTask) => {
    // Optimistic update: prepend task
    setTasks(prev => [newTask, ...prev]);
    setShowAdd(false);
  };

  const handleOpenAdd = () => setShowAdd(true);

  const handleOpenDetails = (task) => {
    setSelectedTask(task);
    setShowDetails(true);
  };

  const handleOpenEdit = (task) => {
    setSelectedTask(task);
    setShowUpdate(true);
  };

  const handleUpdate = (updatedTask) => {
    setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
    setShowUpdate(false);
    setSelectedTask(null);
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/delete_task/${taskId}/`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete task.');
    }
  };

  const handleComplete = async (taskId) => {
    // toggle complete
    try {
      const res = await axios.post(`/api/tasks/task_complete/${taskId}/`);
      const updated = res.data;
      setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error(err);
      setError('Failed to update task status.');
    }
  };

  // compute counts defensively in case tasks is not an array
  const total = Array.isArray(tasks) ? tasks.length : 0;
  const done = Array.isArray(tasks) ? tasks.filter(t => t.completed).length : 0;
  const pending = Array.isArray(tasks) ? tasks.filter(t => !t.completed).length : 0;

  const counts = { total, done, pending };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 bg-chef-pattern">
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Tasks</h1>
            <p className="text-sm text-gray-600">Manage your tasks — create, edit, complete and track progress.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="chef-button bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg shadow"
              onClick={handleOpenAdd}
            >
              + New Task
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TasksInfo counts={counts} />
          </div>

          <div className="lg:col-span-2">
            <div className="chef-card rounded-2xl p-4 shadow-lg border border-white/30 backdrop-blur-2xl bg-white/90">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Your Tasks</h2>
                <div className="text-sm text-gray-500">{counts.total} total</div>
              </div>

              <TasksData
                tasks={tasks}
                loading={loading}
                onComplete={handleComplete}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                onOpenAdd={handleOpenAdd}
                onOpenDetails={handleOpenDetails}
              />

            </div>
          </div>
        </div>
      </div>

      {showAdd && (
        <AddTask
          onClose={() => setShowAdd(false)}
          onCreate={handleCreate}
        />
      )}

      {showUpdate && selectedTask && (
        <UpdateTask
          task={selectedTask}
          onClose={() => setShowUpdate(false)}
          onUpdate={handleUpdate}
        />
      )}

      {showDetails && selectedTask && (
        <SeeMoreDetails
          task={selectedTask}
          onClose={() => setShowDetails(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default TodayTasks;