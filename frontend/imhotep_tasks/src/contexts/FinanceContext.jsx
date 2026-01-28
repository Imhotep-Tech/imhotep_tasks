import { createContext, useContext, useEffect, useState } from 'react';
import api from '../config/api';
import { useAuth } from './AuthContext';

const FinanceContext = createContext(null);

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return ctx;
};

export const FinanceProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [status, setStatus] = useState({
    connected: false,
    token_valid: false,
    scopes: '',
    expires_at: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currencies, setCurrencies] = useState([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(false);

  const refreshStatus = async () => {
    // Only fetch if user is authenticated
    if (!isAuthenticated) {
      setStatus({
        connected: false,
        token_valid: false,
        scopes: '',
        expires_at: null,
      });
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/finance/imhotep/status/');
      setStatus(res.data);
    } catch (e) {
      console.error('Failed to fetch Imhotep Finance status', e);
      // Don't show error if it's just an auth issue
      if (e.response?.status !== 401) {
        setError('Unable to check Imhotep Finance connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch when auth is done loading and user is authenticated
    if (!authLoading && isAuthenticated) {
      refreshStatus();
    } else if (!authLoading && !isAuthenticated) {
      // Reset status when logged out
      setStatus({
        connected: false,
        token_valid: false,
        scopes: '',
        expires_at: null,
      });
    }
  }, [isAuthenticated, authLoading]);

  const getAuthorizeUrl = async (codeChallenge) => {
    const params = codeChallenge
      ? `?code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=S256`
      : '';
    const res = await api.get(`/api/finance/imhotep/authorize-url/${params}`);
    return res.data.authorize_url;
  };

  const handleCallback = async (code, codeVerifier, error, errorDescription) => {
    const payload = {
      code,
      code_verifier: codeVerifier,
      error,
      error_description: errorDescription,
    };
    const res = await api.post('/api/finance/imhotep/callback/', payload);
    await refreshStatus();
    return res.data;
  };

  const fetchCurrencies = async () => {
    // Only fetch if not already loaded
    if (currencies.length > 0) {
      return currencies;
    }
    
    setCurrenciesLoading(true);
    try {
      const res = await api.get('/api/finance/imhotep/currencies/');
      const currencyList = res.data?.currencies || [];
      setCurrencies(currencyList);
      return currencyList;
    } catch (e) {
      console.error('Failed to fetch currencies', e);
      // Return default currencies as fallback
      return ['USD', 'EUR', 'GBP', 'EGP'];
    } finally {
      setCurrenciesLoading(false);
    }
  };

  const value = {
    status,
    loading,
    error,
    refreshStatus,
    getAuthorizeUrl,
    handleCallback,
    currencies,
    currenciesLoading,
    fetchCurrencies,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

