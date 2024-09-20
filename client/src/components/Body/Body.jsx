import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import { Box, Paper, Typography, TextField, InputAdornment, Alert, Container, useTheme, useMediaQuery, Button, IconButton } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import TranslateIcon from '@mui/icons-material/Translate';
import InfoIcon from '@mui/icons-material/Info';
import Sidebar from '../Sidebar/Sidebar';
import Transcription from '../FileSpeech/Transcription';
import TextTranslation from '../TextTranslation/TextTranslation';
import SpeechMic from '../FileSpeech/SpeechMic';
import MobileMenu from '../MobileMenu/MobileMenu';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';


const Body = ({username}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedOption, setSelectedOption] = useState('text');
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [activeInput, setActiveInput] = useState('microphone');
  const [inputText, setInputText] = useState('');
  const [translations, setTranslations] = useState({
    text: '',
    upload: '',
    microphone: ''
  });
  const [Textlanguage, setTextLanguage] = useState('คำเมือง');
  const [Voicelanguage, setVoiceLanguage] = useState('คำเมือง');
  const [translatedText, setTranslatedText] = useState('');
  const [debouncedInputText, setDebouncedInputText] = useState('');
  

  // Lifted state from SpeechMic
  const [transcription, setTranscription] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const audioUrlRef = useRef(null);
  const [transcriptionStatus, setTranscriptionStatus] = useState('');
  const [liked, setLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const speechMicRef = useRef();

  const [transcriptionText, setTranscriptionText] = useState('');
  const [transcriptionLiked, setTranscriptionLiked] = useState(false);
  const [transcriptionIsLoading, setTranscriptionIsLoading] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState('');

  const [transcribedFiles, setTranscribedFiles] = useState({});

  const debouncedSetDebouncedInputText = useCallback(
    debounce((text) => setDebouncedInputText(text), 300),
    []
  );
  

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear all state here
      setSelectedOption('text');
      setFile(null);
      setFileUrl(null);
      setActiveInput('microphone');
      setInputText('');
      setTranslations({ text: '', upload: '', microphone: '' });
      setTextLanguage('คำเมือง');
      setVoiceLanguage('คำเมือง');
      // Clear SpeechMic state
      setTranscription('');
      setAudioUrl('');
      setTranscriptionStatus('');
      setLiked(false);
      setIsLoading(false);
      setError('');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (audioBlob) {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      audioUrlRef.current = url;
    }
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [audioBlob]);

  const handleAudioRecorded = useCallback((blob) => {
    setAudioBlob(blob);
  }, []);

  const handleTextLanguageToggle = useCallback(() => {
    const newLanguage = Textlanguage === 'คำเมือง' ? 'ไทย' : 'คำเมือง';
    setTextLanguage(newLanguage);
    
    // สลับข้อความ
    const tempText = inputText;
    setInputText(translatedText);
    setTranslatedText(tempText);
  }, [Textlanguage, inputText, translatedText]);

  const handleComponentSwitch = useCallback(() => {
    // This function is called when switching between SpeechMic and Transcription
    if (audioUrlRef.current) {
      setAudioUrl(audioUrlRef.current);
    }
  }, []);

  useEffect(() => {
    if (file) {
      const newFileUrl = URL.createObjectURL(file);
      setFileUrl(newFileUrl);
      return () => {
        URL.revokeObjectURL(newFileUrl);
      };
    }
  }, [file]);

  const handleTextLanguageChange = useCallback((newLanguage) => {
    setTextLanguage(newLanguage);
    // Don't swap text here, let TextTranslation handle it
  }, []);
  
  const handleVoiceLanguageChange = useCallback((newLanguage) => {
    setVoiceLanguage(newLanguage);
  }, []);

  const handleOptionChange = useCallback((option) => {
    setSelectedOption(option);
    setActiveInput(option === 'upload' ? 'upload' : 'microphone');
    handleComponentSwitch();
  }, [handleComponentSwitch]);

  const handleFileUpload = useCallback((uploadedFile) => {
    setFile(uploadedFile);
    setLiked(false);  // รีเซ็ตสถานะ liked เมื่อมีการอัปโหลดไฟล์ใหม่
    setTranscriptionLiked(false);
  }, []);
  
  const handleInputToggle = useCallback((input) => {
    setActiveInput(input);
    handleComponentSwitch();
  }, [handleComponentSwitch]);

  const handleTextChange = useCallback((event) => {
    const newText = event.target.value;
    setInputText(newText);
    debouncedSetDebouncedInputText(newText);
  }, []);

  const handleTranslationUpload = useCallback((translation) => {
    setTranslations(prev => ({ ...prev, upload: translation }));
  }, []);

  const handleTranslationMic = useCallback((translation) => {
    setTranslations(prev => ({ ...prev, microphone: translation }));
  }, []);

  const handleTranslationText = useCallback((translation) => {
    setTranslatedText(translation);
  }, []);

  const handleTranscriptionChange = useCallback((newTranscription, fileKey) => {
    setTranscriptionText(newTranscription);
    if (fileKey) {
      setTransribedFiles(prev => ({...prev, [fileKey]: newTranscription}));
    }
  }, []);

  const handleTranscriptionLikeToggle = useCallback(() => {
    setTranscriptionLiked(prev => !prev);
  }, []);

  const handleTranscriptionLoadingChange = useCallback((isLoading) => {
    setTranscriptionIsLoading(isLoading);
  }, []);

  const handleTranscriptionErrorChange = useCallback((error) => {
    setTranscriptionError(error);
  }, []);

  const getFileKey = useCallback((file) => {
    return file ? `${file.name}_${file.lastModified}` : null;
  }, []);


  const clearTranslation = useCallback(() => {
    if (selectedOption === 'text') {
      setInputText('');
      setTranslations(prev => ({ ...prev, text: '' }));
    } else if (activeInput === 'upload') {
      setFile(null);
      setFileUrl(null);
      setTranslations(prev => ({ ...prev, upload: '' }));
    } else {
      // For microphone, we only clear the translation but keep the transcription
      setTranslations(prev => ({ ...prev, microphone: '' }));
    }
  }, [selectedOption, activeInput]);

  const memoizedTranslation = useMemo(() => {
    if (selectedOption === 'text') {
      return translations.text;
    } else if (activeInput === 'upload') {
      return translations.upload;
    } else {
      return translations.microphone;
    }
  }, [selectedOption, activeInput, translations]);

  const handleStartRecording = useCallback(() => {
    if (speechMicRef.current) {
      speechMicRef.current.startRecording();
    }
  }, []);

  const handleStopRecording = useCallback(() => {
    if (speechMicRef.current) {
      speechMicRef.current.stopRecording();
    }
  }, []);

  const LanguageSwitch = ({ language, toggleLanguage }) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', my: '1em' }}>
      <Button 
        sx={{ 
          borderRadius: '20px', 
          padding: '8px 15px', 
          border: '2px solid #e0e0e0', 
          minWidth: '80px', 
          bgcolor: 'ButtonShadow',
          color: 'black',
          transition: 'background-color 0.3s', 
          '&:hover': {
            bgcolor: '#CBC3E3'
          }
        }}
        onClick={toggleLanguage}
      >
        <Typography sx={{ fontFamily: '"Mitr", sans-serif', fontWeight: 400, fontSize: '0.8rem' }}>{language}</Typography>
      </Button>
      <IconButton sx={{ color: '#4a90e2' }} onClick={toggleLanguage}>
        <SwapHorizIcon />
      </IconButton>
      <Button 
        sx={{ 
          borderRadius: '20px', 
          padding: '8px 15px', 
          border: '1px solid #e0e0e0', 
          minWidth: '80px', 
          bgcolor: 'ButtonShadow',
          color: 'black',
          transition: 'background-color 0.3s', 
          '&:hover': {
            bgcolor: '#CBC3E3'
          }
        }}
        onClick={toggleLanguage}
      >
        <Typography sx={{ fontFamily: '"Mitr", sans-serif', fontWeight: 400, fontSize: '0.8rem' }}>{language === 'คำเมือง' ? 'ไทย' : 'คำเมือง'}</Typography>
      </Button>
    </Box>
  );

  return (
    <Container 
      maxWidth={isMobile ? false : "xl"} 
      disableGutters={isMobile} 
      sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#ffffff', 
        p: isMobile ? 0 : { xs: 1, md: 2 },
        mt: isMobile ? 0 : '10px'
      }}
    >
      {!isMobile && (
        <Box sx={{ 
          width: { xs: '100%', md: '300px' }, 
          mb: { xs: 2, md: 0 },
          mr: { xs: 0, md: 2 },
          flexShrink: 0, 
          position: { md: 'sticky' },
          top: { md: '100px' },
          alignSelf: { md: 'flex-start' },
          maxHeight: { md: 'calc(100vh - 70px)' },
          overflowY: { md: 'auto' },
          mt: { xs: 0, md: '-60px' }
        }}>
          <Sidebar 
            onOptionChange={handleOptionChange} 
            onFileUpload={handleFileUpload} 
            onInputToggle={handleInputToggle}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording} 
            onTextLanguageChange={handleTextLanguageChange}
            onVoiceLanguageChange={handleVoiceLanguageChange}
          />
        </Box>
      )}

      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        gap: isMobile ? 1 : 2
      }}>
        {isMobile && (
          <MobileMenu 
            onOptionChange={handleOptionChange} 
            onInputToggle={handleInputToggle} 
            onStartRecording={handleStartRecording} 
            onStopRecording={handleStopRecording} 
            selectedOption={selectedOption}
            activeInput={activeInput}
          />
        )}

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          gap: isMobile ? 1 : 2
        }}>
          <Paper sx={{ 
            flex: 1, 
            p: isMobile ? 1 : 2, 
            borderRadius: isMobile ? 0 : '8px', 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            bgcolor: '#EFEFEF',
            mb: { xs: 1, lg: 0 },
            boxShadow: isMobile ? 'none' : 3
          }} elevation={isMobile ? 0 : 3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {activeInput === 'upload' && (
                <Box sx={{ width: '100%', mb: isMobile ? 1 : 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Paper sx={{ p: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontFamily: '"Chakra Petch", sans-serif', fontSize: isMobile ? '1rem' : '1.25rem' }}>
                      ไฟล์เสียงที่อัปโหลด
                    </Typography>
                    <Box sx={{ position: 'relative', width: '100%', mt: 1 }}>
                      {!fileUrl ? (
                        <Box sx={{
                          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backgroundColor: '#f5f5f5', borderRadius: 1,
                          opacity: 0.6, textAlign: 'center', mt: 7
                        }}>
                        </Box>
                      ) : (
                        <>
                          <audio controls src={fileUrl} style={{ width: '100%' }} />
                          <Typography variant="body2" sx={{ mt: 1, color: '#757575', textAlign: 'center', fontSize: isMobile ? '0.8rem' : '1rem' }}>{file.name}</Typography>
                        </>
                      )}
                    </Box>
                  </Paper>
                </Box>
              )}

              {selectedOption === 'text' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {isMobile && selectedOption === 'text' && (
  <LanguageSwitch 
    language={Textlanguage} 
    toggleLanguage={handleTextLanguageToggle}
  />
)}
                  
                  <Paper 
                    elevation={isMobile ? 0 : 3}
                    sx={{ 
                      p: isMobile ? 2 : 3, 
                      backgroundColor: '#f5f5f5',
                      border: isMobile ? 'none' : '1px solid #e0e0e0',
                      borderRadius: isMobile ? 0 : '8px'
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 2, 
                        display: 'flex', 
                        alignItems: 'center',
                        color: '#333',
                        fontFamily: '"Chakra Petch", sans-serif',
                        fontSize: isMobile ? '1rem' : '1.25rem'
                      }}
                    >
                      <TranslateIcon sx={{ mr: 1, fontSize: isMobile ? '1.2rem' : '1.5rem' }} />
                      แปลข้อความ
                    </Typography>
                    <TextField
                      label="ป้อนข้อความ"
                      multiline
                      variant="outlined"
                      value={inputText}
                      onChange={handleTextChange}
                      fullWidth
                      sx={{
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: '#bdbdbd',
                          },
                          '&:hover fieldset': {
                            borderColor: '#9e9e9e',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1976d2',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontFamily: '"Chakra Petch", sans-serif',
                          fontSize: isMobile ? '0.9rem' : '1.2rem',
                          fontWeight: 500,
                          color: '#1976d2',
                        },
                        '& .MuiInputBase-input': {
                          fontFamily: '"Chakra Petch", sans-serif',
                          fontSize: isMobile ? '0.9rem' : '1.1rem',
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CreateIcon color="action" sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }} />
                          </InputAdornment>
                        ),
                      }}
                      minRows={isMobile ? 3 : 5}
                      maxRows={isMobile ? 5 : 10}
                    />
                    {!isMobile && (
                      <Alert 
                        severity="info" 
                        icon={<InfoIcon />}
                        sx={{ 
                          mt: 2, 
                          fontFamily: '"Chakra Petch", sans-serif',
                          '& .MuiAlert-icon': {
                            color: '#1976d2',
                          },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: isMobile ? '0.8rem' : '1rem' }}>
                          คำเตือน: นี่เป็นเพียง prototype
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: isMobile ? '0.8rem' : '1rem' }}>
                          - สามารถแปลได้เพียงคำเท่านั้น<br />
                          - ไม่สามารถแปลได้ทุกคำ<br />
                          - ผลการแปลอาจไม่สมบูรณ์หรือไม่ถูกต้องทั้งหมด
                        </Typography>
                      </Alert>
                    )}
                  </Paper>
                </Box>
              )}

              {selectedOption !== 'text' && (
                activeInput === 'microphone' ? (
                  <SpeechMic
                    ref={speechMicRef}
                    onTranslation={handleTranslationMic}
                    language={Voicelanguage}
                    setLanguage={handleVoiceLanguageChange}
                    transcription={transcription}
                    setTranscription={setTranscription}
                    audioUrl={audioUrl}
                    onAudioRecorded={handleAudioRecorded}
                    transcriptionStatus={transcriptionStatus}
                    setTranscriptionStatus={setTranscriptionStatus}
                    translation={translations.microphone}
                    setTranslation={(newTranslation) => setTranslations(prev => ({ ...prev, microphone: newTranslation }))}
                    liked={liked}
                    setLiked={setLiked}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    error={error}
                    setError={setError}
                    isMobile={isMobile}
                  />
                ) : (
                  <Transcription           
                    file={file}
                    onTranslation={handleTranslationUpload}
                    language={Voicelanguage}
                    setLanguage={handleVoiceLanguageChange}
                    username={username}
                    transcription={transcriptionText}
                    setTranscription={handleTranscriptionChange}
                    liked={transcriptionLiked}
                    setLiked={handleTranscriptionLikeToggle}
                    isLoading={transcriptionIsLoading}
                    setIsLoading={handleTranscriptionLoadingChange}
                    error={transcriptionError}
                    setError={handleTranscriptionErrorChange}
                    transcribedFiles={transcribedFiles}
                    setTranscribedFiles={setTranscribedFiles}
                    getFileKey={getFileKey}
                    onComponentSwitch={handleComponentSwitch}
                    isMobile={isMobile}
                    onFileUpload={handleFileUpload}
                  />
                )
              )}
            </Box>
          </Paper>

          {!isMobile && (
            <Paper sx={{ 
              flex: 1, 
              p: 2, 
              borderRadius: '8px', 
              backgroundColor: '#f5f5f5', 
              height: '100%',
              minWidth: { xs: '100%', lg: '300px' },
              maxWidth: { lg: '500px' }
            }} elevation={3}>
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ bgcolor: 'black', p: 1, borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <Typography variant="h6" sx={{ fontFamily: '"Chakra Petch", sans-serif', color: 'white' }}>
                    ผลการแปล
                  </Typography>
                </Box>
                {selectedOption === 'text' && (
                  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <TextTranslation 
        textToTranslate={debouncedInputText} 
        onTranslation={handleTranslationText} 
        onClearTranslation={clearTranslation} 
        language={Textlanguage}
        isMobile={isMobile}
        translatedText={translatedText}
        inputText={inputText}
        setInputText={setInputText}
                    />
                  </Box>
                )}
                {memoizedTranslation && (
                  <Paper elevation={3} sx={{ mt: 2, p: 2, borderRadius: '8px', width: '100%' }}>
                    <Typography variant="body1" sx={{ mt: 1, fontFamily: '"Chakra Petch", sans-serif', fontWeight: '500' }}>
                      {memoizedTranslation}
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Paper>
          )}
        </Box>

        {isMobile && (
          <Paper sx={{ 
            p: 1, 
            borderRadius: 0, 
            backgroundColor: '#f5f5f5', 
            width: '100%',
            boxShadow: 'none'
          }} elevation={0}>
            <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ bgcolor: 'black', p: 1, borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontFamily: '"Chakra Petch", sans-serif', color: 'white', fontSize: '0.9rem' }}>
                  ผลการแปล
                </Typography>
              </Box>
              {selectedOption === 'text' && (
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <TextTranslation 
                  textToTranslate={inputText} 
                  onTranslation={handleTranslationText} 
                  onClearTranslation={clearTranslation} 
                  language={Textlanguage}
                  isMobile={isMobile}
                  translatedText={translatedText}
                  inputText={inputText}
                  setInputText={setInputText}
                  />
                </Box>
              )}
              {memoizedTranslation && (
                <Paper elevation={1} sx={{ mt: 1, p: 1, borderRadius: '4px', width: '100%' }}>
                  <Typography variant="body2" sx={{ fontFamily: '"Chakra Petch", sans-serif', fontWeight: '500', fontSize: '0.9rem' }}>
                    {memoizedTranslation}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Body;