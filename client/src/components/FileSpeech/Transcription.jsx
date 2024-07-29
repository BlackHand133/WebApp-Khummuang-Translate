import React, { useState, useEffect } from 'react';
import axios from 'axios'; // นำเข้า Axios
import { Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress } from '@mui/material';

const Transcription = ({ file }) => {
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
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    handleTranscribe();
  }, [file]);

  return (
    <Box sx={{ p: 3 }}>
      {loading && <CircularProgress sx={{ display: 'block', margin: '0 auto' }} />}
      
      {error && (
        <Typography color="error" variant="body1">
          Error: {error}
        </Typography>
      )}
      
      {transcription.length > 0 && (
        <Paper elevation={3} sx={{ p: 2, borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom>ผลลัพธ์การถอดความ:</Typography>
          <List>
            {transcription.map((item, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={item.word}
                  secondary={item.tag}
                  sx={{ fontFamily: '"Roboto", sans-serif' }}
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
