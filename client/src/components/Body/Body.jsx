import React, { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import Sidebar from '../Sidebar/Sidebar';
import Transcription from '../FileSpeech/Transcription';
import TextTranslation from '../TextTranslation/TextTranslation';
import SpeechMic from '../FileSpeech/SpeechMic';

const Body = () => {
  const [selectedOption, setSelectedOption] = useState('text');
  const [file, setFile] = useState(null);
  const [activeInput, setActiveInput] = useState('microphone');

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    if (option === 'text') {
      setActiveInput('microphone'); // กลับไปที่ microphone เมื่อลงเลือก 'text'
    }
  };

  const handleFileUpload = (uploadedFile) => {
    setFile(uploadedFile);
  };

  const handleInputToggle = (input) => {
    setActiveInput(input);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f0f0f0',
        p: 2,
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', md: '300px' },
          flexShrink: 0,
          backgroundColor: '#ffffff',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '8px',
        }}
      >
        <Sidebar
          onOptionChange={handleOptionChange}
          onFileUpload={handleFileUpload}
          onInputToggle={handleInputToggle}
        />
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
        }}
      >
        {file && selectedOption === 'voice' && activeInput === 'upload' && (
          <Paper
            sx={{
              mt: 5,
              mb: 3,
              p: 2,
              borderRadius: '8px',
              backgroundColor: '#fafafa',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            elevation={3}
          >
            <Typography variant="h6">ไฟล์เสียงที่อัปโหลด:</Typography>
            <audio controls src={URL.createObjectURL(file)} style={{ width: '100%', marginTop: '10px' }} />
            <Typography variant="body2" sx={{ mt: 1, color: '#757575' }}>
              {file.name}
            </Typography>
          </Paper>
        )}

        {selectedOption === 'text' ? (
          <TextTranslation />
        ) : (
          activeInput === 'microphone' ? <SpeechMic /> : <Transcription file={file} />
        )}
      </Box>
    </Box>
  );
};

export default Body;
