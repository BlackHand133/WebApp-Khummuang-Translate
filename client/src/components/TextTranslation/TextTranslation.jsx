import React, { useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useApi } from '../../ServiceAPI';

const TextTranslation = ({ textToTranslate, onTranslation, onClearTranslation, language, isMobile, translatedText }) => {
  const { translate, loading, error } = useApi();

  useEffect(() => {
    const fetchTranslation = async () => {
      if (!textToTranslate) {
        onClearTranslation();
        return;
      }

      try {
        const sourceLang = language;
        const targetLang = language === 'ไทย' ? 'คำเมือง' : 'ไทย';
        const result = await translate(textToTranslate, sourceLang, targetLang);
        onTranslation(result);
      } catch (err) {
        console.error('Translation failed:', err);
      }
    };

    fetchTranslation();
  }, [textToTranslate, language, translate, onTranslation, onClearTranslation]);

  return (
    <Box sx={{ width: '100%', p: isMobile ? 1 : 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={isMobile ? 1 : 3} sx={{ mt: 1, p: isMobile ? 1 : 2, borderRadius: isMobile ? '4px' : '8px', width: '100%', maxWidth: '500px' }}>
        {loading ? (
          <Typography variant="body1" sx={{ mt: 1, fontSize: isMobile ? '0.9rem' : '1rem' }}>
            กำลังแปล...
          </Typography>
        ) : error ? (
          <Typography variant="body1" color="error" sx={{ mt: 1, fontSize: isMobile ? '0.9rem' : '1rem' }}>
            เกิดข้อผิดพลาด: {error}
          </Typography>
        ) : (
          <Typography variant="body1" sx={{ mt: 1, fontFamily: '"Chakra Petch", sans-serif', fontWeight: '500', fontSize: isMobile ? '0.9rem' : '1rem' }}>
            {translatedText || 'รอการแปล...'}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default TextTranslation;