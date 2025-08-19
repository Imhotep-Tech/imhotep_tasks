import React from 'react';

const SeeMoreDetails = ({ task, onClose }) => {
  if (!task) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{task.title}</h3>
          <button aria-label="Close" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-500">Description</div>
            <div className="mt-1 text-gray-800">{task.description || 'No description provided.'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <div className={`mt-1 inline-block px-2 py-1 rounded text-sm ${task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {task.completed ? 'Completed' : 'Pending'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Due Date</div>
            <div className="mt-1 text-gray-800">{task.due_date ? new Date(task.due_date).toLocaleString() : 'No due date'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Created</div>
            <div className="mt-1 text-gray-800">{task.created_at ? new Date(task.created_at).toLocaleString() : ''}</div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <button onClick={onClose} className="chef-button-secondary px-3 py-2 rounded">Close</button>
        </div>
      </div>
    </div>
  );
};

export default SeeMoreDetails;