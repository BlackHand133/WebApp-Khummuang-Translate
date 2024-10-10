import { useMemo } from 'react';
import { useAdmin } from './ContextAdmin';

const useAdminAPI = () => {
  const { axiosInstance } = useAdmin();

  return useMemo(() => ({
    getAllUsers: async (page = 1, perPage = 10, sortBy = 'username', order = 'asc') => {
      const response = await axiosInstance.get('/admin/users', {
        params: { page, per_page: perPage, sort_by: sortBy, order }
      });
      return response.data;
    },

    getUserDetails: async (userId) => {
      const response = await axiosInstance.get(`/admin/users/${userId}`);
      return response.data;
    },

    updateUser: async (userId, userData) => {
      const response = await axiosInstance.put(`/admin/users/${userId}`, userData);
      return response.data;
    },

    deleteUser: async (userId) => {
      const response = await axiosInstance.delete(`/admin/users/${userId}`);
      return response.data;
    },

    getUserStats: async () => {
      const response = await axiosInstance.get('/admin/users/stats');
      return response.data;
    },

    searchUsers: async (query, page = 1, perPage = 10) => {
      const response = await axiosInstance.get('/admin/users/search', {
        params: { q: query, page, per_page: perPage }
      });
      return response.data;
    },

    advancedSearchUsers: async (params) => {
      const response = await axiosInstance.get('/admin/users/advanced-search', { params });
      return response.data;
    },

    getAudioRecords: async (page = 1, perPage = 10, sortBy = 'created_at', order = 'desc') => {
      const response = await axiosInstance.get('/admin/audio-records', {
        params: { page, per_page: perPage, sort_by: sortBy, order }
      });
      return response.data;
    },

    getAudioRecordDetails: async (hashedId) => {
      const response = await axiosInstance.get(`/admin/audio-records/${hashedId}`);
      return response.data;
    },

    streamAudio: (hashedId) => {
      const hostname = window.location.hostname;
      const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${hostname}:8080/api`;
      return `${API_BASE_URL}/admin/audio/${hashedId}/stream`;
    },

  }), [axiosInstance]);
};

export default useAdminAPI;