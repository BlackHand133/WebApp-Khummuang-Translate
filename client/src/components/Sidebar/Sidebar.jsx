import React, { useState } from 'react';
import { Grid, Button, Typography, Collapse, Divider, Box } from '@mui/material';
import styles from './Sidebar.module.css';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsVoiceIcon from '@mui/icons-material/SettingsVoice';
import FileUploadIcon from '@mui/icons-material/FileUpload';

const Sidebar = () => {
  const [selectedOption, setSelectedOption] = useState('text');
  const [microphoneOpen, setMicrophoneOpen] = useState(true);
  const [microphoneOn, setMicrophoneOn] = useState(false);
  const [uploadFileOpen, setUploadFileOpen] = useState(false);

  const handleButtonClick = (option) => {
    setSelectedOption(option);
  };

  const handleMicrophoneToggle = () => {
    setMicrophoneOpen(true);
    setUploadFileOpen(false);
  };

  const handleMicrophoneOnClick = () => {
    setMicrophoneOn(!microphoneOn);
  };

  const handleUploadClick = () => {
    setUploadFileOpen(true);
    setMicrophoneOpen(false);
  };

  return (
    <Grid container direction="column" className={styles.sidebar} sx={{ width: '25%' }}>
      <Typography variant="h6" gutterBottom align="center" sx={{ fontFamily:  '"Pridi", sans-serif' }}>
        ตัวเลือก
      </Typography>
      
      {/* Text Option Button */}
      <Grid item>
        <Button
          fullWidth
          variant="contained"
          className={styles.button}
          onClick={() => handleButtonClick('text')}
          disabled={selectedOption === 'text'}
        >
          ข้อความ
        </Button>
      </Grid>

      {/* Text Content */}
      <Grid item>
        <Collapse in={selectedOption === 'text'}>
          <Box className={styles.content} sx={{ mt: '-1px', display: 'flex', justifyContent: 'center' }}>
            {/* Your text content goes here */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <Button className={styles.language} sx={{ borderRadius: '15px',padding:'4 %'}}>
                <Typography sx={{ fontFamily: '"Pridi",sans-serif', fontSize: '1rem' }}>คำเมือง </Typography>
              </Button>
              <Button>
                <SwapHorizIcon sx={{ color: 'white' }} />
              </Button>
              <Button className={styles.language} sx={{ borderRadius: '15px' ,padding:'5%'}}>
                <Typography sx={{ fontFamily: '"Pridi",sans-serif', fontSize: '1rem' }}>ไทย </Typography>
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Grid>

      {/* Voice Option Button */}
      <Grid item>
        <Button
          fullWidth
          variant="contained"
          className={styles.button}
          onClick={() => handleButtonClick('voice')}
          disabled={selectedOption === 'voice'}
          sx={{ mt: '0.5em' }}
        >
          เสียง
        </Button>
      </Grid>

      {/* Voice Content */}
      <Grid item>
        <Collapse in={selectedOption === 'voice'}>
          <Box className={styles.content} sx={{ mt: '-1px', display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
            {/* Your voice content goes here */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <Button className={styles.language} sx={{ borderRadius: '15px', padding: '10px' }}>
                <Typography sx={{ fontFamily: '"Pridi",sans-serif', fontSize: '1rem' }}>คำเมือง </Typography>
              </Button>
              <Button>
                <SwapHorizIcon sx={{ color: 'white' }} />
              </Button>
              <Button className={styles.language} sx={{ borderRadius: '15px', padding: '10px' }}>
                <Typography sx={{ fontFamily: '"Pridi",sans-serif', fontSize: '1rem' }}>คำเมือง </Typography>
              </Button>
            </Box>

            {/* Divider */}
            <Divider sx={{ width: '100%', my: '10px', backgroundColor: 'white' }} />

            {/* Microphone and Upload buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <Button onClick={handleMicrophoneToggle} sx={{ backgroundColor: microphoneOpen ? 'white' : 'initial' }}>
                <SettingsVoiceIcon />
              </Button>
              <Button onClick={handleUploadClick} sx={{ backgroundColor: uploadFileOpen ? 'white' : 'initial' }}>
                <FileUploadIcon />
              </Button>
            </Box>

            {/* Microphone option */}
            {microphoneOpen && (
              <Box className={styles.optionFrame} sx={{ display: 'flex', justifyContent: 'center', backgroundColor: 'white', borderRadius: '10px' }}>
                <Button onClick={handleMicrophoneOnClick} sx={{ borderRadius: '50px', marginTop: '10px' }}>
                  {microphoneOn ? (
                    <MicOffIcon sx={{ fontSize: '4rem', color: 'red', padding: '10px' }} />
                  ) : (
                    <MicIcon sx={{ fontSize: '4rem', color: 'black', padding: '10px' }} />
                  )}
                </Button>
              </Box>
            )}

            {/* Upload File option */}
            {uploadFileOpen && (
              <Box className={styles.optionFrame} sx={{ display: 'flex', justifyContent: 'center', backgroundColor: 'white', borderRadius: '10px' }}>
                <Button sx={{ borderRadius: '50px', marginTop: '10px' }}>
                  <UploadFileIcon sx={{ fontSize: '4rem', color: 'gray', padding: '10px' }} />
                </Button>
              </Box>
            )}
          </Box>
        </Collapse>
      </Grid>
    </Grid>
  );
};

export default Sidebar;
