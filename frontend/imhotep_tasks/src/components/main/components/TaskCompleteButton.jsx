import React, { useState } from "react";
import axios from "../../../config/api";

const TaskCompleteButton = ({ task, url_call, onCompleteTask }) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`api/tasks/task_complete/${task.id}/`, { url_call });
      const updated = res.data.task;
      onCompleteTask(updated, res.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`w-6 h-6 flex-shrink-0 rounded-full border flex items-center justify-center transition-colors mr-3
        ${task.status
          ? "bg-green-500 border-green-500 text-white"
          : "border-gray-300 hover:border-gray-400"}
      `}
      title={task.status ? "Mark as pending" : "Mark as complete"}
    >
      {loading ? (
        <svg
          className="animate-spin w-4 h-4 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : (
        task.status && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )
      )}
    </button>
  );
};

export default TaskCompleteButton;
