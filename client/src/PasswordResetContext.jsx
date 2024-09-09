import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';

const PasswordResetContext = createContext();

export const PasswordResetProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const cancelTokenSource = useRef(null);

  useEffect(() => {
    return () => {
      if (cancelTokenSource.current) {
        cancelTokenSource.current.cancel('Component unmounted');
      }
    };
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    cancelTokenSource.current = axios.CancelToken.source();

    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, 
        { email },
        { 
          cancelToken: cancelTokenSource.current.token,
          timeout: 5000 // 5 seconds timeout
        }
      );
      setSuccessMessage('ส่งข้อความสำเร็จแล้ว');
      return { success: true, message: 'ส่งข้อความสำเร็จแล้ว' };
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request canceled:', err.message);
        setError('การส่งคำขอถูกยกเลิก');
      } else if (err.response) {
        // การตอบสนองจากเซิร์ฟเวอร์ด้วยสถานะข้อผิดพลาด
        setError(err.response.data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      } else if (err.request) {
        // คำขอถูกส่งแต่ไม่ได้รับการตอบกลับ
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อของคุณ');
      } else {
        // เกิดข้อผิดพลาดในการตั้งค่าคำขอ
        setError('เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง');
      }
      return { success: false, error: error };
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const resetPassword = useCallback(async (token, newPassword) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, { token, new_password: newPassword });
      setSuccessMessage('รีเซ็ตรหัสผ่านสำเร็จแล้ว');
      return { success: true, message: 'รีเซ็ตรหัสผ่านสำเร็จแล้ว' };
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน กรุณาลองใหม่อีกครั้ง');
      } else if (err.request) {
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อของคุณ');
      } else {
        setError('เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง');
      }
      return { success: false, error: error };
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const contextValue = {
    loading,
    error,
    successMessage,
    forgotPassword,
    resetPassword,
    clearMessages,
  };

  return (
    <PasswordResetContext.Provider value={contextValue}>
      {children}
    </PasswordResetContext.Provider>
  );
};

export const usePasswordReset = () => useContext(PasswordResetContext);