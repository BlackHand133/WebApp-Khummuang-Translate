import React, { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import Sidebar from '../Sidebar/Sidebar';
import Transcription from '../FileSpeech/Transcription';
import TextTranslation from '../TextTranslation/TextTranslation';

const Body = () => {
  const [selectedOption, setSelectedOption] = useState('text');
  const [file, setFile] = useState(null);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleFileUpload = (uploadedFile) => {
    setFile(uploadedFile);
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
      {/* Sidebar */}
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
        <Sidebar onOptionChange={handleOptionChange} onFileUpload={handleFileUpload} />
      </Box>

      {/* Main Content */}
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
        {/* แสดงไฟล์ที่อัปโหลด */}
        {file && (
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

        {/* แสดงผลลัพธ์ตามตัวเลือก */}
        {selectedOption === 'text' ? <TextTranslation /> : <Transcription file={file} />}
      </Box>
    </Box>
  );
};

export default Body;
