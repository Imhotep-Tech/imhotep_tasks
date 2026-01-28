import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFinance } from '../../contexts/FinanceContext';

const ImhotepFinanceCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleCallback } = useFinance();
  const [message, setMessage] = useState('Completing connection with Imhotep Finance...');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const errorParam = params.get('error');
    const errorDescription = params.get('error_description');

    if (errorParam) {
      setError(decodeURIComponent(errorDescription || errorParam));
      setMessage('');
      return;
    }

    if (!code) {
      setError('Authorization code is missing in callback URL.');
      setMessage('');
      return;
    }

    const run = async () => {
      try {
        const verifier = window.sessionStorage.getItem('imhotep_finance_code_verifier');
        const res = await handleCallback(code, verifier, null, null);
        if (res?.success) {
          setMessage('Imhotep Finance connection completed successfully. Redirecting to tasks...');
          setTimeout(() => navigate('/all-tasks'), 2000);
        } else {
          setError(res?.message || 'Failed to complete Imhotep Finance connection.');
          setMessage('');
        }
      } catch (e) {
        console.error('Imhotep Finance callback failed', e);
        setError('Failed to complete Imhotep Finance connection.');
        setMessage('');
      }
    };

    run();
  }, [location.search, handleCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-indigo-50 text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-3">
          Connecting to Imhotep Finance
        </h1>
        {message && (
          <p className="text-gray-600 mb-4">
            {message}
          </p>
        )}
        {error && (
          <div className="mt-2 rounded-lg bg-red-50 border border-red-100 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImhotepFinanceCallback;

