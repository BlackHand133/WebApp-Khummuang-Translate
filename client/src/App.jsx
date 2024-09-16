import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Navbar from './components/Navbar/Navbar';
import Body from './components/Body/Body';
import { Outlet } from 'react-router-dom';

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden'  // ป้องกันการเลื่อนที่ระดับ root
    }}>
      <Navbar />
      <Box component="main" sx={{ 
        flexGrow: 1, 
        overflow: 'auto',  // อนุญาตให้เลื่อนได้ภายในส่วน main
        pt: { xs: '0px', sm: '0px' },  // ปรับ padding-top ตามความสูงของ Navbar
        pb: { xs: '56px', sm: '64px' }  // ปรับ padding-bottom ตามความสูงของ Footer
      }}>
        <Outlet />
      </Box>
      <Body />
    </Box>
  );
}

export default App;