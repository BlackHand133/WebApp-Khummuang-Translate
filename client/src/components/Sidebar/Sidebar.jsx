import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, Button, Typography, Collapse, Divider, Box, 
  useMediaQuery, useTheme, Paper
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import styles from './Sidebar.module.css';

const useAudioFeedback = () => {
  const playSound = useCallback((soundName) => {
    console.log(`Playing sound: ${soundName}`);
    // Future implementation:
    // const audio = new Audio(`/sounds/${soundName}.mp3`);
    // audio.play();
  }, []);

  return { playSound };
};

const UploadButton = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const theme = useTheme();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: '15px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: dragActive ? `2px dashed ${theme.palette.primary.main}` : '2px solid transparent',
      }}
    >
      <Box
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backgroundColor: dragActive ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
        }}
      >
        <input
          type="file"
          id="file-upload"
          onChange={handleChange}
          accept="audio/*"
          style={{ display: 'none' }}
        />
        <label htmlFor="file-upload" style={{ width: '100%', cursor: 'pointer' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AudiotrackIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
            <Typography variant="h6" align="center" gutterBottom>
              อัปโหลดไฟล์เสียง
            </Typography>
            <Typography variant="body2" align="center" color="textSecondary">
              ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์
            </Typography>
            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              sx={{ mt: 2 }}
            >
              เลือกไฟล์
            </Button>
          </Box>
        </label>
      </Box>
    </Paper>
  );
};

