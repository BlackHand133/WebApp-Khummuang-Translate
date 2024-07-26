import React, { useState } from 'react';
import { Grid, Button, Typography, Collapse, Divider, Box } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const Sidebar = ({ onOptionChange }) => {
  const [selectedOption, setSelectedOption] = useState('text');
  const [activeInput, setActiveInput] = useState('microphone');
  const [microphoneOn, setMicrophoneOn] = useState(false);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setActiveInput('microphone');
    onOptionChange(option);
  };

  const handleInputToggle = (input) => {
    setActiveInput(input);
  };

  const handleMicrophoneToggle = () => {
    setMicrophoneOn(!microphoneOn);
  };

  const LanguageSwitch = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
      <Button sx={{ borderRadius: '20px', padding: '8px 15px', border: '1px solid #e0e0e0', minWidth: '80px' }}>
        <Typography sx={{ fontFamily: '"Mitr", sans-serif', fontWeight: 400, fontSize: '0.8rem' }}>คำเมือง</Typography>
      </Button>
      <Button sx={{ color: '#4a90e2' }}>
        <SwapHorizIcon />
      </Button>
      <Button sx={{ borderRadius: '20px', padding: '8px 15px', border: '1px solid #e0e0e0', minWidth: '80px' }}>
        <Typography sx={{ fontFamily: '"Mitr", sans-serif', fontWeight: 400, fontSize: '0.8rem' }}>ไทย</Typography>
      </Button>
    </Box>
  );

  return (
    <Grid container direction="column" sx={{ height: '100%', padding: '20px', backgroundColor: '#ffffff', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
      <Typography variant="h6" gutterBottom align="center" sx={{ fontFamily: '"Mitr", sans-serif', fontWeight: 500, color: '#333', mb: 2 }}>
        ตัวเลือก
      </Typography>
      
      {['text', 'voice'].map((option) => (
        <Grid item key={option} sx={{ mb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => handleOptionChange(option)}
            disabled={selectedOption === option}
            sx={{ mb: 1 }}
          >
            {option === 'text' ? 'ข้อความ' : 'เสียง'}
          </Button>
          <Collapse in={selectedOption === option}>
            <Box sx={{ mt: 2 }}>
              <LanguageSwitch />
              {option === 'voice' && (
                <>
                  <Divider sx={{ width: '100%', my: '15px', backgroundColor: '#e0e0e0' }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Button
                      fullWidth
                      onClick={() => handleInputToggle('microphone')}
                      sx={{ 
                        backgroundColor: activeInput === 'microphone' ? '#e3f2fd' : 'transparent',
                        '&:hover': { backgroundColor: '#bbdefb' }
                      }}
                      startIcon={<MicIcon />}
                    >
                      ใช้ไมโครโฟน
                    </Button>
                    <Button
                      fullWidth
                      onClick={() => handleInputToggle('upload')}
                      sx={{ 
                        backgroundColor: activeInput === 'upload' ? '#e3f2fd' : 'transparent',
                        '&:hover': { backgroundColor: '#bbdefb' }
                      }}
                      startIcon={<UploadFileIcon />}
                    >
                      อัปโหลดไฟล์เสียง
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    {activeInput === 'microphone' ? (
                      <Button onClick={handleMicrophoneToggle}>
                        {microphoneOn ? (
                          <MicOffIcon sx={{ fontSize: '3rem', color: 'red' }} />
                        ) : (
                          <MicIcon sx={{ fontSize: '3rem', color: '#4a90e2' }} />
                        )}
                      </Button>
                    ) : (
                      <Button component="label">
                        <input type="file" hidden accept="audio/*" />
                        <UploadFileIcon sx={{ fontSize: '3rem', color: '#4a90e2' }} />
                      </Button>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </Collapse>
        </Grid>
      ))}
    </Grid>
  );
};

export default Sidebar;