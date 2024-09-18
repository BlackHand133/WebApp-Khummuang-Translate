import React, { useState } from 'react';
import { 
  Grid, Button, Typography, Collapse, Divider, Box, 
  useMediaQuery, useTheme
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import styles from './Sidebar.module.css';

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
    } else {
      onStopRecording();
    }
  };

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    onFileUpload(uploadedFile);
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
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: '5px', justifyContent: 'space-between' }}>
            <Button
              fullWidth
              onClick={() => handleInputToggle('microphone')}
              sx={{ 
                backgroundColor: activeInput === 'microphone' ? '#e3f2fd' : '#404040',
                color: activeInput === 'microphone' ? '#757de8' : 'white',
                fontFamily: '"Mitr", sans-serif',
                border: activeInput === 'microphone' ? '2px solid white' : '1px solid white',
                padding: '10px',
                '&:hover': { 
                  backgroundColor: '#bbdefb',
                },
              }}
            >
              <MicIcon sx={{ fontSize: '2rem', mr: 1 }} />
              <Typography>ไมโครโฟน</Typography>
            </Button>
            <Button
              fullWidth
              onClick={() => handleInputToggle('upload')}
              sx={{ 
                backgroundColor: activeInput === 'upload' ? '#e3f2fd' : '#404040',
                color: activeInput === 'upload' ? '#757de8' : 'white',
                fontFamily: '"Mitr", sans-serif',
                border: activeInput === 'upload' ? '2px solid white' : '1px solid white',
                padding: '10px',
                '&:hover': { 
                  backgroundColor: '#bbdefb',
                }
              }}
            >
              <UploadFileIcon sx={{ fontSize: '2rem', mr: 1 }} />
              <Typography>ไฟล์เสียง</Typography>
            </Button>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            {activeInput === 'microphone' ? (
              <Button onClick={handleMicrophoneToggle} sx={{ 
                bgcolor: 'white',
                borderRadius: '100px',
                height: '80px',
                width: '80px',
                transition: 'transform 0.3s, background-color 0.3s',
                '&:hover': {
                  backgroundColor: 'lightgray',
                  transform: 'scale(1.05)',
                }
              }}>
                {microphoneOn ? (
                  <MicIcon className={styles.mic} sx={{ fontSize: '2.5rem', color: 'red' }} />
                ) : (
                  <MicOffIcon sx={{ fontSize: '2.5rem', color: 'red' }} />
                )}
              </Button>
            ) : (
              <Button component="label" sx={{ 
                position: 'relative', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '80px',
                width: '80px',
                bgcolor: '#303030',
                borderRadius: '10px',
                '&:hover': {
                  bgcolor: 'white',
                  '& .uploadIcon': {
                    color: '#303030',
                  },
                  '& .uploadText': {
                    color: '#303030',
                  },
                }
              }}>
                <input type="file" hidden accept="audio/*" onChange={handleFileChange} />
                <UploadFileIcon
                  className="uploadIcon"
                  sx={{
                    fontSize: '2.5rem',
                    color: '#4a90e2',
                    transition: 'color 0.3s',
                  }}
                />
                <Typography
                  className="uploadText"
                  sx={{
                    position: 'absolute',
                    bottom: '5px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#4a90e2',
                    fontFamily: '"Mitr", sans-serif',
                    fontWeight: 400,
                    fontSize: '0.7rem',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.3s',
                  }}
                >
                  อัปโหลด
                </Typography>
              </Button>
            )}
          </Box>
        </Collapse>
      </Box>
    </Grid>
  );
};

export default Sidebar;