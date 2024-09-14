import React from 'react';
import { Box, Typography, CircularProgress, Alert, TablePagination } from '@mui/material';
import UserTable from './UserTable';
import { useSearch } from './SearchForm';
import useUserManagement from './useUserManagement'; // We'll create this custom hook

const UserManagement = () => {
  const { searchParams } = useSearch();
  const {
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
  } = useUserManagement(searchParams);

  if (loading && users.length === 0) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      <UserTable 
        users={users}
        sortBy={sortBy}
        order={order}
        handleSort={handleSort}
        handleEditUser={handleEditUser}
        openDeleteDialog={handleDeleteUser}
        calculateAge={calculateAge}
      />
      <TablePagination
        component="div"
        count={totalUsers}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default UserManagement;