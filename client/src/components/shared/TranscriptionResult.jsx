import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';

const TranscriptionResult = ({ transcription, rating, handleRating }) => (
  <Box sx={{ mt: 3, width: '100%' }}>
    <Box sx={{ bgcolor: 'black', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
      <Typography variant="h6" sx={{ fontFamily: '"Chakra Petch", sans-serif', color: 'white' }} gutterBottom>
        ผลลัพธ์การถอดความ
      </Typography>
    </Box>
    <Typography variant="body1" sx={{ fontFamily: '"Chakra Petch", sans-serif', p: 2 }}>
      {transcription}
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, alignItems: 'center' }}>
      <IconButton onClick={() => handleRating('like')}>
        {rating === 'like' ? <ThumbUpAltIcon sx={{ fontSize: '1.5rem', color: '#1976d2' }} /> : <ThumbUpOffAltIcon sx={{ fontSize: '1.5rem' }} />}
      </IconButton>
      <IconButton onClick={() => handleRating('dislike')}>
        {rating === 'dislike' ? <ThumbDownAltIcon sx={{ fontSize: '1.5rem', color: '#d32f2f' }} /> : <ThumbDownOffAltIcon sx={{ fontSize: '1.5rem' }} />}
      </IconButton>
    </Box>
  </Box>
);

export default TranscriptionResult;