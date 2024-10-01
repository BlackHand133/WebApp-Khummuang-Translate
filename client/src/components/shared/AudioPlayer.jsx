import React from 'react';
import { Box } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const AudioPlayer = ({ audioUrl }) => (
  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', width: '100%' }}>
    <VolumeUpIcon sx={{ mr: 1, color: '#1976d2' }} />
    <audio controls src={audioUrl} style={{ width: '100%' }} />
  </Box>
);

export default AudioPlayer;