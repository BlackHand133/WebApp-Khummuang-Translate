import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { People, AudiotrackOutlined } from '@mui/icons-material';

const DashboardOverview = React.memo(({ stats }) => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard Overview</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <People sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h4">{stats?.users || 'Loading...'}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <People sx={{ fontSize: 40, mb: 1, color: 'green' }} />
            <Typography variant="h6">Active Users</Typography>
            <Typography variant="h4">{stats?.activeUsers || 'Loading...'}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AudiotrackOutlined sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Total Audio Records</Typography>
            <Typography variant="h4">{stats?.audioRecords || 'N/A'}</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
});

export default DashboardOverview;