import React, { useState } from 'react';
import { Grid, Button, Typography, Collapse, Divider, Box } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import styles from './Sidebar.module.css'

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
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', mb:'1em' }}>
      <Divider sx={{ width: '100%', my: '15px', backgroundColor: '#e0e0e0' }} />
      <Button sx={{ borderRadius: '20px', padding: '8px 15px', border: '2px solid #e0e0e0', minWidth: '80px', bgcolor:'ButtonShadow' }}>
        <Typography sx={{ fontFamily: '"Mitr", sans-serif', fontWeight: 400, fontSize: '0.8rem' }}>คำเมือง</Typography>
      </Button>
      <Button sx={{ color: '#4a90e2' }}>
        <SwapHorizIcon />
      </Button>
      <Button sx={{ borderRadius: '20px', padding: '8px 15px', border: '1px solid #e0e0e0', minWidth: '80px', bgcolor:'ButtonShadow' }}>
        <Typography sx={{ fontFamily: '"Mitr", sans-serif', fontWeight: 400, fontSize: '0.8rem' }}>ไทย</Typography>
      </Button>
    </Box>
  );

  return (
    <Grid container direction="column" sx={{ mt:'5em', ml:'0.5em', borderRadius: '50px', height: '100%', padding: '20px', backgroundColor: '#202020', boxShadow: '2px 0 5px rgba(0,0,0,0.3)' }}>
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
            sx={{ mb: 1 , fontFamily: '"Mitr", sans-serif', borderRadius:'50px', fontSize:'1.2rem', padding:'10px',
              backgroundColor: selectedOption === option ? '#4a90e2' : 'white', // ปรับสีเมื่อปุ่มถูกกดแล้ว
              color: selectedOption === option ? 'white' : 'black', // ปรับสีข้อความเมื่อปุ่มถูกกดแล้ว
              transition: 'transform 0.3s, font-weight 0.1s', // การเปลี่ยนแปลงที่ราบรื่น
              '&:hover': {
                transform: 'scale(1.05)', // ขยายขนาดปุ่มเมื่อ hover
                fontWeight: 700,
                color:'white' // ทำให้ข้อความหนาขึ้นเมื่อ hover
              },
              '&.Mui-disabled': {
                backgroundColor: '#606060', // สีพื้นหลังเมื่อปุ่มถูกปิดการใช้งาน
                color: 'lightblack', // สีข้อความเมื่อปุ่มถูกปิดการใช้งาน
                transform: 'scale(1.12)'
              },
            }}
          >
            {option === 'text' ? 'ข้อความ' : 'เสียง'}
          </Button>
          <Collapse in={selectedOption === option}>
            <Box sx={{ mt: 0 }}>
              <LanguageSwitch />
              {option === 'voice' && (
                <>
                  <Divider sx={{ width: '100%', my: '15px', backgroundColor: '#e0e0e0' }} />
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: '10px',justifyContent:'space-between' }}>
                    <Button
                      fullWidth
                      onClick={() => handleInputToggle('microphone')}
                      sx={{ 
                        backgroundColor: activeInput === 'microphone' ? '#e3f2fd' : 'transparent',
                        '&:hover': { backgroundColor: '#bbdefb' }
                      }}
                      startIcon={<MicIcon />}
                    >
                      ไมโครโฟน
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
                      ไฟล์เสียง
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                    {activeInput === 'microphone' ? (
                      <Button size='large' onClick={handleMicrophoneToggle} sx={{bgcolor:'white',borderRadius:'100px',height:'150px',width:'150px',transition: 'transform 0.3s',
                        '&:hover':{
                          backgroundColor:'lightgray',
                          transform: 'scale(1.05)',
                        }
                      }}>
                        {microphoneOn ? (
                          <MicIcon className={styles.mic} sx={{ fontSize: '3rem', color: 'red' }} />
                        ) : (
                          <MicOffIcon sx={{ fontSize: '3rem', color: 'red' }} />
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
