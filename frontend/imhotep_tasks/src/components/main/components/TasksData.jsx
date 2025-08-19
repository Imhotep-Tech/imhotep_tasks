import React from "react";
import AddTask from "./AddTask";

const TaskRow = ({ task, onComplete, onEdit, onDelete, onOpenDetails }) => {
  return (
    <div className="flex items-start sm:items-center justify-between gap-3 p-3 border-b last:border-b-0">
      <div className="flex items-start gap-3 flex-1">
        <input
          type="checkbox"
          checked={!!task.completed}
          onChange={() => onComplete(task.id)}
          className="w-5 h-5 mt-1"
          aria-label={`Mark ${task.title} as complete`}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div
              className={`font-medium text-gray-800 ${
                task.completed ? "line-through text-gray-400" : ""
              }`}
            >
              {task.title}
            </div>
            <div className="text-xs text-gray-500">
              {task.due_date
                ? new Date(task.due_date).toLocaleDateString()
                : ""}
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {task.description || "No description provided."}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => onOpenDetails(task)}
              className="text-sm text-indigo-600 hover:underline"
            >
              Details
            </button>
            <button
              onClick={() => onEdit(task)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TasksData = ({
  tasks = [],
  loading,
  onComplete,
  onEdit,
  onDelete,
  onOpenAdd,
  onOpenDetails,
}) => {
  if (loading) {
    return (
      <div className="py-10 flex items-center justify-center">
        <div className="text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-gray-600 mb-4">You have no tasks yet.</div>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onOpenAdd}
            className="chef-button bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded"
          >
            + Add your first task
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg overflow-hidden">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenDetails={onOpenDetails}
        />
      ))}
    </div>
  );
};

export default TasksData;
