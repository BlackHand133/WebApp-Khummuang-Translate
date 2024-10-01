import React from 'react';
import { Typography } from '@mui/material';

const ErrorDisplay = ({ error }) => (
  <Typography color="error" sx={{ mt: 2, textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif' }}>
    {error}
  </Typography>
);

export default ErrorDisplay;