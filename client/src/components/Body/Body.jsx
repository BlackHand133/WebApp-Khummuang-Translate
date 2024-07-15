import React from 'react';
import { Box } from '@mui/material';
import Transcription from '../FileSpeech/Transcription';

const Body = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0', // เปลี่ยนสีตามที่ต้องการ
      }}
    >
      <Transcription/>
    </Box>
  );
}

export default Body;
