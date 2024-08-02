// Transcription.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress } from '@mui/material';

const Transcription = ({ file, onTranslation }) => {
  const [transcription, setTranscription] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleTranscribe = async () => {
      if (!file) return;

      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

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
  }, [file]);

  const handleTranslate = async (transcription) => {
    const sentence = transcription.map(item => item.word).join(' ');

    try {
      const response = await axios.post('http://localhost:8080/api/translate', { sentence });
      onTranslation(response.data.translated_sentence); // ส่งผลการแปลกลับไปที่ Body
    } catch (error) {
      setError(error.message);
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

      {transcription.length > 0 && (
        <Paper elevation={3} sx={{ p: 2, borderRadius: '8px', width: '100%', maxWidth: '800px' }}>
          <Box sx={{ bgcolor: 'black', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontFamily: '"Chakra Petch", sans-serif', color: 'white' }} gutterBottom>
              ผลลัพธ์การถอดความ
            </Typography>
          </Box>
          <List sx={{ mt: 2 }}>
            {transcription.map((item, index) => (
              <ListItem key={index} sx={{ borderBottom: '1px solid #ddd', fontFamily: '"Chakra Petch", sans-serif' }}>
                <ListItemText
                  primary={item.word}
                  secondary={item.tag}
                  primaryTypographyProps={{ sx: { fontFamily: '"Chakra Petch", sans-serif', fontWeight:'500' } }}
                  secondaryTypographyProps={{ sx: { fontFamily: '"Chakra Petch", sans-serif' } }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default Transcription;
