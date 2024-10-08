import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

export const ApiProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hostname = window.location.hostname;
  const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${hostname}:8080/api`;
  const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws').replace('/api', '');
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(WS_BASE_URL, {
      transports: ['websocket', 'polling'],
      path: '/socket.io'
    });
  
    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket');
    });
  
    socketRef.current.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setError('Failed to connect to WebSocket');
    });
  
    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });
  
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [WS_BASE_URL]);

  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
  });

  const transcribe = async (file, language, userId = 'guest') => {
    setLoading(true);
    setError(null);
  
    const apiLanguage = language === 'ไทย' ? 'th' : language === 'คำเมือง' ? 'km' : language;
  
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds the maximum limit of 10 MB');
      setLoading(false);
      throw new Error('File size exceeds limit');
    }
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', apiLanguage);
    formData.append('user_id', userId);
  
    try {
      const response = await api.post('/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLoading(false);
      return {
        transcription: response.data.transcription,
        recordId: response.data.record_id,
        hashedId: response.data.hashed_id,
        status: response.data.status
      };
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.details || 'An error occurred during transcription');
      setLoading(false);
      throw err;
    }
  };

  const translate = async (text, sourceLang, targetLang) => {
    setLoading(true);
    setError(null);

    // Mapping language to API expected values
    const apiSourceLang = sourceLang === 'ไทย' ? 'th' : sourceLang === 'คำเมือง' ? 'km' : sourceLang;
    const apiTargetLang = targetLang === 'ไทย' ? 'th' : targetLang === 'คำเมือง' ? 'km' : targetLang;

    try {
      const response = await api.post('/translate', {
        text,
        source_lang: apiSourceLang,
        target_lang: apiTargetLang
      });
      setLoading(false);
      return response.data.translation;
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.details || 'An error occurred during translation');
      setLoading(false);
      throw err;
    }
  };

  const translateWs = (text, sourceLang, targetLang) => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);

      const apiSourceLang = sourceLang === 'ไทย' ? 'th' : sourceLang === 'คำเมือง' ? 'km' : sourceLang;
      const apiTargetLang = targetLang === 'ไทย' ? 'th' : targetLang === 'คำเมือง' ? 'km' : targetLang;

      socketRef.current.emit('translate', {
        text,
        source_lang: apiSourceLang,
        target_lang: apiTargetLang
      });

      socketRef.current.once('translation_result', (data) => {
        setLoading(false);
        if (data.type === 'translation') {
          resolve(data.text);
        } else if (data.type === 'error') {
          setError(data.message);
          reject(new Error(data.message));
        }
      });
    });
  };

  const transcribeMic = async (formData) => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await api.post('/transcribe_Mic', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLoading(false);
      return {
        transcription: response.data.transcription,
        recordId: response.data.record_id,
        hashedId: response.data.hashed_id
      };
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.details || 'An error occurred during microphone transcription');
      setLoading(false);
      throw err;
    }
  };

  const testConnection = async () => {
    try {
      const response = await api.get('/test');
      return response.data.message;
    } catch (err) {
      throw new Error('Failed to connect to the service');
    }
  };

  const recordAudio = async (formData) => {
    setLoading(true);
    setError(null);
  
    try {
      if (!formData.has('source')) {
        formData.append('source', 'UPLOAD');
      }
  
      const response = await api.post('/record_audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLoading(false);
      return {
        recordId: response.data.record_id,
        hashedId: response.data.hashed_id,
        status: response.data.status,
        message: response.data.message
      };
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while recording audio');
      setLoading(false);
      throw err;
    }
  };

  const updateRating = async (identifier, rating) => {
    setLoading(true);
    setError(null);
  
    try {
      console.log('Sending update rating request:', { identifier, rating });
      const response = await api.post('/update_audio_rating', {
        identifier,
        rating
      });
      console.log('Update rating response:', response.data);
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error updating rating:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.error || 'An error occurred while updating rating');
      setLoading(false);
      throw err;
    }
  };

  const getAudioRecords = async (userId, page = 1, perPage = 10) => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await api.get('/get_audio_records', {
        params: { user_id: userId, page, per_page: perPage }
      });
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while fetching audio records');
      setLoading(false);
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };


  const value = {
    transcribe,
    translate,
    translateWs,
    socketRef,
    transcribeMic,
    recordAudio,
    testConnection,
    loading,
    error,
    updateRating,
    getAudioRecords,
    clearError
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};