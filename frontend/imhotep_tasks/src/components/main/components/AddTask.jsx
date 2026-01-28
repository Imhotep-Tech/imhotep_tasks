import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useFinance } from '../../../contexts/FinanceContext';
import axios from '../../../config/api';

const AddTask = ({ onClose, onCreate, url_call }) => {
  const { user } = useAuth();
  const { status: financeStatus, currencies, currenciesLoading, fetchCurrencies } = useFinance();
  const financeConnected = financeStatus?.connected && financeStatus?.token_valid;

  const [activeTab, setActiveTab] = useState('task');
  const [task_title, setTitle] = useState('');
  const [task_description, setDescription] = useState('');
  const [due_date, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Finance fields
  const [price, setPrice] = useState('');
  const [transactionCurrency, setTransactionCurrency] = useState('USD');
  const [transactionStatus, setTransactionStatus] = useState('Withdraw');
  const [transactionCategory, setTransactionCategory] = useState('');

  // Fetch currencies when finance tab is opened
  useEffect(() => {
    if (activeTab === 'finance' && financeConnected && currencies.length === 0) {
      fetchCurrencies();
    }
  }, [activeTab, financeConnected, currencies.length, fetchCurrencies]);

  // Default currencies if API fails
  const currencyOptions = currencies.length > 0 ? currencies : ['USD', 'EUR', 'GBP', 'EGP'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { 
        task_title, 
        task_details: task_description, 
        due_date, 
        url_call,
        // Only include finance fields if user has entered a price and is connected
        ...(financeConnected && price ? {
          price: parseFloat(price),
          transaction_currency: transactionCurrency,
          transaction_status: transactionStatus,
          transaction_category: transactionCategory || null,
        } : {})
      };
      const res = await axios.post('api/tasks/add_task/', payload);
      onCreate && onCreate(res.data);
      // reset fields
      setTitle('');
      setDescription('');
      setDueDate('');
      setPrice('');
      setTransactionCurrency('USD');
      setTransactionStatus('Withdraw');
      setTransactionCategory('');
    } catch (err) {
      console.error(err);
      setError('Failed to create task.');
    } finally {
      setLoading(false);
      onClose && onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add New Task</h3>
          <button aria-label="Close" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {/* Tab navigation - only show if finance is connected */}
        {financeConnected && (
          <div className="flex border-b mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('task')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'task'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Task Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('finance')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'finance'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Finance
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Task Details Tab */}
          {activeTab === 'task' && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={task_title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="e.g. Write project proposal"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Brief / Description</label>
                <textarea
                  value={task_description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Optional details to help you remember"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Due date</label>
                <input
                  type="date"
                  value={due_date}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </>
          )}

          {/* Finance Tab - only if connected */}
          {activeTab === 'finance' && financeConnected && (
            <>
              <p className="text-xs text-gray-500 mb-2">
                Add financial details to create a transaction in Imhotep Finance when this task is completed.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Currency</label>
                  <select
                    value={transactionCurrency}
                    onChange={(e) => setTransactionCurrency(e.target.value)}
                    className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    disabled={currenciesLoading}
                  >
                    {currenciesLoading ? (
                      <option>Loading...</option>
                    ) : (
                      currencyOptions.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Transaction Type</label>
                <select
                  value={transactionStatus}
                  onChange={(e) => setTransactionStatus(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="Withdraw">Withdraw (Expense)</option>
                  <option value="Deposit">Deposit (Income)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={transactionCategory}
                  onChange={(e) => setTransactionCategory(e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="e.g. Work, Shopping, Bills"
                />
              </div>
            </>
          )}

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="chef-button-secondary px-3 py-2 rounded">Cancel</button>
            <button type="submit" disabled={loading} className="chef-button bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded">
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTask;