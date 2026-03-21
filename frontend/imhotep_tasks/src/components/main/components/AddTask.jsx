import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from '../../../config/api';

const AddTask = ({ onClose, onCreate, url_call }) => {
  const { user } = useAuth();

  const PRESET_CATEGORIES = ['general', 'study', 'work', 'personal', 'health', 'finance'];

  const [activeTab, setActiveTab] = useState('task');
  const [task_title, setTitle] = useState('');
  const [task_description, setDescription] = useState('');
  const [due_date, setDueDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [customCategory, setCustomCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Resolve the final category value
  const task_category = selectedCategory === '__other__' ? customCategory.trim().toLowerCase() : selectedCategory;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { 
        task_title, 
        task_details: task_description, 
        due_date, 
        task_category,
        url_call,
      };
      const res = await axios.post('api/tasks/add_task/', payload);
      onCreate && onCreate(res.data);
      // reset fields
      setTitle('');
      setDescription('');
      setDueDate('');
      setSelectedCategory('general');
      setCustomCategory('');
    } catch (err) {
      console.error(err);
      setError('Failed to create task.');
    } finally {
      setLoading(false);
      onClose && onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add New Task</h3>
          <button aria-label="Close" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Task Details Tab */}
          {activeTab === 'task' && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={task_title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="e.g. Write project proposal"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Brief / Description</label>
                <textarea
                  value={task_description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Optional details to help you remember"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Due date</label>
                <input
                  type="date"
                  value={due_date}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                >
                  <option value="general">General</option>
                  <option value="study">Study</option>
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="health">Health</option>
                  <option value="finance">Finance</option>
                  <option value="__other__">Other (custom)</option>
                </select>
                {selectedCategory === '__other__' && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="mt-2 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Enter custom category"
                    required
                  />
                )}
              </div>
            </>
          )}

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="chef-button-secondary px-3 py-2 rounded">Cancel</button>
            <button type="submit" disabled={loading} className="chef-button bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded">
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTask;