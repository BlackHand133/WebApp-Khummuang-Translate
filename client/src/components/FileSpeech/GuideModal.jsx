// GuideModal.js
import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Chip,
  Button,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

const GuideModal = ({ open, onClose, supportedWords, isMobile, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredWords = supportedWords.filter(word => 
    word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="guide-modal-title"
      aria-describedby="guide-modal-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isMobile ? '90%' : 600,
        maxWidth: '90vw',
        bgcolor: 'background.paper',
        borderRadius: '16px',
        boxShadow: 24,
        p: 4,
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography id="guide-modal-title" variant="h5" component="h2" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.primary.main }}>
          คู่มือการใช้งานและข้อจำกัด
        </Typography>
        <Typography id="guide-modal-description" sx={{ mb: 3 }}>
          โมเดลถอดความภาษาคำเมืองยังมีข้อจำกัด สามารถถอดความได้เพียง {supportedWords.length} คำ ดังต่อไปนี้:
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="ค้นหาคำ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ 
          maxHeight: '40vh', 
          overflowY: 'auto', 
          bgcolor: '#f5f5f5', 
          borderRadius: '8px', 
          p: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#bdbdbd',
            borderRadius: '4px',
          },
        }}>
          <Grid container spacing={1}>
            {filteredWords.map((word, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <Chip
                  label={word}
                  sx={{
                    m: 0.5,
                    bgcolor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        <Typography sx={{ mt: 3, fontStyle: 'italic', color: theme.palette.text.secondary }}>
          โปรดทราบว่าผลการถอดความอาจไม่สมบูรณ์หรือมีความคลาดเคลื่อนสำหรับคำที่ไม่อยู่ในรายการนี้
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            onClick={onClose} 
            variant="contained"
            sx={{ 
              fontWeight: 'bold',
              borderRadius: '20px',
              px: 3,
            }}
          >
            เข้าใจแล้ว
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default GuideModal;