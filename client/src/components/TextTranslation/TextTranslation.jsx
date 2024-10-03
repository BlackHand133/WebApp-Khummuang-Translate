import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useApi } from '../../ServiceAPI';

const TextTranslation = ({ 
  textToTranslate, 
  onTranslation, 
  onClearTranslation, 
  language, 
  isMobile, 
  setInputText
}) => {
  const { translateWs, loading, error, clearError } = useApi();
  const [translatedText, setTranslatedText] = useState('');
  const lastTranslationRef = useRef('');
  const translationTimeoutRef = useRef(null);

  const clearTranslation = useCallback(() => {
    setTranslatedText('');
    onClearTranslation();
    lastTranslationRef.current = '';
  }, [onClearTranslation]);

  const fetchTranslation = useCallback(async (text) => {
    if (!text.trim()) {
      clearTranslation();
      return;
    }

    try {
      clearError();
      const sourceLang = language;
      const targetLang = language === 'ไทย' ? 'คำเมือง' : 'ไทย';
      const result = await translateWs(text, sourceLang, targetLang);
      
      setTranslatedText(result);
      onTranslation(result);
      lastTranslationRef.current = text;
    } catch (err) {
      console.error('Translation failed:', err);
      setTranslatedText('');
    }
  }, [translateWs, language, onTranslation, clearError, clearTranslation]);

  useEffect(() => {
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }

    if (!textToTranslate.trim()) {
      clearTranslation();
      return;
    }

    translationTimeoutRef.current = setTimeout(() => {
      fetchTranslation(textToTranslate);
    }, 300); // 300ms delay

    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, [textToTranslate, fetchTranslation, clearTranslation]);

  useEffect(() => {
    // Swap text when language changes
    const newInputText = language === 'ไทย' ? translatedText : textToTranslate;
    const newTranslatedText = language === 'ไทย' ? textToTranslate : translatedText;
    
    setInputText(newInputText);
    setTranslatedText(newTranslatedText);
    onTranslation(newTranslatedText);
  }, [language, translatedText, textToTranslate, setInputText, onTranslation]);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ width: '100%', borderRadius: isMobile ? '4px' : '8px', padding: 2 }}>
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
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: '"Chakra Petch", sans-serif', 
              fontWeight: '500', 
              fontSize: isMobile ? '0.9rem' : '1rem',
              minHeight: '1.5em' // Ensure consistent height
            }}
          >
            {translatedText || '\u00A0'} {/* Use non-breaking space to maintain height */}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TextTranslation;