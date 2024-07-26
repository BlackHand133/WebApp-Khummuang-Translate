import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from '../Sidebar/Sidebar';
import Transcription from '../FileSpeech/Transcription';
import TextTranslation from '../TextTranslation/TextTranslation'; // สมมติว่ามี component นี้

const Body = () => {
  const [selectedOption, setSelectedOption] = useState('text');

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        backgroundColor: '#f0f0f0',
      }}
    >
      {/* Sidebar */}
      <Box sx={{ width: '300px', flexShrink: 0 }}>
        <Sidebar onOptionChange={handleOptionChange} />
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
        }}
      >
        {selectedOption === 'text' ? <TextTranslation /> : <Transcription />}
      </Box>
    </Box>
  );
}

export default Body;