import React from 'react';

const DetailsModal = ({ task, onClose }) => {
  if (!task) return null;

  const hasFinance =
    task.transaction_id ||
    task.price != null ||
    task.transaction_status ||
    task.transaction_currency ||
    task.transaction_category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Task Details</h3>
          <button aria-label="Close" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="space-y-2">
          <div>
            <span className="font-medium text-gray-700">Title:</span>
            <span className="ml-2">{task.task_title}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Description:</span>
            <span className="ml-2">{task.task_details || 'No description'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Due Date:</span>
            <span className="ml-2">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <span className="ml-2">{task.status ? 'Completed' : 'Pending'}</span>
          </div>

          {hasFinance && (
            <div className="mt-4 border-t pt-3">
              <p className="text-sm font-semibold text-gray-800 mb-1">Imhotep Finance</p>
              {task.price != null && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Price:</span>{' '}
                  <span>
                    {task.price}{' '}
                    {task.transaction_currency || ''}
                  </span>
                </div>
              )}
              {task.transaction_id && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Transaction ID:</span>{' '}
                  <span>{task.transaction_id}</span>
                </div>
              )}
              {task.transaction_status && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Status:</span>{' '}
                  <span>{task.transaction_status}</span>
                </div>
              )}
              {task.transaction_category && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Category:</span>{' '}
                  <span>{task.transaction_category}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
