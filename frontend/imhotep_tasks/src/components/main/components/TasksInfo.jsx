import React, { useState } from 'react';

const TasksInfo = ({
  pendingCount,
  completedCount,
  totalTasks,
  // new props
  selectedCount = 0,
  onBulkAction,        // (action, date?) => void
  bulkLoading = false
}) => {
  // local state for dropdown + date
  const [action, setAction] = useState('');
  const [dateValue, setDateValue] = useState('');

  const handleApply = () => {
    if (!action) return;
    if (action === 'update_date' && !dateValue) return;
    onBulkAction && onBulkAction(action, dateValue);
    setAction('');
    setDateValue('');
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-800">{totalTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <p className="text-2xl font-bold text-gray-800">{completedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
              </div>
            </div>
          </div>
        </div>

      {/* Bulk actions section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">
                {selectedCount > 0
                  ? `${selectedCount} task${selectedCount > 1 ? 's' : ''} selected`
                  : 'Select tasks to enable bulk actions'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                disabled={selectedCount === 0 || bulkLoading}
              >
                <option value="">Bulk Action</option>
                <option value="complete_toggle">Toggle Complete</option>
                <option value="delete">Delete</option>
                <option value="update_date">Change Due Date</option>
              </select>
              {action === 'update_date' && (
                <input
                  type="date"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  disabled={bulkLoading}
                />
              )}
              <button
                type="button"
                onClick={handleApply}
                disabled={
                  selectedCount === 0 ||
                  !action ||
                  bulkLoading ||
                  (action === 'update_date' && !dateValue)
                }
                className="bg-indigo-600 disabled:opacity-50 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm shadow transition-colors"
              >
                {bulkLoading ? 'Applying...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TasksInfo;