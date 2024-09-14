import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useApi } from '../../ServiceAPI';  // Import useApi hook

const TextTranslation = ({ textToTranslate, onClearTranslation, language }) => {
  const [translatedText, setTranslatedText] = useState('');
  const { translate, loading, error } = useApi();  // Use the Context API

  useEffect(() => {
    const fetchTranslation = async () => {
      if (!textToTranslate) {
        setTranslatedText('');
        onClearTranslation();
        return;
      }

      try {
        const sourceLang = language;
        const targetLang = language === 'ไทย' ? 'คำเมือง' : 'ไทย';
        const result = await translate(textToTranslate, sourceLang, targetLang);
        setTranslatedText(result);
      } catch (err) {
        console.error('Translation failed:', err);
      }
    };

    fetchTranslation();
  }, [textToTranslate, onClearTranslation, language, translate]);

  useEffect(() => {
    if (translatedText) {
      const timer = setTimeout(() => {
        if (!textToTranslate) {
          setTranslatedText('');
          onClearTranslation();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [translatedText, textToTranslate, onClearTranslation]);

  return (
    <Box sx={{ width: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ mt: 1, p: 2, borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
        {loading ? (
          <Typography variant="body1" sx={{ mt: 1 }}>
            กำลังแปล...
          </Typography>
        ) : error ? (
          <Typography variant="body1" color="error" sx={{ mt: 1 }}>
            เกิดข้อผิดพลาด: {error}
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