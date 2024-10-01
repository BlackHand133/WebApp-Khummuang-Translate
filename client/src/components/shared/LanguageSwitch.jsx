import React from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

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
      <Typography sx={{ fontFamily: '"Mitr", sans-serif', fontWeight: 400, fontSize: '0.8rem' }}>
        {language}
      </Typography>
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
      <Typography sx={{ fontFamily: '"Mitr", sans-serif', fontWeight: 400, fontSize: '0.8rem' }}>
        {language === 'คำเมือง' ? 'ไทย' : 'คำเมือง'}
      </Typography>
    </Button>
  </Box>
);

export default LanguageSwitch;