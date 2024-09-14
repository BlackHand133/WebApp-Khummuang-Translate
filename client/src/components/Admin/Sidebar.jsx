import React, { useState, useEffect, useCallback } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Badge, CircularProgress } from '@mui/material';
import { Dashboard, People, Settings, AudiotrackOutlined } from '@mui/icons-material';
import { useAdmin } from '../../ContextAdmin';
import useAdminAPI from '../../APIadmin';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const { admin } = useAdmin();
  const adminAPI = useAdminAPI();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchUserStats = useCallback(async () => {
    if (admin && !userStats) {
      setLoading(true);
      try {
        const stats = await adminAPI.getUserStats();
        setUserStats(stats);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [admin, adminAPI, userStats]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, key: 'dashboard', path: '/admin/dashboard' },
    { 
      text: 'Users', 
      icon: <People />, 
      key: 'users',
      path: '/admin/dashboard/user-management',
      badge: loading ? <CircularProgress size={14} /> : userStats?.total_users 
    },
    { text: 'Audio Records', icon: <AudiotrackOutlined />, key: 'audio', path: '/admin/dashboard/audio-records' },
    { text: 'Settings', icon: <Settings />, key: 'settings', path: '/admin/dashboard/settings' },
  ];

  const handleMenuSelect = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ width: 240, flexShrink: 0, borderRight: 1, borderColor: 'divider' }}>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.key} 
            onClick={() => handleMenuSelect(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>
              {item.badge !== undefined ? (
                <Badge badgeContent={item.badge} color="primary">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;