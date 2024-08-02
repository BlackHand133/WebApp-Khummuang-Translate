// TextTranslation.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import axios from 'axios';

const TextTranslation = ({ textToTranslate, onClearTranslation }) => {
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTranslation = async () => {
      if (!textToTranslate) {
        setTranslatedText('');
        onClearTranslation(); // เรียกใช้ฟังก์ชันเพื่อล้างผลการแปล
        return;
      }

      setLoading(true);

      try {
        const response = await axios.post('http://localhost:8080/api/translate', {
          sentence: textToTranslate,
        });

        if (response.status === 200) {
          setTranslatedText(response.data.translated_sentence);
        } else {
          console.error(response.data.error);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslation();
  }, [textToTranslate, onClearTranslation]);

  useEffect(() => {
    if (translatedText) {
      const timer = setTimeout(() => {
        if (!textToTranslate) {
          setTranslatedText('');
          onClearTranslation(); // ล้างผลการแปลเมื่อ input เป็นค่าว่าง
        }
      }, 1000);

      return () => clearTimeout(timer); // ล้าง timer เมื่อ component ถูก unmount
    }
  }, [translatedText, textToTranslate, onClearTranslation]);

  return (
    <Box sx={{ width: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ mt: 1, p: 2, borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
        {loading ? (
          <Typography variant="body1" sx={{ mt: 1 }}>
            กำลังแปล...
          </Typography>
        ) : (
          <Typography variant="body1" sx={{ mt: 1, fontFamily: '"Chakra Petch", sans-serif', fontWeight: '500' }}>
            {translatedText || 'รอการแปล...'}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default TextTranslation;
