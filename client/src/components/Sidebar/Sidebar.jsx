import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, Button, Typography, Collapse, Divider, Box, 
  useMediaQuery, useTheme, Paper
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import MicIcon from '@mui/icons-material/Mic';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import styles from './Sidebar.module.css';

const Sidebar = ({ 
  onOptionChange, 
  onInputToggle, 
  onTextLanguageChange, 
  onVoiceLanguageChange 
}) => {
  const [selectedOption, setSelectedOption] = useState('text');
  const [activeInput, setActiveInput] = useState('microphone');
  const [textLanguage, setTextLanguage] = useState('คำเมือง');
  const [voiceLanguage, setVoiceLanguage] = useState('คำเมือง');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isMobile) {
    return null; // Don't render on mobile
  }

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    onOptionChange(option);
  };

  const handleInputToggle = (input) => {
    setActiveInput(input);
    onInputToggle(input);
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
            </Paper>
          </Box>
        </Collapse>
      </Box>
    </Grid>
  );
};

export default Sidebar;