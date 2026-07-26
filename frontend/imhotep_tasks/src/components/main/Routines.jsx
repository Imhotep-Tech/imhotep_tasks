import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../config/api';
import Footer from '../common/Footer';

const AddOrUpdateRoutineModal = ({ routine, onClose, onSave }) => {

  const { user } = useAuth();
  const [title, setTitle] = useState(routine?.routines_title || '');
  const [routineType, setRoutineType] = useState(routine?.routine_type || 'weekly');
  const [days, setDays] = useState(routine?.routines_dates ? (Array.isArray(routine.routines_dates) ? routine.routines_dates : routine.routines_dates.split(' ')) : []);
  const [yearlyInput, setYearlyInput] = useState('');
  const [yearlyError, setYearlyError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const PRESET_CATEGORIES = ['general', 'study', 'work', 'personal', 'health', 'finance'];
  const CATEGORY_LABELS = {
    general: '📋 General',
    study: '📚 Study',
    work: '💼 Work',
    personal: '🏠 Personal',
    health: '💪 Health',
    finance: '💰 Finance',
  };

  const getInitialCategory = () => {
    const existing = (routine?.routine_category || 'general').toLowerCase();
    if (PRESET_CATEGORIES.includes(existing)) return existing;
    return '__other__';
  };
  const getInitialCustom = () => {
    const existing = (routine?.routine_category || 'general').toLowerCase();
    if (PRESET_CATEGORIES.includes(existing)) return '';
    return existing;
  };

  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory());
  const [customCategory, setCustomCategory] = useState(getInitialCustom());

  const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const allMonthlyDays = Array.from({ length: 31 }, (_, i) => i + 1);

  useEffect(() => {
    if (routine && routine.routine_type === 'yearly' && routine.routines_dates) {
      const dates = Array.isArray(routine.routines_dates) ? routine.routines_dates : routine.routines_dates.split(' ');
      setYearlyInput(dates.join(', '));
    }
  }, [routine]);

  const handleDayToggle = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleYearlyChange = (value) => {
    setYearlyInput(value);
    setYearlyError('');
    
    if (!value.trim()) {
      setDays([]);
      return;
    }
    
    const parts = value.split(',').map(s => s.trim()).filter(s => s);
    const validDates = [];
    const errors = [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!/^\d{1,2}-\d{1,2}$/.test(part)) {
        errors.push(`Date ${i + 1} "${part}" is invalid. Use MM-DD format (e.g., 12-25)`);
        continue;
      }
      
      const [monthStr, dayStr] = part.split('-');
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);
      
      if (isNaN(month) || month < 1 || month > 12) {
        errors.push(`Date ${i + 1} "${part}" has invalid month (1-12)`);
        continue;
      }
      
      let maxDay = [1, 3, 5, 7, 8, 10, 12].includes(month) ? 31 : [4, 6, 9, 11].includes(month) ? 30 : 29;
      if (isNaN(day) || day < 1 || day > maxDay) {
        errors.push(`Date ${i + 1} "${part}" has invalid day (max ${maxDay})`);
        continue;
      }
      
      validDates.push(`${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
    }
    
    if (errors.length > 0) setYearlyError(errors.join('. '));
    setDays(validDates);
  };

  const handleQuickSelect = (type) => {
    if (type === 'all') setDays([...allDays]);
    else if (type === 'weekdays') setDays(allDays.slice(0, 5));
    else if (type === 'weekends') setDays(allDays.slice(5));
    else setDays([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!title.trim()) {
      setError('Routine title is required.');
      setLoading(false);
      return;
    }
    if (days.length === 0) {
      setError('At least one date or day must be selected.');
      setLoading(false);
      return;
    }
    if (routineType === 'yearly' && yearlyError) {
      setError('Please fix date format errors before saving.');
      setLoading(false);
      return;
    }
    
    try {
      const finalCategory = selectedCategory === '__other__' ? customCategory.trim().toLowerCase() : selectedCategory;
      const payload = {
        routines_title: title,
        routine_type: routineType,
        routines_dates: days,
        routine_category: finalCategory || 'general',
      };
      let res;
      if (routine) {
        res = await axios.post(`api/update_routine/${routine.id}/`, payload);
      } else {
        res = await axios.post('api/add_routine/', payload);
      }
      onSave && onSave(res.data.routine);
    } catch (err) {
      setError('Failed to save routine.');
    } finally {
      setLoading(false);
      onClose && onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        
        {/* Glow Ambient Header */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/70 dark:border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {routine ? 'Edit Routine' : 'Create Recurring Routine'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Automate recurring tasks effortlessly</p>
            </div>
          </div>

          <button 
            aria-label="Close" 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Routine Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input text-sm"
              placeholder="e.g., Weekly Team Sync Prep"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="glass-input text-sm"
              >
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                ))}
                <option value="__other__">🔖 Custom...</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Recurrence Type
              </label>
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                {['weekly', 'monthly', 'yearly'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setRoutineType(type);
                      setDays([]);
                      setYearlyInput('');
                      setYearlyError('');
                    }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                      routineType === type
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedCategory === '__other__' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Custom Category Name
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="glass-input text-sm"
                placeholder="Enter category name..."
              />
            </div>
          )}

          {/* Schedule Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              {routineType === 'weekly' ? 'Days of the Week' : routineType === 'monthly' ? 'Days of the Month (1-31)' : 'Dates (MM-DD format)'}
            </label>

            {routineType === 'weekly' && (
              <>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  <button type="button" onClick={() => handleQuickSelect('all')} className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200">All</button>
                  <button type="button" onClick={() => handleQuickSelect('weekdays')} className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200">Weekdays</button>
                  <button type="button" onClick={() => handleQuickSelect('weekends')} className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200">Weekends</button>
                  <button type="button" onClick={() => handleQuickSelect('none')} className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200">Clear</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {allDays.map((day) => {
                    const active = days.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        className={`py-2 px-3 text-xs font-medium rounded-xl border text-center capitalize transition-all ${
                          active
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {routineType === 'monthly' && (
              <div className="grid grid-cols-7 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                {allMonthlyDays.map((day) => {
                  const active = days.includes(day.toString());
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => handleDayToggle(day.toString())}
                      className={`h-8 text-xs font-semibold rounded-lg flex items-center justify-center transition-all ${
                        active
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            )}

            {routineType === 'yearly' && (
              <>
                <input
                  type="text"
                  placeholder="e.g., 12-25, 01-01, 06-15"
                  value={yearlyInput}
                  onChange={(e) => handleYearlyChange(e.target.value)}
                  className="glass-input text-sm"
                />
                {yearlyError && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{yearlyError}</p>
                )}
                <p className="mt-1 text-[11px] text-slate-400">Comma-separated MM-DD dates (e.g. 12-25 for Christmas)</p>
              </>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200/70 dark:border-white/10">
            <button 
              type="button" 
              onClick={onClose} 
              className="glass-button-secondary text-xs px-4 py-2.5"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="glass-button text-xs px-5 py-2.5"
            >
              {loading ? (routine ? 'Saving...' : 'Creating...') : (routine ? 'Save Changes' : 'Save Routine')}
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};

const Routines = () => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [totalRoutines, setTotalRoutines] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editRoutine, setEditRoutine] = useState(null);
  const [error, setError] = useState('');

  const fetchRoutines = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`api/routines/?page=${pageNum}`);
      const data = res.data;
      setRoutines(data.user_routines || []);
      setPage(data.pagination?.page || 1);
      setNumPages(data.pagination?.num_pages || 1);
      setTotalRoutines(data.pagination?.total ?? 0);
      setActiveCount((data.user_routines || []).filter(r => r.status).length);
      setInactiveCount((data.user_routines || []).filter(r => !r.status).length);
    } catch (err) {
      setError('Failed to load routines.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutines(page);
    // eslint-disable-next-line
  }, []);

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > numPages) return;
    fetchRoutines(newPage);
  };

  const handleAddOrUpdate = (routine) => {
    fetchRoutines(page);
  };

  const handleDelete = async (routineId) => {
    if (!window.confirm('Are you sure you want to delete this routine?')) return;
    try {
      await axios.post(`api/delete_routine/${routineId}/`);
      fetchRoutines(page);
    } catch (err) {
      setError('Failed to delete routine.');
    }
  };

  const handleToggleStatus = async (routineId) => {
    try {
      await axios.post(`api/update_routine_status/${routineId}/`);
      fetchRoutines(page);
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  const handleApplyRoutines = async () => {
    try {
      await axios.post('api/apply_routines/');
      fetchRoutines(page);
    } catch (err) {
      setError('Failed to apply routines.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-slate-50 dark:bg-[#080C14]">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl relative z-10">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Automated Workflows
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
              Habit & Routine OS
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Automate task generation on weekly, monthly, or yearly cycles.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleApplyRoutines}
              className="glass-button-secondary text-xs flex items-center"
            >
              <svg className="w-4 h-4 mr-1.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582a7 7 0 0113.837 2.001A7 7 0 015.418 9H4V4z" />
              </svg>
              <span>Sync Routines Now</span>
            </button>

            <button
              onClick={() => setShowAdd(true)}
              className="glass-button text-xs flex items-center shadow-emerald-500/20"
            >
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>New Routine</span>
            </button>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="glass-card p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Routines</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{totalRoutines}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Workflows</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{activeCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="glass-card p-5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Paused</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{inactiveCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Routines List Panel */}
        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-slate-200/70 dark:border-white/10">
          <div className="px-6 py-4 bg-slate-100/70 dark:bg-slate-900/80 border-b border-slate-200/70 dark:border-white/10 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Routine Collection
            </h2>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Page {page} of {numPages}
            </span>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 skeleton-shimmer w-full rounded-2xl"></div>
              ))}
            </div>
          ) : routines.length ? (
            <ul className="p-4 space-y-2.5">
              {routines.map((routine) => (
                <li 
                  key={routine.id} 
                  className={`p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                    routine.status 
                      ? 'bg-white/90 dark:bg-slate-900/80 border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-md' 
                      : 'bg-slate-100/50 dark:bg-slate-950/40 border-slate-200/40 dark:border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${routine.status ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {routine.routines_title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 capitalize">
                          {routine.routine_type || 'weekly'}
                        </span>
                        {routine.routine_category && routine.routine_category !== 'general' && (
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 capitalize">
                            {routine.routine_category}
                          </span>
                        )}
                        {routine.routines_dates && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                            {Array.isArray(routine.routines_dates) ? routine.routines_dates.join(', ') : routine.routines_dates}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 flex-shrink-0 ml-4">
                    <button
                      onClick={() => setEditRoutine(routine)}
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      title="Edit Routine"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleToggleStatus(routine.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        routine.status 
                          ? 'text-amber-500 hover:bg-amber-500/10' 
                          : 'text-emerald-500 hover:bg-emerald-500/10'
                      }`}
                      title={routine.status ? 'Pause Routine' : 'Activate Routine'}
                    >
                      {routine.status ? (
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6" />
                        </svg>
                      ) : (
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(routine.id)}
                      className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                      title="Delete Routine"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-inner">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No routines defined</h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                Create recurring task schedules to automate your daily and weekly habits.
              </p>
              <button onClick={() => setShowAdd(true)} className="mt-5 glass-button text-xs">
                Create New Routine
              </button>
            </div>
          )}

          {numPages > 1 && (
            <div className="px-6 py-4 bg-slate-100/70 dark:bg-slate-900/80 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => changePage(page - 1)} 
                  disabled={page <= 1} 
                  className="glass-button-secondary text-xs py-1.5 px-3 disabled:opacity-50"
                >
                  Previous
                </button>
                <button 
                  onClick={() => changePage(page + 1)} 
                  disabled={page >= numPages} 
                  className="glass-button-secondary text-xs py-1.5 px-3 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Page {page} of {numPages} — {totalRoutines} routines
              </p>
            </div>
          )}
        </div>

        {showAdd && (
          <AddOrUpdateRoutineModal
            onClose={() => setShowAdd(false)}
            onSave={handleAddOrUpdate}
          />
        )}
        {editRoutine && (
          <AddOrUpdateRoutineModal
            routine={editRoutine}
            onClose={() => setEditRoutine(null)}
            onSave={handleAddOrUpdate}
          />
        )}

      </div>
      
      <Footer />
    </div>
  );
};

export default Routines;

