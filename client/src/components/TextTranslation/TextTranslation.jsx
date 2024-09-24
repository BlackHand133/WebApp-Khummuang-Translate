import React, { useEffect, useCallback } from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { useApi } from '../../ServiceAPI';

const TextTranslation = ({ 
  textToTranslate, 
  onTranslation, 
  onClearTranslation, 
  language, 
  isMobile, 
  translatedText,
  inputText,
  setInputText
}) => {
  const { translate, loading, error } = useApi();

  const fetchTranslation = useCallback(async () => {
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
  }, [textToTranslate, language, translate, onTranslation, onClearTranslation]);

  useEffect(() => {
    fetchTranslation();
  }, [fetchTranslation]);

  useEffect(() => {
    // Swap text when language changes
    if (language === 'ไทย') {
      setInputText(translatedText);
      onTranslation(inputText);
    } else {
      setInputText(translatedText);
      onTranslation(inputText);
    }
  }, [language]);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box elevation={isMobile ? 1 : 3} sx={{ width: '100%', borderRadius: isMobile ? '4px' : '8px' }}>
        <Box sx={{ p: 2 }}> {/* ย้าย padding มาที่นี่ */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              <Typography variant="body1" sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                กำลังแปล...
              </Typography>
            </Box>
          ) : error ? (
            <Typography variant="body1" color="error" sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
              เกิดข้อผิดพลาด: {error}
            </Typography>
          ) : (
            <Typography variant="body1" sx={{ fontFamily: '"Chakra Petch", sans-serif', fontWeight: '500', fontSize: isMobile ? '0.9rem' : '1rem' }}>
              {translatedText || 'รอการแปล...'}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TextTranslation;