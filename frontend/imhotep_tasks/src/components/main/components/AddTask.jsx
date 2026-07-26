import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../../contexts/AuthContext';
import axios from '../../../config/api';

const AddTask = ({ onClose, onCreate, url_call }) => {
  const { user } = useAuth();

  const [activeTab] = useState('task');
  const [task_title, setTitle] = useState('');
  const [task_description, setDescription] = useState('');
  const [due_date, setDueDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [customCategory, setCustomCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setTitle('');
      setDescription('');
      setDueDate('');
      setSelectedCategory('general');
      setCustomCategory('');
    } catch (err) {
      console.error(err);
      setError('Failed to create task. Please try again.');
    } finally {
      setLoading(false);
      onClose && onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        
        {/* Top Glow Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/70 dark:border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Create New Task</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add details to track your productivity</p>
            </div>
          </div>

          <button 
            aria-label="Close" 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={task_title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input text-sm"
              placeholder="e.g., Finalize product roadmap presentation"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Description / Notes
            </label>
            <textarea
              value={task_description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="glass-input text-sm resize-none"
              placeholder="Add key context, requirements or links..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={due_date}
                onChange={(e) => setDueDate(e.target.value)}
                className="glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="glass-input text-sm"
              >
                <option value="general">📋 General</option>
                <option value="study">📚 Study</option>
                <option value="work">💼 Work</option>
                <option value="personal">🏠 Personal</option>
                <option value="health">💪 Health</option>
                <option value="finance">💰 Finance</option>
                <option value="__other__">🔖 Custom...</option>
              </select>
            </div>
          </div>

          {selectedCategory === '__other__' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Custom Category Name
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="glass-input text-sm"
                placeholder="Enter custom category..."
                required
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200/70 dark:border-white/10">
            <button 
              type="button" 
              onClick={onClose} 
              className="glass-button-secondary text-xs px-4 py-2.5"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="glass-button text-xs px-5 py-2.5"
            >
              {loading ? 'Creating...' : 'Save Task'}
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};

export default AddTask;