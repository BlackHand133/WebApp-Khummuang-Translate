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
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8080/api/login', { username, password });
      const { access_token, refresh_token, user_id } = response.data;
      setIsLoggedIn(true);
      setUsername(username);
      setUserId(user_id);
      localStorage.setItem('username', username);
      localStorage.setItem('userId', user_id);
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error.message || error);
      throw error;
    }
  };

  const register = async (username, email, password, gender, birth_date) => {
    try {
      const response = await axios.post('http://localhost:8080/api/register', { username, email, password, gender, birth_date });
      const { access_token, refresh_token, user_id } = response.data;
      setIsLoggedIn(true);
      setUsername(username);
      setUserId(user_id);
      localStorage.setItem('username', username);
      localStorage.setItem('userId', user_id);
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error.message || error);
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
            withCredentials: true // เพื่อให้ axios ส่งและรับ cookies
          }
        );
      }
    } catch (error) {
      console.warn('Logout failed:', error.message);
    } finally {
      clearAuthData();
    }
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
      console.error('Token refresh failed:', error.message || error);
      if (error.response && error.response.status === 401) {
        clearAuthData();
      }
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
      console.error('Token check failed:', error.message || error);
      if (error.response && error.response.status === 401) {
        clearAuthData();
      }
      throw error;
    }
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
        checkAuth 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);