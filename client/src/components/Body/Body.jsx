import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from '../Sidebar/Sidebar';
import Transcription from '../FileSpeech/Transcription';
import TextTranslation from '../TextTranslation/TextTranslation';

const Body = () => {
  const [selectedOption, setSelectedOption] = useState('text');

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f0f0f0',
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: { xs: '100%', md: '300px' },
          flexShrink: 0,
          backgroundColor: '#ffffff',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Sidebar onOptionChange={handleOptionChange} />
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
          minHeight: '100vh', // ทำให้แน่ใจว่าเนื้อหาหลักจะขยายอย่างน้อยความสูงของหน้าจอ
        }}
      >
        {selectedOption === 'text' ? <TextTranslation /> : <Transcription />}
      </Box>
    </Box>
  );
};

export default Body;
