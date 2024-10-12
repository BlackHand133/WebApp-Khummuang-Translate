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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

const GuideModal = ({ open, onClose, supportedWords }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const filteredWords = supportedWords.filter(word => 
    word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getModalWidth = () => {
    if (isMobile) return '95%';
    if (isTablet) return '80%';
    return '70%';
  };

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
        width: getModalWidth(),
        maxWidth: '1200px',
        maxHeight: '90vh',
        bgcolor: 'background.paper',
        borderRadius: '24px',
        boxShadow: 24,
        p: { xs: 2, sm: 3, md: 4 },
        overflowY: 'auto',
        fontFamily: '"Chakra Petch", sans-serif',
        '&::-webkit-scrollbar': {
          width: '12px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.primary.light,
          borderRadius: '6px',
          border: '3px solid',
          borderColor: theme.palette.background.paper,
        },
      }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: { xs: 8, sm: 16 },
            top: { xs: 8, sm: 16 },
            color: theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography 
          id="guide-modal-title" 
          variant="h4" 
          component="h2" 
          gutterBottom 
          sx={{ 
            mb: 3, 
            fontWeight: 700, 
            color: theme.palette.primary.main,
            textShadow: '0px 1px 2px rgba(0,0,0,0.1)',
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          }}
        >
          คู่มือการใช้งานและข้อจำกัด
        </Typography>
        <Typography 
          id="guide-modal-description" 
          sx={{ 
            mb: 3,
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            lineHeight: 1.6,
          }}
        >
          โมเดลถอดความภาษาคำเมืองยังมีข้อจำกัด สามารถถอดความได้เพียง {supportedWords.length} คำ ดังต่อไปนี้:
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="ค้นหาคำ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            mb: 3,
            fontFamily: 'inherit',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: theme.palette.primary.light,
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.dark,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ 
          maxHeight: '50vh', 
          overflowY: 'auto', 
          bgcolor: theme.palette.grey[100], 
          borderRadius: '12px', 
          p: 2,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.light,
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
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    fontFamily: 'inherit',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        <Typography 
          sx={{ 
            mt: 3, 
            fontStyle: 'italic', 
            color: theme.palette.text.secondary,
            fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
          }}
        >
          โปรดทราบว่าผลการถอดความอาจไม่สมบูรณ์หรือมีความคลาดเคลื่อนสำหรับคำที่ไม่อยู่ในรายการนี้
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            onClick={onClose} 
            variant="contained"
            sx={{ 
              fontWeight: 'bold',
              borderRadius: '24px',
              px: 4,
              py: 1,
              fontFamily: 'inherit',
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              textTransform: 'none',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)',
              },
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