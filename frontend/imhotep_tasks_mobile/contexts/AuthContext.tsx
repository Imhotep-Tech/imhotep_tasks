import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Assuming you have an axios instance configured similarly to your web app
import api from '../constants/api'; 

interface AuthContextType {
  user: any;
  login: ({ access, refresh, user }: { access: string; refresh: string; user: any }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: any) => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Configure axios defaults
axios.defaults.baseURL = api.defaults.baseURL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

let refreshPromise: Promise<string> | null = null;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // 1. Initial State must be null because loading from storage is async now
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. Load data from AsyncStorage when the app starts
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedAccess = await AsyncStorage.getItem('access_token');
        const storedRefresh = await AsyncStorage.getItem('refresh_token');

        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedAccess) setAccessToken(storedAccess);
        if (storedRefresh) setRefreshToken(storedRefresh);
      } catch (e) {
        console.error('Failed to load auth data', e);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  // Set auth token in axios headers
  useEffect(() => {
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      if (api) api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
      if (api) delete api.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

  // Function to refresh the access token
  const refreshAccessToken = async () => {
    if (refreshPromise) {
      return refreshPromise;
    }
    
    // We must read refresh token from state or storage here
    const currentRefreshToken = refreshToken || await AsyncStorage.getItem('refresh_token');

    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }

    refreshPromise = axios
      .post('/api/auth/token/refresh/', { refresh: currentRefreshToken })
      .then(async (response) => {
        const newAccessToken = response.data.access;
        const newRefreshToken = response.data.refresh;

        if (newAccessToken) {
          await AsyncStorage.setItem('access_token', newAccessToken);
          setAccessToken(newAccessToken);
        }
        if (newRefreshToken) {
          await AsyncStorage.setItem('refresh_token', newRefreshToken);
          setRefreshToken(newRefreshToken);
        }
        return newAccessToken;
      })
      .catch((error) => {
        console.error('Token refresh failed:', error);
        logout(); // Logout handles the cleanup
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });

    return refreshPromise;
  };

  // Axios interceptor (Logic is identical to Web, just adapted slightly)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const url = originalRequest?.url || '';
        
        // Prevent infinite loops on auth endpoints
        const isAuthEndpoint =
          url.includes('/api/auth/token/refresh/') ||
          url.includes('/api/auth/login/') ||
          url.includes('/api/auth/logout/');

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isAuthEndpoint
        ) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await refreshAccessToken();
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshToken]);

  // Login Function
  const login = async ({ access, refresh, user }: { access: string; refresh: string; user: any }) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    setUser(user);

    // Async Storage must be awaited
    await AsyncStorage.setItem('access_token', access);
    await AsyncStorage.setItem('refresh_token', refresh);
    await AsyncStorage.setItem('user', JSON.stringify(user));
  };

  // Logout Function
  const logout = async () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user');
  };

  // Update User Function
  const updateUser = async (userData: any) => {
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
    token: accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};