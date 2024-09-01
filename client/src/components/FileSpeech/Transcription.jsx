import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, CircularProgress, IconButton } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { useUser } from '../../ContextUser';

const Transcription = ({ file, onTranslation, language }) => {
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);

  const { userId, username } = useUser();

  useEffect(() => {
    const handleTranscribe = async () => {
      if (!file) return;

      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);

      try {
        const response = await axios.post('http://localhost:8080/api/transcribe', formData);

        if (!response.data.transcription) {
          throw new Error('Failed to transcribe audio');
        }

        setTranscription(response.data.transcription);
        await handleTranslate(response.data.transcription);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    handleTranscribe();
  }, [file, language]);

  const handleTranslate = async (transcription) => {
    const sentence = transcription;

    try {
      const response = await axios.post('http://localhost:8080/api/translate', { sentence, language });
      onTranslation(response.data.translated_sentence); // ส่งผลการแปลกลับไปที่ Body
    } catch (error) {
      setError(error.message);
    }
  };

  const saveFile = async () => {
    if (!file || !transcription) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId || 'guest'); // ใช้ `userId` หรือ 'guest'
    formData.append('transcription_text', transcription);

    try {
      await axios.post('http://localhost:8080/api/savefile', formData);
    } catch (error) {
      console.error('Error saving file:', error.message);
    }
  };

  const toggleLike = async () => {
    setLiked(prevLiked => !prevLiked); // สลับสถานะการกดปุ่ม

    if (!liked) {
      await saveFile(); // บันทึกไฟล์และข้อมูลเมื่อกดปุ่ม Like
    }
  };

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {loading && <CircularProgress sx={{ display: 'block', margin: '20px' }} />}

      {error && (
        <Typography color="error" variant="body1" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}

      {transcription && (
        <Paper elevation={3} sx={{ p: 2, borderRadius: '8px', width: '100%', maxWidth: '800px' }}>
          <Box sx={{ bgcolor: 'black', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontFamily: '"Chakra Petch", sans-serif', color: 'white' }} gutterBottom>
              ผลลัพธ์การถอดความ
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {transcription}
          </Typography>
          <IconButton
            sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, ml: 'auto' }}
            onClick={toggleLike}
          >
            {liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
          </IconButton>
        </Paper>
      )}
    </Box>
  );
};

export default Transcription;
