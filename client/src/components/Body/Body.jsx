import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Sidebar from '../Sidebar/Sidebar';
import Transcription from '../FileSpeech/Transcription';
import TextTranslation from '../TextTranslation/TextTranslation';
import SpeechMic from '../FileSpeech/SpeechMic';

const Body = () => {
  const [selectedOption, setSelectedOption] = useState('text');
  const [file, setFile] = useState(null);
  const [activeInput, setActiveInput] = useState('microphone');
  const [translatedSentence, setTranslatedSentence] = useState(''); // State สำหรับผลการแปล

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

  const handleTranslation = (translation) => {
    setTranslatedSentence(translation);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', p: 1, ml: '-7px', mr: '-7px' }}>
      <Box sx={{ width: { xs: '100%', md: '300px' }, flexShrink: 0, backgroundColor: '#ffffff', p: 1, display: 'flex', flexDirection: 'column', borderRadius: '8px' }}>
        <Sidebar onOptionChange={handleOptionChange} onFileUpload={handleFileUpload} onInputToggle={handleInputToggle} />
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 5, minHeight: '100vh', mt: 5 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <Paper sx={{ flex: 1, p: 2, borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }} elevation={3}>
            {activeInput === 'upload' && (
              <Box sx={{ width: '100%', mt: 2, mb: 2, p: 2, borderRadius: '8px', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontFamily: '"Chakra Petch", sans-serif' }}>ไฟล์เสียงที่อัปโหลด</Typography>
                <Paper sx={{ padding: '5px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {file && (
                    <>
                      <audio controls src={URL.createObjectURL(file)} style={{ width: '100%', marginTop: '10px' }} />
                      <Typography variant="body2" sx={{ mt: 1, color: '#757575' }}>{file.name}</Typography>
                    </>
                  )}
                </Paper>
              </Box>
            )}
            
            {selectedOption === 'text' ? (
              <TextTranslation />
            ) : (
              activeInput === 'microphone' ? <SpeechMic /> : <Transcription file={file} onTranslation={handleTranslation} />
            )}
          </Paper>
          <Paper sx={{ flex: 1, p: 2, borderRadius: '8px', backgroundColor: '#f5f5f5', height: '100%' }} elevation={3}>
            {translatedSentence && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontFamily: '"Chakra Petch", sans-serif' }}>
                  ผลการแปล
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {translatedSentence}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Body;
