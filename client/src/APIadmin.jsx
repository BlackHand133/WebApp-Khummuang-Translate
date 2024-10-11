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

    getAudioRecords: async (page = 1, perPage = 10, sortBy = 'created_at', order = 'desc', searchParams = {}) => {
      const response = await axiosInstance.get('/admin/audio-records', {
        params: { 
          page, 
          per_page: perPage, 
          sort_by: sortBy, 
          order,
          ...searchParams
        }
      });
      return response.data;
    },

    getAudioRecordDetails: async (hashedId) => {
      const response = await axiosInstance.get(`/admin/audio-records/${hashedId}`);
      return response.data;
    },

    deleteAudioRecord: async (hashedId) => {
      const response = await axiosInstance.delete(`/admin/audio-records/${hashedId}`);
      return response.data;
    },

    streamAudio: (hashedId) => {
      return axiosInstance.get(`/admin/audio/${hashedId}/stream`, {
        responseType: 'blob'
      });
    },

    getAudioStats: async () => {
      const response = await axiosInstance.get('/admin/audio-records/stats');
      return response.data;
    },


  }), [axiosInstance]);
};

export default useAdminAPI;