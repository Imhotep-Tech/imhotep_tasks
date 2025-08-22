import React, { useState } from "react";
import axios from "../../../config/api";

const TaskDeleteButton = ({ taskId, url_call, onDeleteTask }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setLoading(true);
    try {
      const res = await axios.delete(`api/tasks/delete_task/${taskId}/`, { data: { url_call } });
      onDeleteTask(taskId, res.data);
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-colors"
      title="Delete"
    >
      {/* Delete icon */}
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
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );
};

export default TaskDeleteButton;
