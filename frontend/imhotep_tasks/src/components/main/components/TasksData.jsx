import React, { useState, useMemo } from "react";
import TaskCompleteButton from './TaskCompleteButton';
import TaskDeleteButton from './TaskDeleteButton';
import UpdateTask from './UpdateTask';
import DetailsModal from './DetailsModal';
import DateComponent from "./DateComponent";

const TaskRow = ({
  task,
  url_call,
  onCompleteTask,
  onDeleteTask,
  onOpenDetails,
  onOpenUpdate,
  isSelected,
  onToggleSelect
}) => {
  return (
    <li
      key={task.id}
      className={`p-4 hover:bg-gray-50 transition-all ${task.status ? "bg-gray-50" : ""} flex items-center`}
    >
      {/* Unified row for checkbox + complete toggle + title */}
      <div className="flex items-center flex-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(task.id)}
          className="h-5 w-5 mr-3 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 align-middle"
        />
        <TaskCompleteButton
          task={task}
          url_call={url_call}
          onCompleteTask={onCompleteTask}
        />
        <div>
          <p
            onClick={() => onOpenDetails(task)}
            className={`font-medium text-gray-800 cursor-pointer hover:underline ${
              task.status ? "line-through text-gray-500" : ""
            }`}
          >
            {task.task_title}
          </p>
          {task.transaction_id && (
            <div className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 border border-emerald-100">
              <span className="mr-1">
                {task.transaction_status || 'Transaction'}
              </span>
              {task.price != null && (
                <span>
                  · {task.price} {task.transaction_currency || ''}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Right side (date + actions) */}
      <div className="flex items-center">
        <DateComponent task={task} />
        <div className="flex space-x-2">
            <button
              onClick={() => onOpenUpdate(task)}
              className="p-1.5 text-blue-500 hover:bg-blue-100 rounded transition-colors"
              title="Edit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <TaskDeleteButton
              taskId={task.id}
              url_call={url_call}
              onDeleteTask={onDeleteTask}
            />
        </div>
      </div>
    </li>
  );
};

const TasksData = ({
  tasks = [],
  loading,
  url_call,
  onCompleteTask,
  onDeleteTask,
  onOpenAdd,
  onUpdateTask,
  // new props
  selectedIds = [],
  onToggleSelect,
  onSelectAll
}) => {
  const [detailsTask, setDetailsTask] = useState(null);
  const [updateTask, setUpdateTask] = useState(null);

  const allSelected = useMemo(
    () => tasks.length > 0 && selectedIds.length === tasks.length,
    [tasks, selectedIds]
  );

  const handleUpdate = () => {
    setUpdateTask(null);
    if (onUpdateTask) onUpdateTask();
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex rounded-full bg-yellow-100 p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No tasks for today
        </h3>
        <p className="mt-2 text-gray-500">
          You don't have any tasks scheduled for today. Enjoy your free time or
          create a new task!
        </p>
        <button
          onClick={onOpenAdd}
          className="mt-4 inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {/* Plus icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Create New Task
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Select All Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectAll(allSelected)}
            className="text-xs bg-white border px-3 py-1.5 rounded shadow-sm hover:bg-gray-100 transition"
          >
            {allSelected ? 'Clear All' : 'Select All'}
          </button>
          {selectedIds.length > 0 && (
            <span className="text-xs text-gray-600">
              {selectedIds.length} selected
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onOpenAdd()}
          className="hidden md:inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs"
        >
          + New Task
        </button>
      </div>

      <ul className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            url_call={url_call}
            onCompleteTask={onCompleteTask}
            onDeleteTask={onDeleteTask}
            onOpenDetails={setDetailsTask}
            onOpenUpdate={setUpdateTask}
            isSelected={selectedIds.includes(task.id)}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </ul>
      {detailsTask && (
        <DetailsModal task={detailsTask} onClose={() => setDetailsTask(null)} />
      )}
      {updateTask && (
        <UpdateTask
          task={updateTask}
            onClose={() => setUpdateTask(null)}
            onUpdate={handleUpdate}
            url_call={url_call}
        />
      )}
    </>
  );
};

export default TasksData;
