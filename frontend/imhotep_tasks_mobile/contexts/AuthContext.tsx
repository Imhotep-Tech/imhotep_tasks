import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as Linking from 'expo-linking';
import api from '../constants/api'; 
import { cacheClearAll } from '@/utils/cache';
import { clearQueue } from '@/utils/mutation-queue';
import { clearAllLocalStores } from '@/utils/local-store';

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
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [storageLoaded, setStorageLoaded] = useState(false);

  const accessTokenRef = useRef<string | null>(null);
  const refreshTokenRef = useRef<string | null>(null);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  }, [refreshToken]);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedAccess = await AsyncStorage.getItem('access_token');
        const storedRefresh = await AsyncStorage.getItem('refresh_token');

        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedAccess) {
          setAccessToken(storedAccess);
          accessTokenRef.current = storedAccess;
        }
        if (storedRefresh) {
          setRefreshToken(storedRefresh);
          refreshTokenRef.current = storedRefresh;
        }
      } catch (e) {
        console.error('Failed to load auth data', e);
      } finally {
        setStorageLoaded(true);
      }
    };

    loadStorageData();
  }, []);

  useEffect(() => {
    if (accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      if (api) api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
      if (api) delete api.defaults.headers.common['Authorization'];
    }
  }, [accessToken]);

  const refreshAccessToken = async (): Promise<string> => {
    if (refreshPromise) {
      return refreshPromise;
    }
    
    const currentRefreshToken = refreshTokenRef.current || await AsyncStorage.getItem('refresh_token');

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
          accessTokenRef.current = newAccessToken;
        }
        if (newRefreshToken) {
          await AsyncStorage.setItem('refresh_token', newRefreshToken);
          setRefreshToken(newRefreshToken);
          refreshTokenRef.current = newRefreshToken;
        }
        return newAccessToken;
      })
      .catch(async (error) => {
        console.error('Token refresh failed:', error);
        await logoutInternal();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });

    return refreshPromise;
  };

  const logoutInternal = async () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    accessTokenRef.current = null;
    refreshTokenRef.current = null;
    delete axios.defaults.headers.common['Authorization'];
    if (api) delete api.defaults.headers.common['Authorization'];
    
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user');
  };

  useEffect(() => {
    const createInterceptor = (axiosInstance: AxiosInstance) => {
      return axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config;
          const url = originalRequest?.url || '';
          
          const isAuthEndpoint =
            url.includes('/api/auth/token/refresh/') ||
            url.includes('/api/auth/login/') ||
            url.includes('/api/auth/logout/') ||
            url.includes('/api/auth/google/');

          const currentRefreshToken = refreshTokenRef.current;

          if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            currentRefreshToken &&
            !isAuthEndpoint
          ) {
            originalRequest._retry = true;

            try {
              const newAccessToken = await refreshAccessToken();
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              return axiosInstance(originalRequest);
            } catch (refreshError) {
              return Promise.reject(refreshError);
            }
          }

          return Promise.reject(error);
        }
      );
    };

    const axiosInterceptor = createInterceptor(axios);
    const apiInterceptor = createInterceptor(api);

    return () => {
      axios.interceptors.response.eject(axiosInterceptor);
      api.interceptors.response.eject(apiInterceptor);
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!storageLoaded) return;
      
      const currentAccessToken = accessTokenRef.current;
      const currentRefreshToken = refreshTokenRef.current;

      if (currentAccessToken) {
        const netState = await NetInfo.fetch();
        const isOnline = !!(netState.isConnected && netState.isInternetReachable !== false);

        if (!isOnline) {
          console.log('[Auth] Offline — using cached user data');
          setLoading(false);
          return;
        }

        try {
          const response = await api.get('/api/user-data/');
          setUser(response.data);
          await AsyncStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Auth check failed:', error);
          if (currentRefreshToken) {
            try {
              await refreshAccessToken();
              const response = await api.get('/api/user-data/');
              setUser(response.data);
              await AsyncStorage.setItem('user', JSON.stringify(response.data));
            } catch (refreshError) {
              console.error('Token refresh failed during auth check:', refreshError);
              await logoutInternal();
            }
          } else {
            await logoutInternal();
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [storageLoaded]);

  const login = async ({ access, refresh, user }: { access: string; refresh: string; user: any }) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    setUser(user);
    accessTokenRef.current = access;
    refreshTokenRef.current = refresh;

    await AsyncStorage.setItem('access_token', access);
    await AsyncStorage.setItem('refresh_token', refresh);
    await AsyncStorage.setItem('user', JSON.stringify(user));
  };

  // Deep Link Listener for Google Auth Redirects (imhotep-tasks://auth-callback?access=...&refresh=...&user=...)
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      if (!url) return;

      console.log('🔗 Incoming Deep Link:', url);

      try {
        const parsed = Linking.parse(url);
        const params = parsed.queryParams;

        if (parsed.hostname === 'auth-callback' || parsed.path === 'auth-callback' || params?.access) {
          const access = params?.access as string;
          const refresh = params?.refresh as string;
          const rawUser = params?.user as string;

          if (access && refresh && rawUser) {
            let userData = rawUser;
            try {
              userData = JSON.parse(decodeURIComponent(rawUser));
            } catch (e) {
              try {
                userData = JSON.parse(rawUser);
              } catch (err) {
                console.error('Failed to parse user JSON from deep link:', err);
              }
            }

            console.log('✅ Google OAuth Deep Link Received! Logging in user...');
            await login({ access, refresh, user: userData });
          }
        }
      } catch (err) {
        console.error('Failed to parse deep link auth params:', err);
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((initialUrl) => {
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const logout = async () => {
    try {
      const currentRefreshToken = refreshTokenRef.current;
      if (currentRefreshToken) {
        await axios.post('/api/auth/logout/', { refresh: currentRefreshToken });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    await cacheClearAll();
    await clearQueue();
    await clearAllLocalStores();

    await logoutInternal();
  };

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