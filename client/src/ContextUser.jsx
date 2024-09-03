import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const storedUsername = localStorage.getItem('username');
      const storedUserId = localStorage.getItem('userId');
      const accessToken = localStorage.getItem('access_token');
      if (storedUsername && storedUserId && accessToken) {
        setIsLoggedIn(true);
        setUsername(storedUsername);
        setUserId(storedUserId);
      }
      setLoading(false);
    };
    initializeAuth();

    // ตั้งค่า axios interceptors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
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
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8080/api/login', { username, password });
      const { access_token, refresh_token, user_id } = response.data;
      setAuthData(username, user_id, access_token, refresh_token);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error.response?.data?.error || error.message);
      throw error;
    }
  };

  const register = async (username, email, password, gender, birth_date) => {
    try {
      const response = await axios.post('http://localhost:8080/api/register', { username, email, password, gender, birth_date });
      const { access_token, refresh_token, user_id } = response.data;
      setAuthData(username, user_id, access_token, refresh_token);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.error || error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        await axios.post(
          'http://localhost:8080/api/logout',
          {},
          { 
            headers: { Authorization: `Bearer ${accessToken}` },
            withCredentials: true
          }
        );
      }
    } catch (error) {
      console.warn('Logout failed:', error.message);
    } finally {
      clearAuthData();
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token found');
      const response = await axios.post(
        'http://localhost:8080/api/refresh',
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );
      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data?.error || error.message);
      clearAuthData();
      throw error;
    }
  };

  const checkAuth = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found');
      const response = await axios.post(
        'http://localhost:8080/api/check_token',
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Token check failed:', error.response?.data?.error || error.message);
      if (error.response && error.response.status === 401) {
        clearAuthData();
      }
      throw error;
    }
  };

  const updateProfile = async (userId, profileData) => {
    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await axios.put(
        `http://localhost:8080/api/profile/${userId}`,
        profileData,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Profile update failed:', error.response?.data?.error || error.message);
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('http://localhost:8080/api/forgot_password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password request failed:', error.response?.data?.error || error.message);
      throw error;
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/reset_password',
        { new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Password reset failed:', error.response?.data?.error || error.message);
      throw error;
    }
  };

  const setAuthData = (username, userId, accessToken, refreshToken) => {
    setIsLoggedIn(true);
    setUsername(username);
    setUserId(userId);
    localStorage.setItem('username', username);
    localStorage.setItem('userId', userId);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  };

  const clearAuthData = () => {
    setIsLoggedIn(false);
    setUsername('');
    setUserId('');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  return (
    <UserContext.Provider 
      value={{ 
        isLoggedIn, 
        username, 
        userId, 
        loading, 
        login, 
        register, 
        logout, 
        refreshToken, 
        checkAuth,
        updateProfile,
        forgotPassword,
        resetPassword
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);