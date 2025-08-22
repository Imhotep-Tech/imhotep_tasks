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
      className={`w-6 h-6 rounded-full border ${
        task.status
          ? "bg-green-500 border-green-500 text-white"
          : "border-gray-300 hover:border-gray-400"
      } mr-3 flex items-center justify-center transition-colors`}
      title={task.status ? "Mark as pending" : "Mark as complete"}
    >
      {task.status && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
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
      )}
    </button>
  );
};

export default TaskCompleteButton;
