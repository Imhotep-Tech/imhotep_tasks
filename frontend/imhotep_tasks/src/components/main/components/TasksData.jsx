import React, { useState, useMemo } from "react";
import TaskCompleteButton from './TaskCompleteButton';
import TaskDeleteButton from './TaskDeleteButton';
import UpdateTask from './UpdateTask';
import DetailsModal from './DetailsModal';
import DateComponent from "./DateComponent";

/* ─── category styles with rich color tokens ─── */
const CATEGORY_STYLES = {
  study:    { border: "border-blue-500",    bg: "bg-blue-500/10 dark:bg-blue-500/15",    badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",    icon: "📚" },
  work:     { border: "border-amber-500",   bg: "bg-amber-500/10 dark:bg-amber-500/15",   badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",   icon: "💼" },
  personal: { border: "border-pink-500",    bg: "bg-pink-500/10 dark:bg-pink-500/15",    badge: "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30",    icon: "🏠" },
  health:   { border: "border-emerald-500", bg: "bg-emerald-500/10 dark:bg-emerald-500/15", badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", icon: "💪" },
  finance:  { border: "border-cyan-500",    bg: "bg-cyan-500/10 dark:bg-cyan-500/15",    badge: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",    icon: "💰" },
  general:  { border: "border-indigo-500",  bg: "bg-indigo-500/10 dark:bg-indigo-500/15",  badge: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30", icon: "📋" },
  other:    { border: "border-purple-500",  bg: "bg-purple-500/10 dark:bg-purple-500/15",  badge: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",  icon: "🔖" },
};

const getStyle = (cat) => CATEGORY_STYLES[cat] || CATEGORY_STYLES.general;
const formatCategoryName = (cat) => {
  const value = (cat || "general").toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
};

/* ─── Collapsible category header ─── */
const CategoryHeader = ({ category, pendingCount, doneCount, isOpen, onToggle, isDoneGroup = false }) => {
  const s = isDoneGroup ? getStyle("general") : getStyle(category);
  const title = isDoneGroup ? "Completed Tasks" : category;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-l-4 ${s.border} ${s.bg} border border-slate-200/50 dark:border-white/5 shadow-sm transition-all duration-200 hover:brightness-105 focus:outline-none`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-xl">{s.icon}</span>
        <h3 className="text-sm font-bold capitalize text-slate-800 dark:text-slate-100">{title}</h3>
        {!isDoneGroup && (
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${s.badge}`}>
            {pendingCount} pending
          </span>
        )}
        {(isDoneGroup || doneCount > 0) && (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
            {isDoneGroup ? `${doneCount} completed` : `${doneCount} done`}
          </span>
        )}
      </div>
      <div className="w-7 h-7 rounded-lg bg-white/50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );
};

/* ─── Task Row ─── */
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
      className={`p-3.5 my-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800/70 transition-all duration-200 ${
        task.status 
          ? "bg-slate-50/50 dark:bg-slate-900/40 opacity-75" 
          : "bg-white/90 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:shadow-md hover:border-indigo-500/20"
      } flex items-center justify-between gap-3 group`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(task.id)}
          className="h-4.5 w-4.5 text-indigo-600 rounded border-slate-300 dark:border-slate-700 focus:ring-indigo-500 cursor-pointer"
        />

        <TaskCompleteButton
          task={task}
          url_call={url_call}
          onCompleteTask={onCompleteTask}
        />

        <div className="min-w-0 flex-1">
          <p
            onClick={() => onOpenDetails(task)}
            className={`font-semibold text-sm text-slate-800 dark:text-slate-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate ${
              task.status ? "line-through text-slate-400 dark:text-slate-500 font-normal" : ""
            }`}
          >
            {task.task_title}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
            {task.transaction_id && (
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {task.transaction_status || 'Transaction'}
              </span>
            )}
            {showDoneCategory && task.status && (
              <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {formatCategoryName(task.task_category)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <DateComponent task={task} />
        
        <div className="flex items-center space-x-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onOpenUpdate(task)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit task"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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

/* ─── Main Component ─── */
const TasksData = ({
  tasks = [],
  loading,
  url_call,
  onCompleteTask,
  onDeleteTask,
  onOpenAdd,
  onUpdateTask,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  consolidateDone = false
}) => {
  const [detailsTask, setDetailsTask] = useState(null);
  const [updateTask, setUpdateTask] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const allSelected = useMemo(
    () => tasks.length > 0 && selectedIds.length === tasks.length,
    [tasks, selectedIds]
  );

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
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 skeleton-shimmer w-full rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-inner">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          No tasks scheduled
        </h3>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          You're all caught up! Create a new task to organize your work effectively.
        </p>
        <button
          onClick={onOpenAdd}
          className="mt-5 glass-button"
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create New Task
        </button>
      </div>
    );
  }

  return (
    <>
      {/* List Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50/80 dark:bg-slate-950/50 border-b border-slate-200/70 dark:border-white/10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectAll(allSelected)}
            className="text-xs font-semibold glass-button-secondary py-1.5 px-3"
          >
            {allSelected ? 'Clear All' : 'Select All'}
          </button>
          {selectedIds.length > 0 && (
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onOpenAdd()}
          className="glass-button text-xs py-1.5 px-3"
        >
          + Add Task
        </button>
      </div>

      {/* Accordion grouped task list */}
      <div className="p-4 space-y-3">
        {groupedTasks.map(({ category, tasks: catTasks, pendingCount, doneCount, isDoneGroup }) => {
          const isOpen = !collapsedCategories[category];
          return (
            <div key={category} className="space-y-1">
              <CategoryHeader
                category={category}
                pendingCount={pendingCount}
                doneCount={doneCount}
                isOpen={isOpen}
                onToggle={() => toggleCategory(category)}
                isDoneGroup={isDoneGroup}
              />

              {isOpen && (
                <ul className="pl-1 pr-1">
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

