import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from '../../../config/api';

const PRESET_CATEGORIES = ['general', 'study', 'work', 'personal', 'health', 'finance'];

const UpdateTask = ({ task, onClose, onUpdate, url_call }) => {
  const existingCat = (task?.task_category || 'general').toLowerCase();
  const isPreset = PRESET_CATEGORIES.includes(existingCat);

  const [task_title, setTitle] = useState(task?.task_title || '');
  const [task_description, setDescription] = useState(task?.task_details || '');
  const [due_date, setDueDate] = useState(task?.due_date ? task.due_date.slice(0, 10) : '');
  const [selectedCategory, setSelectedCategory] = useState(isPreset ? existingCat : '__other__');
  const [customCategory, setCustomCategory] = useState(isPreset ? '' : existingCat);
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
      const res = await axios.patch(`api/tasks/update_task/${task.id}/`, payload);
      onUpdate && onUpdate(res.data.task, res.data);
    } catch (err) {
      setError('Failed to update task.');
    } finally {
      setLoading(false);
      onClose && onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        
        {/* Top Glow Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/15 rounded-full blur-2xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/70 dark:border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Update Task Details</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Edit details for this task item</p>
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
              {loading ? 'Saving...' : 'Update Task'}
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};

export default UpdateTask;


