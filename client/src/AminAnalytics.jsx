import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useAdmin } from './ContextAdmin';
import axios from 'axios';

export const AdminAnalyticsContext = createContext();

const RETRY_COUNT = 3;
const RETRY_DELAY = 1000; // 1 second

export const AdminAnalyticsProvider = ({ children }) => {
  const { axiosInstance, admin } = useAdmin();
  const [state, setState] = useState({
    audioRecords: null,
    audioStatistics: null,
    translationStatistics: null,
    translationTrendAnalysis: null,
    userActivity: null,
    userSegmentation: null,
    contentAnalysis: null,
    performanceMetrics: null,
    loading: false,
    error: null
  });

  const setPartialState = (newState) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  const fetchWithRetry = useCallback(async (url, params, retryCount = 0) => {
    try {
      const response = await axiosInstance.get(url, { params });
      return response.data;
    } catch (error) {
      if (retryCount < RETRY_COUNT) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, params, retryCount + 1);
      }
      throw error;
    }
  }, [axiosInstance]);

  const createFetchFunction = (url, stateKey) => {
    return async (params) => {
      setPartialState({ loading: true, error: null });
      try {
        const data = await fetchWithRetry(url, params);
        setPartialState({ [stateKey]: data });
      } catch (error) {
        setPartialState({ 
          error: { 
            message: `Failed to fetch ${stateKey}`, 
            details: error.message 
          } 
        });
        console.error(error);
      } finally {
        setPartialState({ loading: false });
      }
    };
  };

  const fetchAudioRecords = useCallback(createFetchFunction('/admin/analytics/audio_records', 'audioRecords'), []);
  const fetchAudioStatistics = useCallback(createFetchFunction('/admin/analytics/advanced_audio_statistics', 'audioStatistics'), []);
  const fetchTranslationStatistics = useCallback(createFetchFunction('/admin/analytics/translation_statistics', 'translationStatistics'), []);
  const fetchTranslationTrendAnalysis = useCallback(createFetchFunction('/admin/analytics/translation_trend_analysis', 'translationTrendAnalysis'), []);
  const fetchUserActivity = useCallback(createFetchFunction('/admin/analytics/user_activity', 'userActivity'), []);
  const fetchUserSegmentation = useCallback(createFetchFunction('/admin/analytics/user_segmentation', 'userSegmentation'), []);
  const fetchContentAnalysis = useCallback(createFetchFunction('/admin/analytics/content_analysis', 'contentAnalysis'), []);
  const fetchPerformanceMetrics = useCallback(createFetchFunction('/admin/analytics/performance_metrics', 'performanceMetrics'), []);

  const fetchAllAnalytics = useCallback(async (params) => {
    setPartialState({ loading: true, error: null });
    try {
      const controller = new AbortController();
      const signal = controller.signal;

      const fetchFunctions = [
        fetchAudioRecords,
        fetchAudioStatistics,
        fetchTranslationStatistics,
        fetchTranslationTrendAnalysis,
        fetchUserActivity,
        fetchUserSegmentation,
        fetchContentAnalysis,
        fetchPerformanceMetrics
      ];

      await Promise.all(fetchFunctions.map(fetch => fetch({ ...params, signal })));
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled', error.message);
      } else {
        setPartialState({ 
          error: { 
            message: 'Failed to fetch all analytics', 
            details: error.message 
          } 
        });
        console.error(error);
      }
    } finally {
      setPartialState({ loading: false });
    }
  }, [fetchAudioRecords, fetchAudioStatistics, fetchTranslationStatistics, fetchTranslationTrendAnalysis, fetchUserActivity, fetchUserSegmentation, fetchContentAnalysis, fetchPerformanceMetrics]);

  useEffect(() => {
    if (admin) {
      const controller = new AbortController();
      fetchAllAnalytics({ signal: controller.signal });
      return () => controller.abort();
    }
  }, [admin, fetchAllAnalytics]);

  const contextValue = useMemo(() => ({
    ...state,
    fetchAudioRecords,
    fetchAudioStatistics,
    fetchTranslationStatistics,
    fetchTranslationTrendAnalysis,
    fetchUserActivity,
    fetchUserSegmentation,
    fetchContentAnalysis,
    fetchPerformanceMetrics,
    fetchAllAnalytics
  }), [state, fetchAudioRecords, fetchAudioStatistics, fetchTranslationStatistics, fetchTranslationTrendAnalysis, fetchUserActivity, fetchUserSegmentation, fetchContentAnalysis, fetchPerformanceMetrics, fetchAllAnalytics]);

  return (
    <AdminAnalyticsContext.Provider value={contextValue}>
      {children}
    </AdminAnalyticsContext.Provider>
  );
};

export const useAdminAnalytics = () => {
  const context = useContext(AdminAnalyticsContext);
  if (context === undefined) {
    throw new Error('useAdminAnalytics must be used within an AdminAnalyticsProvider');
  }
  return context;
};