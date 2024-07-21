import React, { useState } from 'react';
import UserList from './UserList';
import UserForm from './UserForm';

const AdminDashboard = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleEdit = (id) => {
    setSelectedUserId(id);
  };

  const handleUpdate = () => {
    setSelectedUserId(null);
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <UserList onEdit={handleEdit} />
      {selectedUserId && <UserForm userId={selectedUserId} onUpdate={handleUpdate} />}
    </div>
  );
};

export default AdminDashboard;
