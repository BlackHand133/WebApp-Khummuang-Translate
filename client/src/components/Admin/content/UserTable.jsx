import React from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Chip, TableSortLabel
} from '@mui/material';

const UserTable = ({ users, sortBy, order, handleSort, handleEditUser, openDeleteDialog, calculateAge }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'username'}
                direction={sortBy === 'username' ? order : 'asc'}
                onClick={() => handleSort('username')}
              >
                Username
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'email'}
                direction={sortBy === 'email' ? order : 'asc'}
                onClick={() => handleSort('email')}
              >
                Email
              </TableSortLabel>
            </TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Gender</TableCell>
            <TableCell>Age</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.user_id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Chip 
                  label={user.is_active ? 'Active' : 'Inactive'} 
                  color={user.is_active ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell>{user.gender}</TableCell>
              <TableCell>{calculateAge(user.birth_date)}</TableCell>
              <TableCell>
                <Button onClick={() => handleEditUser(user.user_id)} color="primary">Edit</Button>
                <Button onClick={() => openDeleteDialog(user.user_id)} color="secondary">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
