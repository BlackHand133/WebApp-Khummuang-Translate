import React, { useState, useEffect } from 'react';
import { fetchUser, updateUser } from '../services/api';
import { TextField, Button } from '@mui/material';

const UserForm = ({ userId, onUpdate }) => {
  const [user, setUser] = useState({ username: '', email: '' });

  useEffect(() => {
    if (userId) {
      const getUser = async () => {
        const response = await fetchUser(userId);
        setUser(response.data);
      };
      getUser();
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUser(userId, user);
    onUpdate();
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField name="username" label="Username" value={user.username} onChange={handleChange} />
      <TextField name="email" label="Email" value={user.email} onChange={handleChange} />
      <Button type="submit">Update</Button>
    </form>
  );
};

export default UserForm;
