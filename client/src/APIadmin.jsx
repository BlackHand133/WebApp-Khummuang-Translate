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

    getUserAudioRecords: async (userId, page = 1, perPage = 10) => {
      const response = await axiosInstance.get(`/admin/users/${userId}/audio_records`, {
        params: { page, per_page: perPage }
      });
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

  }), [axiosInstance]);
};

export default useAdminAPI;