import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { useApi } from '../../ServiceAPI';

const TextTranslation = ({ 
  textToTranslate, 
  onTranslation, 
  onClearTranslation, 
  language, 
  isMobile, 
  setInputText
}) => {
  const { translateWs, error, clearError, socketRef } = useApi();
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const translationTimeoutRef = useRef(null);
  const previousLanguageRef = useRef(language);

  const clearTranslation = useCallback(() => {
    setTranslatedText('');
    onClearTranslation();
  }, [onClearTranslation]);

  const fetchTranslation = useCallback(async (text, sourceLang, targetLang) => {
    if (!text.trim()) {
      clearTranslation();
      return;
    }

    setIsTranslating(true);
    try {
      clearError();
      const result = await translateWs(text, sourceLang, targetLang);
      setTranslatedText(result);
      onTranslation(result);
    } catch (err) {
      console.error('Translation failed:', err);
      setTranslatedText('');
    } finally {
      setIsTranslating(false);
    }
  }, [translateWs, onTranslation, clearError, clearTranslation]);

  useEffect(() => {
    const handleTranslationUpdate = (data) => {
      if (data.type === 'translation') {
        setTranslatedText(data.text);
        onTranslation(data.text);
        setIsTranslating(false);
      }
    };

    socketRef.current.on('translation_update', handleTranslationUpdate);

    return () => {
      socketRef.current.off('translation_update', handleTranslationUpdate);
    };
  }, [socketRef, onTranslation]);

  useEffect(() => {
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }

    if (!textToTranslate.trim()) {
      clearTranslation();
      return;
    }

    setIsTranslating(true);

    translationTimeoutRef.current = setTimeout(() => {
      const sourceLang = language;
      const targetLang = language === 'ไทย' ? 'คำเมือง' : 'ไทย';
      fetchTranslation(textToTranslate, sourceLang, targetLang);
    }, 300);

    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, [textToTranslate, language, fetchTranslation, clearTranslation]);

  useEffect(() => {
    if (previousLanguageRef.current !== language) {
      const newInputText = translatedText;
      const newTranslatedText = textToTranslate;
      
      setInputText(newInputText);
      setTranslatedText(newTranslatedText);
      onTranslation(newTranslatedText);

      const sourceLang = language;
      const targetLang = language === 'ไทย' ? 'คำเมือง' : 'ไทย';
      fetchTranslation(newInputText, sourceLang, targetLang);
    }
    previousLanguageRef.current = language;
  }, [language, translatedText, textToTranslate, setInputText, onTranslation, fetchTranslation]);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ width: '100%', borderRadius: isMobile ? '4px' : '8px', padding: 2 }}>
        {error ? (
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
              minHeight: '1.5em',
              color: isTranslating ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.87)',
              transition: 'color 0.3s ease-in-out'
            }}
          >
            {translatedText || (isTranslating ? 'กำลังแปล...' : 'คำแปลจะปรากฏที่นี่')}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TextTranslation;