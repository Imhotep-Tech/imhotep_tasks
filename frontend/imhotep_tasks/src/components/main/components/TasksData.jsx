import React, { useState, useMemo } from "react";
import TaskCompleteButton from './TaskCompleteButton';
import TaskDeleteButton from './TaskDeleteButton';
import UpdateTask from './UpdateTask';
import DetailsModal from './DetailsModal';
import DateComponent from "./DateComponent";

/* ─── colour palette per category ─── */
const CATEGORY_STYLES = {
  study:    { border: "border-blue-400",   bg: "bg-blue-50",   badge: "bg-blue-100  text-blue-700  border-blue-200",   icon: "📚" },
  work:     { border: "border-amber-400",  bg: "bg-amber-50",  badge: "bg-amber-100 text-amber-700 border-amber-200",  icon: "💼" },
  personal: { border: "border-pink-400",   bg: "bg-pink-50",   badge: "bg-pink-100  text-pink-700  border-pink-200",   icon: "🏠" },
  health:   { border: "border-green-400",  bg: "bg-green-50",  badge: "bg-green-100 text-green-700 border-green-200",  icon: "💪" },
  finance:  { border: "border-emerald-400",bg: "bg-emerald-50",badge: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: "💰" },
  general:  { border: "border-gray-300",   bg: "bg-gray-50",   badge: "bg-gray-100  text-gray-600  border-gray-200",   icon: "📋" },
  other:    { border: "border-purple-400", bg: "bg-purple-50", badge: "bg-purple-100 text-purple-700 border-purple-200", icon: "🔖" },
};

const getStyle = (cat) => CATEGORY_STYLES[cat] || CATEGORY_STYLES.general;
const formatCategoryName = (cat) => {
  const value = (cat || "general").toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
};

/* ─── Collapsible category header ─── */
const CategoryHeader = ({ category, pendingCount, doneCount, isOpen, onToggle, isDoneGroup = false }) => {
  const s = isDoneGroup ? getStyle("general") : getStyle(category);
  const title = isDoneGroup ? "Done" : category;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-l-4 ${s.border} ${s.bg} transition-colors hover:brightness-95 focus:outline-none`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{s.icon}</span>
        <h3 className="text-sm font-semibold capitalize text-gray-800">{title}</h3>
        {!isDoneGroup && (
          <span className={`ml-1 text-xs px-2 py-0.5 rounded-full border ${s.badge}`}>
            {pendingCount} pending
          </span>
        )}
        {(isDoneGroup || doneCount > 0) && (
          <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-100 text-gray-500 border-gray-200">
            {isDoneGroup ? doneCount : `${doneCount} done`}
          </span>
        )}
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
};

/* ─── single task row (unchanged logic) ─── */
const TaskRow = ({
  task,
  url_call,
  onCompleteTask,
  onDeleteTask,
  onOpenDetails,
  onOpenUpdate,
  isSelected,
  onToggleSelect,
  showDoneCategory = false,
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
        
            </div>
          )}
          {showDoneCategory && task.status && (
            <div className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 border border-gray-200">
              {formatCategoryName(task.task_category)}
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

/* ─── main component ─── */
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
  ,
  consolidateDone = false
}) => {
  const [detailsTask, setDetailsTask] = useState(null);
  const [updateTask, setUpdateTask] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const allSelected = useMemo(
    () => tasks.length > 0 && selectedIds.length === tasks.length,
    [tasks, selectedIds]
  );

  /* Group tasks by category or consolidate done tasks (today page). */
  const groupedTasks = useMemo(() => {
    const categoryOrderSort = (a, b) => {
      if (a === "study") return -1;
      if (b === "study") return 1;
      return a.localeCompare(b);
    };

    if (consolidateDone) {
      const pendingGroups = {};
      const doneTasks = [];

      tasks.forEach((task) => {
        const cat = (task.task_category || "general").toLowerCase();
        if (task.status) {
          doneTasks.push(task);
          return;
        }
        if (!pendingGroups[cat]) pendingGroups[cat] = [];
        pendingGroups[cat].push(task);
      });

      const pendingSections = Object.keys(pendingGroups)
        .sort(categoryOrderSort)
        .map((cat) => ({
          category: cat,
          tasks: pendingGroups[cat],
          pendingCount: pendingGroups[cat].length,
          doneCount: 0,
          isDoneGroup: false,
        }));

      if (doneTasks.length > 0) {
        doneTasks.sort((a, b) => {
          const aCat = (a.task_category || "general").toLowerCase();
          const bCat = (b.task_category || "general").toLowerCase();
          return categoryOrderSort(aCat, bCat);
        });
        pendingSections.push({
          category: "done",
          tasks: doneTasks,
          pendingCount: 0,
          doneCount: doneTasks.length,
          isDoneGroup: true,
        });
      }

      return pendingSections;
    }

    const groups = {};
    tasks.forEach((task) => {
      const cat = (task.task_category || "general").toLowerCase();
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(task);
    });

    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status ? 1 : -1;
      });
    });

    return Object.keys(groups).sort(categoryOrderSort).map((cat) => ({
      category: cat,
      tasks: groups[cat],
      pendingCount: groups[cat].filter((t) => !t.status).length,
      doneCount: groups[cat].filter((t) => t.status).length,
      isDoneGroup: false,
    }));
  }, [tasks, consolidateDone]);

  const toggleCategory = (cat) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

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

      {/* Category-grouped task list */}
      <div className="divide-y divide-gray-200">
        {groupedTasks.map(({ category, tasks: catTasks, pendingCount, doneCount, isDoneGroup }) => {
          const isOpen = !collapsedCategories[category];
          return (
            <div key={category} className="py-2 px-3">
              <CategoryHeader
                category={category}
                pendingCount={pendingCount}
                doneCount={doneCount}
                isOpen={isOpen}
                onToggle={() => toggleCategory(category)}
                isDoneGroup={isDoneGroup}
              />

              {isOpen && (
                <ul className="mt-1 divide-y divide-gray-100">
                  {catTasks.map((task) => (
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
                      showDoneCategory={isDoneGroup}
                    />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

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
