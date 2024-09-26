import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import axios from 'axios';

export const AdminContext = createContext();
const hostname = window.location.hostname;

const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${hostname}:8080/api`;

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAdminToken = useCallback(() => {
    return localStorage.getItem('admin_token');
  }, []);

  const setAdminToken = useCallback((token) => {
    if (token) {
      localStorage.setItem('admin_token', token);
    } else {
      localStorage.removeItem('admin_token');
    }
  }, []);

  const getRefreshToken = useCallback(() => {
    return localStorage.getItem('admin_refresh_token');
  }, []);

  const setRefreshToken = useCallback((token) => {
    if (token) {
      localStorage.setItem('admin_refresh_token', token);
    } else {
      localStorage.removeItem('admin_refresh_token');
    }
  }, []);

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
    });

    instance.interceptors.request.use((config) => {
      const token = getAdminToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (error) => Promise.reject(error));

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token found');
            }
            const response = await axios.post(`${API_BASE_URL}/admin/refresh`, {}, {
              headers: { Authorization: `Bearer ${refreshToken}` }
            });
            const { access_token } = response.data;
            setAdminToken(access_token);
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return axios(originalRequest);
          } catch (refreshError) {
            setAdmin(null);
            setAdminToken(null);
            setRefreshToken(null);
            throw refreshError;
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [getAdminToken, setAdminToken, getRefreshToken, setRefreshToken]);

  useEffect(() => {
    const checkAdminToken = async () => {
      try {
        const token = getAdminToken();
        if (token) {
          const response = await axiosInstance.get('/admin/protected');
          setAdmin(response.data.logged_in_as);
        } else {
          setAdmin(null);
        }
      } catch (error) {
        console.error('Token validation failed', error);
        setAdmin(null);
        setAdminToken(null);
        setRefreshToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdminToken();
  }, [axiosInstance, getAdminToken, setAdminToken, setRefreshToken]);

  const login = useCallback(async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/login`, { username, password });
      setAdminToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);
      setAdmin(response.data.username);
      return response.data;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  }, [setAdminToken, setRefreshToken]);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/admin/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setAdminToken(null);
      setRefreshToken(null);
      setAdmin(null);
    }
  }, [axiosInstance, setAdminToken, setRefreshToken]);

  const contextValue = useMemo(() => ({
    admin,
    login,
    logout,
    loading,
    axiosInstance
  }), [admin, login, logout, loading, axiosInstance]);

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};