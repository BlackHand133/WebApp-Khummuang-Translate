import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const hostname = window.location.hostname;
  const API_URL = import.meta.env.VITE_API_URL || `http://${hostname}:8080`;

  const initializeAuth = useCallback(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');
    const accessToken = localStorage.getItem('access_token');
    if (storedUsername && storedUserId && accessToken) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setUserId(storedUserId);
    } else {
      setIsLoggedIn(false);
      setUsername('');
      setUserId('');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await refreshToken();
            return axios(originalRequest);
          } catch (refreshError) {
            clearAuthData();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [initializeAuth]);

  const setAuthData = useCallback((username, userId, accessToken, refreshToken) => {
    setIsLoggedIn(true);
    setUsername(username);
    setUserId(userId);
    localStorage.setItem('username', username);
    localStorage.setItem('userId', userId);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }, []);

  const clearAuthData = useCallback(() => {
    setIsLoggedIn(false);
    setUsername('');
    setUserId('');
    setProfile(null);
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }, []);

  const handleTokenExpiration = useCallback((error) => {
    if (error.response && error.response.status === 401) {
      clearAuthData();
      // อาจจะเพิ่มการ redirect ไปยังหน้า login หรือแสดง notification ให้ผู้ใช้ทราบ
    }
  }, [clearAuthData]);

  const login = useCallback(async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/login`, { username, password });
      const { access_token, refresh_token, user_id } = response.data;
      setAuthData(username, user_id, access_token, refresh_token);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error.response?.data?.error || error.message);
      handleTokenExpiration(error);
      throw error;
    }
  }, [API_URL, setAuthData, handleTokenExpiration]);

  const register = useCallback(async (username, email, password, gender, birth_date) => {
    try {
      const response = await axios.post(`${API_URL}/api/register`, { username, email, password, gender, birth_date });
      const { access_token, refresh_token, user_id } = response.data;
      setAuthData(username, user_id, access_token, refresh_token);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.error || error.message);
      handleTokenExpiration(error);
      throw error;
    }
  }, [API_URL, setAuthData, handleTokenExpiration]);

  const logout = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        await axios.post(
          `${API_URL}/api/logout`,
          {},
          { 
            headers: { Authorization: `Bearer ${accessToken}` },
            withCredentials: true
          }
        );
      }
    } catch (error) {
      console.warn('Logout failed:', error.response?.data?.message || error.message);
    } finally {
      clearAuthData();
    }
  }, [API_URL, clearAuthData]);

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token found');
      const response = await axios.post(
        `${API_URL}/api/refresh`,
        {},
        { 
          headers: { Authorization: `Bearer ${refreshToken}` },
          withCredentials: true
        }
      );
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data?.error || error.message);
      clearAuthData();
      throw error;
    }
  }, [API_URL, clearAuthData]);

  const checkAuth = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found');
      const response = await axios.post(
        `${API_URL}/api/check_token`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Token check failed:', error.response?.data?.error || error.message);
      handleTokenExpiration(error);
      throw error;
    }
  }, [API_URL, handleTokenExpiration]);

  const getProfile = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found');
      
      const response = await axios.get(`${API_URL}/api/profile/${username}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true
      });
      
      setProfile(response.data);
      setError(null);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch profile:', error.response?.data?.error || error.message);
      handleTokenExpiration(error);
      setError(error.message);
      throw error;
    }
  }, [API_URL, username, handleTokenExpiration]);

  const updateProfile = useCallback(async (updatedProfileData) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found');
      
      const response = await axios.patch(`${API_URL}/api/profile/${username}`, updatedProfileData, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
        timeout: 5000
      });
      
      setProfile(response.data);
      setError(null);
      setSuccessMessage('Profile updated successfully!');
      return response.data;
    } catch (error) {
      handleTokenExpiration(error);
      if (error?.response) {
        console.error('Failed to update profile:', error.response.data.error || error.response.statusText);
        setError(error.response.data.error || `Error: ${error.response.status} ${error.response.statusText}`);
      } else if (error?.request) {
        console.error('Failed to update profile: No response received from server');
        setError('No response received from server');
      } else {
        console.error('Failed to update profile:', error.message);
        setError(`Request error: ${error.message}`);
      }
      setSuccessMessage(null);
      throw error;
    }
  }, [API_URL, username, handleTokenExpiration]);

  const setupAutoRefresh = useCallback(() => {
    const refreshInterval = 15 * 60 * 1000; // 15 นาที
    const intervalId = setInterval(async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error('Auto refresh failed:', error);
        clearInterval(intervalId);
      }
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [refreshToken]);

  useEffect(() => {
    if (isLoggedIn) {
      const cleanup = setupAutoRefresh();
      return cleanup;
    }
  }, [isLoggedIn, setupAutoRefresh]);

  const changePassword = useCallback(async (currentPassword, newPassword, confirmPassword) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found');
      
      const response = await axios.post(
        `${API_URL}/api/change-password`,
        { current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true
        }
      );
      
      setSuccessMessage('Password changed successfully!');
      setError(null);
      return response.data;
    } catch (error) {
      handleTokenExpiration(error);
      if (error.response) {
        console.error('Failed to change password:', error.response.data.error || error.response.statusText);
        setError(error.response.data.error || `Error: ${error.response.status} ${error.response.statusText}`);
      } else if (error.request) {
        console.error('Failed to change password: No response received from server');
        setError('No response received from server');
      } else {
        console.error('Failed to change password:', error.message);
        setError(`Request error: ${error.message}`);
      }
      setSuccessMessage(null);
      throw error;
    }
  }, [API_URL, handleTokenExpiration]);

  const deleteAccount = useCallback(async (password) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found');
      
      const response = await axios.delete(
        `${API_URL}/api/delete-account`,
        { 
          data: { password },
          headers: { Authorization: `Bearer ${accessToken}` },
          withCredentials: true
        }
      );
      
      clearAuthData();
      setSuccessMessage('Account deleted successfully. Audio records have been preserved.');
      setError(null);
      return response.data;
    } catch (error) {
      handleTokenExpiration(error);
      if (error.response) {
        console.error('Failed to delete account:', error.response.data.error || error.response.statusText);
        setError(error.response.data.error || `Error: ${error.response.status} ${error.response.statusText}`);
      } else if (error.request) {
        console.error('Failed to delete account: No response received from server');
        setError('No response received from server');
      } else {
        console.error('Failed to delete account:', error.message);
        setError(`Request error: ${error.message}`);
      }
      setSuccessMessage(null);
      throw error;
    }
  }, [API_URL, handleTokenExpiration, clearAuthData]);

  const contextValue = {
    isLoggedIn,
    username,
    userId,
    loading,
    profile,
    error,
    successMessage,
    login,
    register,
    logout,
    refreshToken,
    checkAuth,
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount 
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);