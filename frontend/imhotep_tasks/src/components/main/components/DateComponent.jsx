import React, { useState } from "react";

// Helper to get due date color class
const getDueDateColor = (dueDateIso, completed = false) => {
  if (!dueDateIso) return "text-gray-500";
  const today = new Date();
  today.setHours(0,0,0,0);
  const dueDate = new Date(dueDateIso);
  dueDate.setHours(0,0,0,0);

  const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    // overdue
    return completed ? "text-gray-500" : "text-red-600 font-semibold";
  }
  if (diffDays === 0) return "text-blue-600 font-semibold"; // today
  if (diffDays === 1) return "text-purple-600 font-semibold"; // tomorrow
  return "text-gray-500";
};

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
};

//helper to get due date text
const getDueDateText = (dueDateIso, completed = false) => {
  if (!dueDateIso) return "";
  const today = new Date();
  today.setHours(0,0,0,0);
  const dueDate = new Date(dueDateIso);
  dueDate.setHours(0,0,0,0);

  const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    // overdue
    if (completed) {
      // completed but overdue -> show date only
      return formatDate(dueDateIso);
    }
    // not completed and overdue -> show "Overdue — <date>"
    return `Overdue — ${formatDate(dueDateIso)}`;
  }
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  // future -> normal date
  return formatDate(dueDateIso);
};

const DateComponent = ({ task }) => {
const dueText = task.due_date ? getDueDateText(task.due_date, !!task.status) : "";
  const dueClass = getDueDateColor(task.due_date, !!task.status);
  return (
    <span className={`text-sm mr-4 ${dueClass}`}>
        {dueText ? ` • ${dueText}` : ""}
    </span>
  )
}

export default DateComponent;