import React from 'react';

const TasksInfo = ({ counts = { total: 0, done: 0, pending: 0 } }) => {
  const percent = counts.total ? Math.round((counts.done / counts.total) * 100) : 0;

  return (
    <div className="chef-card rounded-2xl p-4 shadow-lg border border-white/30 backdrop-blur-2xl bg-white/90">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Overview</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Total</div>
          <div className="font-medium text-gray-800">{counts.total}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="font-medium text-gray-800">{counts.done}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="font-medium text-gray-800">{counts.pending}</div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${percent}%` }} />
        </div>
        <div className="text-xs text-gray-500">{percent}% complete</div>
      </div>
    </div>
  );
};

export default TasksInfo;