const Sidebar = ({ 
  onOptionChange, 
  onFileUpload, 
  onInputToggle, 
  onStartRecording, 
  onStopRecording, 
  onTextLanguageChange, 
  onVoiceLanguageChange 
}) => {
  const [selectedOption, setSelectedOption] = useState('text');
  const [activeInput, setActiveInput] = useState('microphone');
  const [microphoneOn, setMicrophoneOn] = useState(false);
  const [textLanguage, setTextLanguage] = useState('คำเมือง');
  const [voiceLanguage, setVoiceLanguage] = useState('คำเมือง');

  const { playSound } = useAudioFeedback();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isMobile) {
    return null; // Don't render on mobile
  }

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setActiveInput(option === 'upload' ? 'upload' : 'microphone');
    onOptionChange(option);
    onInputToggle(option === 'upload' ? 'upload' : 'microphone');
  };

  const handleInputToggle = (input) => {
    setActiveInput(input);
    onInputToggle(input);
  };

  const handleMicrophoneToggle = () => {
    setMicrophoneOn(!microphoneOn);
    if (!microphoneOn) {
      onStartRecording();
      playSound('start_recording');
    } else {
      onStopRecording();
      playSound('stop_recording');
    }
  };

  const handleFileChange = (file) => {
    onFileUpload(file);
  };

  const toggleTextLanguage = () => {
    const newLanguage = textLanguage === 'คำเมือง' ? 'ไทย' : 'คำเมือง';
    setTextLanguage(newLanguage);
    onTextLanguageChange(newLanguage);
  };

  const toggleVoiceLanguage = () => {
    const newLanguage = voiceLanguage === 'คำเมือง' ? 'ไทย' : 'คำเมือง';
    setVoiceLanguage(newLanguage);
    onVoiceLanguageChange(newLanguage);
  };

  useEffect(() => {
    onTextLanguageChange(textLanguage);
  }, [textLanguage, onTextLanguageChange]);

  const LanguageSwitch = ({ language, toggleLanguage }) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', mb: '1em' }}>
      <Divider sx={{ width: '100%', my: '15px', backgroundColor: '#e0e0e0' }} />
      <Button 
        sx={{ 
          borderRadius: '20px', 
          padding: '8px 15px', 
          border: '2px solid #e0e0e0', 
          minWidth: '80px', 
          bgcolor: 'ButtonShadow',
          transition: 'background-color 0.3s', 
          '&:hover': {
            bgcolor: '#CBC3E3'
          }
        }}
        onClick={toggleLanguage}
      >
        <Typography sx={{ fontFamily: '"Mitr", sans-serif', fontWeight: 400, fontSize: '0.8rem' }}>{language}</Typography>
      </Button>
      <Button sx={{ color: '#4a90e2' }} onClick={toggleLanguage}>
        <SwapHorizIcon />
      </Button>
      <Button 
        sx={{ 
          borderRadius: '20px', 
          padding: '8px 15px', 
          border: '1px solid #e0e0e0', 
          minWidth: '80px', 
          bgcolor: 'ButtonShadow',
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
    <Grid container direction="column" sx={{ 
      borderRadius: '50px', 
      height: '100%', 
      padding: '20px', 
      backgroundColor: '#202020', 
      boxShadow: '2px 0 5px rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <Box>
        <Typography variant="h6" gutterBottom align="center" sx={{ fontFamily: '"Mitr", sans-serif', fontWeight: 500, color: 'white', mb: 2 }}>
          ตัวเลือก
        </Typography>
        
        {['text', 'voice'].map((option) => (
          <Grid item key={option} sx={{ mb: 2 }}>
            <Button 
              fullWidth
              variant="contained"
              onClick={() => handleOptionChange(option)}
              disabled={selectedOption === option}
              sx={{ 
                mb: 1,
                fontFamily: '"Mitr", sans-serif',
                borderRadius: '50px', 
                fontSize: '1.2rem', 
                padding: '10px',
                backgroundColor: selectedOption === option ? '#4a90e2' : 'white',
                color: selectedOption === option ? 'white' : 'black',
                transition: 'background-color 0.3s, transform 0.3s, font-weight 0.1s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  fontWeight: 700,
                  backgroundColor: '#4a90e2',
                  color: 'white',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#4a90e2',
                  color: 'white',
                  transform: 'scale(1.05)'
                },
              }}
            >
              {option === 'text' ? 'ข้อความ' : 'เสียง'}
            </Button>
          </Grid>
        ))}
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Collapse in={selectedOption === 'text'}>
          <LanguageSwitch language={textLanguage} toggleLanguage={toggleTextLanguage} />
        </Collapse>
        <Collapse in={selectedOption === 'voice'}>
          <LanguageSwitch language={voiceLanguage} toggleLanguage={toggleVoiceLanguage} />
          <Divider sx={{ width: '100%', my: '15px', backgroundColor: '#e0e0e0' }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Paper elevation={3} sx={{ 
              backgroundColor: activeInput === 'microphone' ? '#e3f2fd' : '#404040',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <Button
                fullWidth
                onClick={() => handleInputToggle('microphone')}
                sx={{ 
                  color: activeInput === 'microphone' ? '#1976d2' : 'white',
                  fontFamily: '"Mitr", sans-serif',
                  padding: '15px',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  '&:hover': { 
                    backgroundColor: activeInput === 'microphone' ? '#bbdefb' : '#505050',
                  },
                }}
              >
                <MicIcon sx={{ fontSize: '2rem', mr: 2 }} />
                <Typography>ไมโครโฟน</Typography>
              </Button>
              {activeInput === 'microphone' && (
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    onClick={handleMicrophoneToggle} 
                    variant="contained" 
                    color={microphoneOn ? "error" : "success"}
                    sx={{ 
                      borderRadius: '50px',
                      padding: '15px 30px',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      animation: microphoneOn ? `${styles.pulse} 2s infinite` : 'none',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    {microphoneOn ? "หยุดบันทึก" : "เริ่มบันทึก"}
                    {microphoneOn ? <MicIcon sx={{ ml: 1 }} /> : <MicOffIcon sx={{ ml: 1 }} />}
                  </Button>
                </Box>
              )}
            </Paper>
            <Paper elevation={3} sx={{ 
              backgroundColor: activeInput === 'upload' ? '#e3f2fd' : '#404040',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <Button
                fullWidth
                onClick={() => handleInputToggle('upload')}
                sx={{ 
                  color: activeInput === 'upload' ? '#1976d2' : 'white',
                  fontFamily: '"Mitr", sans-serif',
                  padding: '15px',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  '&:hover': { 
                    backgroundColor: activeInput === 'upload' ? '#bbdefb' : '#505050',
                  },
                }}
              >
                <UploadFileIcon sx={{ fontSize: '2rem', mr: 2 }} />
                <Typography>ไฟล์เสียง</Typography>
              </Button>
              {activeInput === 'upload' && (
                <Box sx={{ p: 2 }}>
                  <Button
                    component="label"
                    variant="contained"
                    fullWidth
                    startIcon={<UploadFileIcon />}
                    sx={{ 
                      borderRadius: '50px',
                      padding: '10px',
                      fontSize: '1rem',
                      textTransform: 'none',
                    }}
                  >
                    อัปโหลดไฟล์
                    <input type="file" hidden accept="audio/*" onChange={(e) => handleFileChange(e.target.files[0])} />
                  </Button>
                </Box>
              )}
            </Paper>
          </Box>
        </Collapse>
      </Box>
    </Grid>
  );
};

export default Sidebar;