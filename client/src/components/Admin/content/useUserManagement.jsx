import { useState, useEffect, useCallback, useRef } from 'react';
import useAdminAPI from '../../../APIadmin';
import { useNavigate } from 'react-router-dom';

const useUserManagement = (searchParams) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('username');
  const [order, setOrder] = useState('asc');

  const adminAPIRef = useRef(useAdminAPI());
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPIRef.current.advancedSearchUsers({
        ...searchParams,
        page: page + 1,
        perPage: rowsPerPage,
        sortBy,
        order
      });
      setUsers(response.users);
      setTotalUsers(response.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortBy, order, searchParams]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleSort = useCallback((column) => {
    setSortBy(prevSortBy => {
      const newOrder = prevSortBy === column && order === 'asc' ? 'desc' : 'asc';
      setOrder(newOrder);
      return column;
    });
  }, [order]);

  const handleDeleteUser = useCallback(async (userId) => {
    try {
      await adminAPIRef.current.deleteUser(userId);
      setUsers(prevUsers => prevUsers.filter(user => user.user_id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }, []);

  const handleEditUser = useCallback((userId) => {
    navigate(`/admin/dashboard/user-profile/${userId}`); // Updated path
  }, [navigate]);

  const calculateAge = useCallback((birthDate) => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    return age;
  }, []);

  return {
    users,
    loading,
    error,
    totalUsers,
    page,
    rowsPerPage,
    sortBy,
    order,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSort,
    handleDeleteUser,
    handleEditUser,
    calculateAge,
  };
};

export default useUserManagement;