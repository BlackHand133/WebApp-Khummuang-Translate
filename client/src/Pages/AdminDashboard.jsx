import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAdmin } from '../ContextAdmin';
import useAdminAPI from '../APIadmin';
import Sidebar from '../components/Admin/Sidebar';
import Header from '../components/Admin/Header';
import { Outlet, useLocation } from 'react-router-dom';
import DashboardOverview from '../components/Admin/content/DashboardOverview';
import UserManagement from '../components/Admin/content/UserManagement';
import SearchForm, { SearchContext } from '../components/Admin/content/SearchForm';

const AdminDashboard = () => {
  const { admin, loading: adminLoading } = useAdmin();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    query: '',
    minAge: '',
    maxAge: '',
    gender: '',
    isActive: ''
  });
  const adminAPIRef = useRef(useAdminAPI());
  const location = useLocation();

  const fetchStats = useCallback(async () => {
    if (admin && !stats) {
      setLoading(true);
      try {
        const userStats = await adminAPIRef.current.getUserStats();
        const audioStats = await adminAPIRef.current.getAudioStats(); // ดึงข้อมูลสถิติเสียง
        setStats({
          users: userStats.total_users,
          activeUsers: userStats.active_users,
          audioRecords: audioStats.total_audio_records // ใช้ค่าที่ได้
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [admin, stats]);  

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const updateSearchParams = useCallback((newParams) => {
    setSearchParams(prevParams => ({ ...prevParams, ...newParams }));
  }, []);

  const isUserManagementPage = location.pathname === '/admin/dashboard/user-management';

  const content = useMemo(() => {
    switch (location.pathname) {
      case '/admin/dashboard':
      case '/admin/dashboard/':
        return <DashboardOverview stats={stats} />;
      case '/admin/dashboard/user-management':
        return <UserManagement />;
      default:
        return <Outlet />;
    }
  }, [location.pathname, stats]);

  if (adminLoading || loading) {
    return <CircularProgress />;
  }

  return (
    <SearchContext.Provider value={{ searchParams, updateSearchParams }}>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Header admin={admin} />
          <Box sx={{ flexGrow: 1, p: 3 }}>
            {isUserManagementPage && <SearchForm />}
            {content}
          </Box>
        </Box>
      </Box>
    </SearchContext.Provider>
  );
};

export default React.memo(AdminDashboard);
