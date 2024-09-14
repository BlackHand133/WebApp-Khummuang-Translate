import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAdmin } from '../../ContextAdmin';
import { useNavigate } from 'react-router-dom';

const Header = ({ admin, selectedMenu }) => {
  const { logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const getTitle = () => {
    switch (selectedMenu) {
      case 'dashboard': return 'Dashboard';
      case 'users': return 'User Management';
      case 'audio': return 'Audio Records';
      case 'settings': return 'Settings';
      default: return 'Admin Dashboard';
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {getTitle()}
        </Typography>
        <Box>
          <Typography variant="subtitle1" component="span" sx={{ mr: 2 }}>
            Welcome, {admin}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;