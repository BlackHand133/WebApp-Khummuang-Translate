import React, { useEffect, useState } from 'react';
import { fetchUsers, deleteUser } from '../services/api';
import { Button, List, ListItem, ListItemText } from '@mui/material';

const UserList = ({ onEdit }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getUsers = async () => {
      const response = await fetchUsers();
      setUsers(response.data);
    };
    getUsers();
  }, []);

  const handleDelete = async (id) => {
    await deleteUser(id);
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <List>
      {users.map(user => (
        <ListItem key={user.id}>
          <ListItemText primary={user.username} secondary={user.email} />
          <Button onClick={() => onEdit(user.id)}>Edit</Button>
          <Button onClick={() => handleDelete(user.id)}>Delete</Button>
        </ListItem>
      ))}
    </List>
  );
};

export default UserList;
