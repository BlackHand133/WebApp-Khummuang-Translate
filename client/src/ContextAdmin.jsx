import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันเพื่อดึง token ของ admin จาก cookies
  const getAdminToken = () => {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('admin_token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
    return null;
  };

  useEffect(() => {
    const checkAdminToken = async () => {
      try {
        const token = getAdminToken();
        if (token) {
          const response = await axios.get('http://localhost:8080/api/admin/protected', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setAdmin(response.data.logged_in_as);
        } else {
          setAdmin(null);
        }
      } catch (error) {
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdminToken();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8080/api/admin/login', { username, password });
      document.cookie = `admin_token=${response.data.access_token}`; // เก็บ token ของ admin ใน cookies
      setAdmin(response.data.username);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = getAdminToken(); // Get the token ของ admin
      if (token) {
        await axios.post('http://localhost:8080/api/admin/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT'; // ลบ token ของ admin
      setAdmin(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/admin/refresh', {}, {
        headers: {
          Authorization: `Bearer ${getAdminToken()}`
        }
      });
      document.cookie = `admin_token=${response.data.access_token}`; // อัพเดต token ของ admin ใน cookies
      return response.data;
    } catch (error) {
      console.error('Token refresh failed', error);
    }
  };

  return (
    <AdminContext.Provider value={{ admin, login, logout, refreshToken, loading }}>
      {children}
    </AdminContext.Provider>
  );
};
