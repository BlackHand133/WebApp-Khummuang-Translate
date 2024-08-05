import React, { useState } from 'react';
import { Grid, Button, Typography, Collapse, Divider, Box } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import styles from '../Sidebar/Sidebar.module.css';

const Sidebar = ({ onOptionChange, onFileUpload, onInputToggle }) => {
  const [selectedOption, setSelectedOption] = useState('text');
  const [activeInput, setActiveInput] = useState('microphone');
  const [microphoneOn, setMicrophoneOn] = useState(false);
  const [file, setFile] = useState(null);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setActiveInput('microphone'); // เริ่มต้นเป็นไมโครโฟน
    onOptionChange(option);
    onInputToggle('microphone'); // ส่งค่าไปยัง Body
  };

  const handleInputToggle = (input) => {
    setActiveInput(input);
    onInputToggle(input); // ส่งค่าไปยัง Body
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
    setFile(uploadedFile);
    onFileUpload(uploadedFile); // ส่งไฟล์ไปยัง Body
  };

  const LanguageSwitch = () => (
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
      >
        <Typography sx={{ fontFamily: '"Mitr", sans-serif', fontWeight: 400, fontSize: '0.8rem' }}>คำเมือง</Typography>
      </Button>
      <Button sx={{ color: '#4a90e2' }}>
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
      >
        <Typography sx={{ fontFamily: '"Mitr", sans-serif', fontWeight: 400, fontSize: '0.8rem' }}>ไทย</Typography>
      </Button>
    </Box>
  );

  return (
    <Grid container direction="column" sx={{ mt: '4em', borderRadius: '50px', height: 'auto', maxHeight: '100%', padding: '20px', backgroundColor: '#202020', boxShadow: '2px 0 5px rgba(0,0,0,0.3)' }}>
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
                transform: 'scale(1.05)', // ขยายขนาดปุ่มและเคลื่อนที่ไปทางขวา
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
          <Collapse in={selectedOption === option}>
            <Box sx={{ mt: 0 }}>
              <LanguageSwitch />
              {option === 'voice' && (
                <>
                  <Divider sx={{ width: '100%', my: '15px', backgroundColor: '#e0e0e0' }} />
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: '5px', justifyContent: 'space-between' }}>
                    <Button
                      fullWidth
                      onClick={() => handleInputToggle('microphone')}
                      sx={{ 
                        backgroundColor: activeInput === 'microphone' ? '#e3f2fd' : '#404040',
                        color: activeInput === 'microphone' ? '#757de8' : 'white',
                        transition: 'transform 1s, background-color 1s, border 1s',
                        transform: activeInput === 'microphone' ? 'scale(0.8) translateX(20px)' : 'scale(0.8) translateX(10px)',
                        fontFamily: '"Mitr", sans-serif',
                        border: activeInput === 'microphone' ? '2px solid white' : '1px solid white',
                        width: activeInput === 'upload' ? '80px' : '100%', // กำหนดความกว้าง
                        height: activeInput === 'upload' ? '80px' : '100%', // กำหนดความสูง
                        '&:hover': { 
                          backgroundColor: '#bbdefb',
                        },
                      }}
                    >
                      {activeInput === 'microphone' ? (
                        <>
                          <MicIcon sx={{ fontSize: '4rem' }} />
                          <Typography sx={{ ml: 1,fontFamily: '"Mitr", sans-serif', }}>ไมโครโฟน</Typography>
                        </>
                      ) : (
                        <MicIcon sx={{ fontSize: '2rem' }} />
                      )}
                    </Button>
                    <Button
                      fullWidth
                      onClick={() => handleInputToggle('upload')}
                      sx={{ 
                        backgroundColor: activeInput === 'upload' ? '#e3f2fd' : '#404040',
                        color: activeInput === 'upload' ? '#757de8' : 'white',
                        transition: 'transform 1s, background-color 1s, border 1s',
                        transform: activeInput === 'upload' ? 'scale(0.8) translateX(-20px)' : 'scale(0.8) translateX(-10px)',
                        border: activeInput === 'upload' ? '2px solid white' : '1px solid white',
                        width: activeInput === 'upload' ? '100%' : '80px', // กำหนดความกว้าง
                        height: activeInput === 'upload' ? '100%' : '80px', // กำหนดความสูง
                        '&:hover': { 
                          backgroundColor: '#bbdefb',
                        }
                      }}
                    >
                      {activeInput === 'upload' ? (
                        <>
                          <UploadFileIcon sx={{ fontSize: '4rem' }} />
                          <Typography sx={{ ml: 1 ,fontFamily: '"Mitr", sans-serif',}}>ไฟล์เสียง</Typography>
                        </>
                      ) : (
                        <UploadFileIcon sx={{ fontSize: '2rem' }} />
                      )}
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    {activeInput === 'microphone' ? (
                      <Button size='large' onClick={handleMicrophoneToggle} sx={{ 
                        bgcolor: 'white',
                        borderRadius: '100px',
                        height: '150px',
                        width: '150px',
                        transition: 'transform 0.3s, background-color 0.3s',
                        '&:hover': {
                          backgroundColor: 'lightgray',
                          transform: 'scale(1.05)',
                        }
                      }}>
                        {microphoneOn ? (
                          <MicIcon className={styles.mic} sx={{ fontSize: '3rem', color: 'red'  }} />
                        ) : (
                          <MicOffIcon sx={{ fontSize: '3rem', color: 'red' }} />
                        )}
                      </Button>
                    ) : (
                      <Button component="label" sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <input type="file" hidden accept="audio/*" onChange={handleFileChange} />
                      <UploadFileIcon
                        sx={{
                          backgroundColor:'#303030',
                          fontSize: '5rem',
                          color: '#4a90e2',
                          border: '1px solid white',
                          borderRadius: '10px',
                          padding: '10px',
                          transition: 'background-color 0.3s, transform 0.3s',
                          '&:hover': {
                            bgcolor: 'white',
                            border: '1px solid gray',
                            transform: 'scale(1.05)',
                          }
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: '10px', // ปรับตำแหน่งตามต้องการ
                          left: '50%',
                          transform: 'translateX(-50%)',
                          color: '#4a90e2',
                          fontFamily: '"Mitr", sans-serif',
                          fontWeight: 400,
                          fontSize: '0.8rem',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          px: 1,
                          bgcolor: 'rgba(255, 255, 255, 0.8)', // สีพื้นหลังข้อความเพื่อให้โดดเด่นขึ้น
                          borderRadius: '5px'
                        }}
                      >
                        อัปโหลด
                      </Box>
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
