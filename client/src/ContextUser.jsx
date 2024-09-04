import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null); // เพิ่ม state สำหรับ profile
  const [error, setError] = useState(null); // เพิ่ม state สำหรับ error

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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
      const response = await axios.post(`${API_URL}/api/login`, { username, password });
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
      const response = await axios.post(`${API_URL}/api/register`, { username, email, password, gender, birth_date });
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
  };
  

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('No refresh token found');
      const response = await axios.post(
        `${API_URL}/api/refresh`,
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
        `${API_URL}/api/check_token`,
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

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/api/forgot_password`, { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password request failed:', error.response?.data?.error || error.message);
      throw error;
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/reset_password`,
        { new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Password reset failed:', error.response?.data?.error || error.message);
      throw error;
    }
  };

  const fetchProfile = async () => {
    try {
      const profile = await getProfile();
      // ทำสิ่งที่ต้องการกับข้อมูลโปรไฟล์
    } catch (error) {
      console.error('Error fetching profile:', error);
      // อาจจะแสดงข้อความแสดงข้อผิดพลาดหรือทำการจัดการอื่น ๆ
    }
  };

  
  const getProfile = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) throw new Error('No access token found');
      
      const response = await axios.get(`${API_URL}/api/profile/${username}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true
      });
      
      return response.data;
    } catch (error) {
      if (error.response) {
        // ข้อความข้อผิดพลาดจากเซิร์ฟเวอร์
        console.error('Failed to fetch profile:', error.response.data.error || error.message);
      } else {
        // ข้อความข้อผิดพลาดอื่น ๆ
        console.error('Failed to fetch profile:', error.message);
      }
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
        profile, // เพิ่ม profile
        error, // เพิ่ม error
        login, 
        register, 
        logout, 
        refreshToken, 
        checkAuth,
        forgotPassword,
        resetPassword,
        getProfile // เพิ่ม getProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
