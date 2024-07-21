import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export const fetchUsers = () => API.get('/users');
export const fetchUser = (id) => API.get(`/user/${id}`);
export const updateUser = (id, user) => API.put(`/user/${id}`, user);
export const deleteUser = (id) => API.delete(`/user/${id}`);
export const createAdmin = (adminData) => API.post('/create_admin', adminData);
