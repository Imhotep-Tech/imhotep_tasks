import React from 'react';
import { createPortal } from 'react-dom';

const DetailsModal = ({ task, onClose }) => {
  if (!task) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-3xl shadow-2xl p-6 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        
        {/* Glow Ambient Header */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/70 dark:border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Task Details</h3>
          </div>
          
          <button 
            aria-label="Close" 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Title</p>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{task.task_title}</p>
          </div>

          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Description</p>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {task.task_details || 'No additional description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Category</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 capitalize border border-indigo-500/20">
                {task.task_category || 'General'}
              </span>
            </div>

            <div className="p-3 bg-slate-50/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                task.status 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}>
                {task.status ? '✓ Completed' : '⏱ Pending'}
              </span>
            </div>
          </div>

          {task.due_date && (
            <div className="p-3 bg-slate-50/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Due Date</span>
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                {new Date(task.due_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-200/70 dark:border-white/10 flex justify-end">
          <button onClick={onClose} className="glass-button-secondary text-xs px-5 py-2">
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default DetailsModal;


