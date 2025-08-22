import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../config/api';
import Footer from '../common/Footer';

const AddOrUpdateRoutineModal = ({ routine, onClose, onSave }) => {
    const { user } = useAuth();
  const [title, setTitle] = useState(routine?.routines_title || '');
  const [days, setDays] = useState(routine?.routines_dates?.split(' ') || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const allDays = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

  const handleDayToggle = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleQuickSelect = (type) => {
    if (type === 'all') setDays([...allDays]);
    else if (type === 'weekdays') setDays(allDays.slice(0,5));
    else if (type === 'weekends') setDays(allDays.slice(5));
    else setDays([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        routines_title: title,
        routines_dates: days.join(' ')
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{routine ? 'Update Routine' : 'Add New Routine'}</h3>
          <button aria-label="Close" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Routine Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Frequency</label>
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={() => handleQuickSelect('all')} className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">All Days</button>
              <button type="button" onClick={() => handleQuickSelect('weekdays')} className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">Weekdays</button>
              <button type="button" onClick={() => handleQuickSelect('weekends')} className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">Weekends</button>
              <button type="button" onClick={() => handleQuickSelect('none')} className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">Clear</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {allDays.map((day) => (
                <label key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={days.includes(day)}
                    onChange={() => handleDayToggle(day)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{day}</span>
                </label>
              ))}
            </div>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="chef-button-secondary px-3 py-2 rounded">Cancel</button>
            <button type="submit" disabled={loading} className="chef-button bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded">
              {loading ? (routine ? 'Updating...' : 'Adding...') : (routine ? 'Update Routine' : 'Add Routine')}
            </button>
          </div>
        </form>
      </div>
    </div>
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
    <>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Routines</h1>
            <p className="text-gray-600 mt-1">Hello, {user?.username || 'User'}!</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <button
              onClick={handleApplyRoutines}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center shadow-md transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582a7 7 0 0113.837 2.001A7 7 0 015.418 9H4V4z" />
              </svg>
              Apply Routines
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow-md transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Routine
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Routines</p>
                <p className="text-2xl font-bold text-gray-800">{totalRoutines}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Active</p>
                <p className="text-2xl font-bold text-gray-800">{activeCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Inactive</p>
                <p className="text-2xl font-bold text-gray-800">{inactiveCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Routines List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">My Routines</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : routines.length ? (
            <ul className="divide-y divide-gray-200">
              {routines.map((routine) => (
                <li key={routine.id} className={`p-4 hover:bg-gray-50 transition-all ${routine.status ? 'border-l-4 border-green-500 bg-green-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{routine.routines_title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {routine.routines_dates ? routine.routines_dates.split(' ').map(d => <span key={d} className="mr-2 capitalize">{d}</span>) : 'No days selected'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditRoutine(routine)}
                        className="p-1.5 text-blue-500 hover:bg-blue-100 rounded transition-colors"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(routine.id)}
                        className={`p-1.5 ${routine.status ? 'text-yellow-500 hover:bg-yellow-100' : 'text-green-500 hover:bg-green-100'} rounded transition-colors`}
                        title={routine.status ? 'Pause' : 'Activate'}
                      >
                        {routine.status ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(routine.id)}
                        className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-colors"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center">
              <div className="inline-flex rounded-full bg-yellow-100 p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No routines yet</h3>
              <p className="mt-2 text-gray-500">Start building healthy habits by creating your first routine.</p>
              <button onClick={() => setShowAdd(true)} className="mt-4 inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create New Routine
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {numPages > 1 && (
          <div className="px-4 py-5 bg-gray-50 border-t border-gray-200">
            <nav className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button onClick={() => changePage(page - 1)} disabled={page <= 1} className="px-3 py-2 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50">
                  Previous
                </button>
                <span className="text-sm text-gray-700">Page {page} of {numPages}</span>
                <button onClick={() => changePage(page + 1)} disabled={page >= numPages} className="px-3 py-2 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50">
                  Next
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Showing page {page} — {totalRoutines} routines
              </p>
            </nav>
          </div>
        )}

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
    </>
  );
};

export default Routines;
