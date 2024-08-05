import React, { useState } from 'react';
import { Box, Paper, Typography, TextField } from '@mui/material';
import Sidebar from '../Sidebar/Sidebar';
import Transcription from '../FileSpeech/Transcription';
import TextTranslation from '../TextTranslation/TextTranslation';
import SpeechMic from '../FileSpeech/SpeechMic';

const Body = () => {
  const [selectedOption, setSelectedOption] = useState('text');
  const [file, setFile] = useState(null);
  const [activeInput, setActiveInput] = useState('microphone');
  const [inputText, setInputText] = useState('');
  const [translationUpload, setTranslationUpload] = useState('');
  const [translationMic, setTranslationMic] = useState('');

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setActiveInput(option === 'upload' ? 'upload' : 'microphone');
  };

  const handleFileUpload = (uploadedFile) => {
    setFile(uploadedFile);
  };

  const handleInputToggle = (input) => {
    setActiveInput(input);
  };

  const handleTextChange = (event) => {
    setInputText(event.target.value);
  };

  const handleTranslationUpload = (translation) => {
    setTranslationUpload(translation);
  };

  const handleTranslationMic = (translation) => {
    setTranslationMic(translation);
  };

  const clearTranslation = () => {
    setTranslationUpload('');
    setTranslationMic('');
  };

  const handleStartRecording = () => {
    if (speechMicRef.current) {
      speechMicRef.current.startRecording();
    }
  };

  const handleStopRecording = () => {
    if (speechMicRef.current) {
      speechMicRef.current.stopRecording();
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', p: 1, ml: '-7px', mr: '-7px' }}>
      <Box sx={{ width: { xs: '100%', md: '300px' }, flexShrink: 0, backgroundColor: '#ffffff', p: 1, display: 'flex', flexDirection: 'column', borderRadius: '8px' }}>
        <Sidebar onOptionChange={handleOptionChange} onFileUpload={handleFileUpload} onInputToggle={handleInputToggle} />
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 5, minHeight: '100vh', mt: 5 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <Paper sx={{ flex: 1, p: 2, borderRadius: '8px', display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#EFEFEF' }} elevation={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {activeInput === 'upload' && (
                <Box sx={{ width: '100%', mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Paper sx={{ p: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontFamily: '"Chakra Petch", sans-serif' }}>
                          ไฟล์เสียงที่อัปโหลด
                        </Typography>
                        <Box sx={{ position: 'relative', width: '100%', mt: 1 }}>
                          {!file ? (
                            <Box sx={{
                              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              backgroundColor: '#f5f5f5', borderRadius: 1,
                              opacity: 0.6, textAlign: 'center',mt:7
                            }}>
                              <Typography variant="body1" sx={{ color: '#404040' }}>
                                กรุณาอัปโหลดไฟล์เสียง
                              </Typography>
                            </Box>
                          ) : null}
                          {file && (
                            <>
                              <audio controls src={URL.createObjectURL(file)} style={{ width: '100%' }} />
                              <Typography variant="body2" sx={{ mt: 1, color: '#757575', textAlign: 'center' }}>{file.name}</Typography>
                            </>
                          )}
                        </Box>
                      </Paper>
                </Box>
              )}

              {selectedOption === 'text' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Paper sx={{ p:1 }} >
                    <TextField
                      label="ป้อนข้อความ"
                      multiline
                      variant="outlined"
                      value={inputText}
                      onChange={handleTextChange}
                      fullWidth
                      sx={{ flex: 1, mb: 2, minHeight: '200px', resize: 'vertical', mt: 1 ,fontFamily: '"Chakra Petch", sans-serif'}}
                      maxRows={20}
                    />
                  </Paper>
                </Box>
              )}

              {selectedOption !== 'text' && (
                activeInput === 'microphone' ? (
                  <SpeechMic onTranslation={handleTranslationMic} />
                ) : (
                  <Transcription file={file} onTranslation={handleTranslationUpload} />
                )
              )}
            </Box>
          </Paper>

          <Paper sx={{ flex: 1, p: 2, borderRadius: '8px', backgroundColor: '#f5f5f5', height: '100%' }} elevation={3}>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ bgcolor: 'black', p: 1, borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Typography variant="h6" sx={{ fontFamily: '"Chakra Petch", sans-serif', color: 'white' }}>
                  ผลการแปล
                </Typography>
              </Box>
              {selectedOption === 'text' && (
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <TextTranslation textToTranslate={inputText} onClearTranslation={clearTranslation} />
                </Box>
              )}
              {activeInput === 'upload' && translationUpload && (
                <Paper elevation={3} sx={{ mt: 2, p: 2, borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
                  <Typography variant="body1" sx={{ mt: 1, fontFamily: '"Chakra Petch", sans-serif', fontWeight: '500' }}>
                    {translationUpload}
                  </Typography>
                </Paper>
              )}
              {activeInput === 'microphone' && translationMic && (
                <Paper elevation={3} sx={{ mt: 2, p: 2, borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {translationMic}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Body;
