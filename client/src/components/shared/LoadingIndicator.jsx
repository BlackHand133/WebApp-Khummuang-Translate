import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const LoadingIndicator = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
    <CircularProgress size={24} />
  </Box>
);

export default LoadingIndicator;