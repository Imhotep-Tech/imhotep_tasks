import React, { useState } from 'react';

const TasksInfo = ({
  pendingCount = 0,
  completedCount = 0,
  totalTasks = 0,
  selectedCount = 0,
  onBulkAction,
  bulkLoading = false
}) => {
  const [action, setAction] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [customCategory, setCustomCategory] = useState('');

  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const targetCategoryValue = selectedCategory === '__other__' ? customCategory.trim().toLowerCase() : selectedCategory;

  const handleApply = () => {
    if (!action) return;
    if (action === 'update_date' && !dateValue) return;
    if (action === 'update_category' && !targetCategoryValue) return;
    const value = action === 'update_date' ? dateValue : action === 'update_category' ? targetCategoryValue : '';
    onBulkAction && onBulkAction(action, value);
    setAction('');
    setDateValue('');
    setSelectedCategory('general');
    setCustomCategory('');
  };

  return (
    <>
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        
        {/* Total Tasks Card */}
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Tasks
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {totalTasks}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Completed Tasks Card */}
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Completed
              </p>
              <div className="flex items-baseline space-x-2 mt-1">
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {completedCount}
                </h3>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  ({completionPercentage}%)
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Pending Tasks Card */}
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pending
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {pendingCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${totalTasks > 0 ? (pendingCount / totalTasks) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Bulk Action Controls */}
      <div className="mb-6">
        <div className="glass-panel rounded-2xl p-4 border border-slate-200/70 dark:border-white/10 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            <div className="flex items-center space-x-2">
              <div className={`w-2.5 h-2.5 rounded-full ${selectedCount > 0 ? 'bg-indigo-500 animate-ping' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {selectedCount > 0
                  ? `${selectedCount} task${selectedCount > 1 ? 's' : ''} selected for bulk editing`
                  : 'Select checkboxes to enable bulk actions'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="glass-input text-xs py-2 px-3 focus:ring-1"
                disabled={selectedCount === 0 || bulkLoading}
              >
                <option value="">Choose Action...</option>
                <option value="complete_toggle">Toggle Complete</option>
                <option value="delete">Delete Selected</option>
                <option value="update_date">Set Due Date</option>
                <option value="update_category">Set Category</option>
              </select>

              {action === 'update_date' && (
                <input
                  type="date"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  className="glass-input text-xs py-2 px-3"
                  disabled={bulkLoading}
                />
              )}

              {action === 'update_category' && (
                <>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="glass-input text-xs py-2 px-3"
                    disabled={bulkLoading}
                  >
                    <option value="general">📋 General</option>
                    <option value="study">📚 Study</option>
                    <option value="work">💼 Work</option>
                    <option value="personal">🏠 Personal</option>
                    <option value="health">💪 Health</option>
                    <option value="finance">💰 Finance</option>
                    <option value="__other__">🔖 Custom...</option>
                  </select>

                  {selectedCategory === '__other__' && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter custom category..."
                      className="glass-input text-xs py-2 px-3"
                      disabled={bulkLoading}
                    />
                  )}
                </>
              )}

              <button
                type="button"
                onClick={handleApply}
                disabled={
                  selectedCount === 0 ||
                  !action ||
                  bulkLoading ||
                  (action === 'update_date' && !dateValue) ||
                  (action === 'update_category' && !targetCategoryValue)
                }
                className="glass-button text-xs py-2 px-4 whitespace-nowrap"
              >
                {bulkLoading ? 'Applying...' : 'Apply Action'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default TasksInfo;