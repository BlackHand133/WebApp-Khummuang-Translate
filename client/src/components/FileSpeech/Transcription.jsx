import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, IconButton, Alert, Button, useTheme } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useUser } from '../../ContextUser';
import { useApi } from '../../ServiceAPI';
import { keyframes } from '@emotion/react';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

const Transcription = ({
  file,
  onTranslation,
  language,
  setLanguage,
  username,
  transcription,
  setTranscription,
  isLoading,
  setIsLoading,
  error,
  setError,
  transcribedFiles,
  setTranscribedFiles,
  getFileKey,
  isMobile,
  onFileUpload,
  rating,
  onRatingChange
}) => {
  const { userId } = useUser();
  const { transcribe, translate, recordAudio, updateRating } = useApi();
  
  const hasTranscribedRef = useRef(false);
  const isTranscribingRef = useRef(false);

  const fileKey = useMemo(() => getFileKey(file), [getFileKey, file]);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isDislikeAnimating, setIsDislikeAnimating] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [audioHashedId, setAudioHashedId] = useState(null);

  const handleRating = useCallback(async (newRating) => {
    if (!audioHashedId) {
      console.error('No audio record hashed ID available');
      setError('ไม่สามารถอัปเดตเรตติ้งได้ เนื่องจากไม่มี ID ของบันทึกเสียง');
      return;
    }
    
    setIsLoading(true);
    try {
      await updateRating(audioHashedId, newRating);
      onRatingChange(newRating);
      if (newRating === 'like') {
        setIsLikeAnimating(true);
        setTimeout(() => setIsLikeAnimating(false), 300);
      } else if (newRating === 'dislike') {
        setIsDislikeAnimating(true);
        setTimeout(() => setIsDislikeAnimating(false), 300);
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      setError('เกิดข้อผิดพลาดในการอัปเดตเรตติ้ง');
    } finally {
      setIsLoading(false);
    }
  }, [audioHashedId, updateRating, setError, setIsLoading, onRatingChange]);

  const handleTranslate = useCallback(async (text) => {
    if (!text) return;
    
    setIsLoading(true);
    setError('');
    try {
      const sourceLang = language;
      const targetLang = language === 'ไทย' ? 'คำเมือง' : 'ไทย';
      const result = await translate(text, sourceLang, targetLang);
      onTranslation(result);
    } catch (err) {
      console.error('Translation failed:', err);
      setError('การแปลภาษาล้มเหลว');
    } finally {
      setIsLoading(false);
    }
  }, [language, translate, onTranslation, setIsLoading, setError]);

  const handleTranscribe = useCallback(async () => {
    if (!file || hasTranscribedRef.current || isTranscribingRef.current) return;
  
    isTranscribingRef.current = true;
    setIsLoading(true);
    setError('');
    onRatingChange('unknown');
  
    try {
      const result = await transcribe(file, language, userId);
      setTranscription(result.transcription);
      setTranscribedFiles(prev => ({ ...prev, [fileKey]: result.transcription }));
      setAudioHashedId(result.hashedId);
      await handleTranslate(result.transcription);
      hasTranscribedRef.current = true;
    } catch (err) {
      console.error('Transcription failed:', err);
      setError('การถอดความล้มเหลว');
    } finally {
      setIsLoading(false);
      isTranscribingRef.current = false;
    }
  }, [file, fileKey, language, userId, transcribe, handleTranslate, setTranscription, setTranscribedFiles, setIsLoading, setError, onRatingChange]);

  const saveFile = useCallback(async () => {
    if (!file || !transcription || hasSaved) return;

    setIsLoading(true);
    setError('');
    try {
      const duration = Math.round(file.size / 16000);
      const formData = new FormData();
      formData.append('audio_file', file);
      formData.append('user_id', userId || 'guest');
      formData.append('language', language);
      formData.append('transcription', transcription);
      formData.append('duration', duration.toString());
      formData.append('source', 'UPLOAD');

      const result = await recordAudio(formData);
      console.log('File saved successfully:', result);
      setAudioHashedId(result.hashedId);
      setHasSaved(true);
    } catch (err) {
      console.error('Error saving file:', err);
      setError('การบันทึกไฟล์ล้มเหลว');
    } finally {
      setIsLoading(false);
    }
  }, [file, transcription, userId, language, recordAudio, setIsLoading, setError, hasSaved]);

  const toggleLanguage = useCallback(async () => {
    try {
      const newLanguage = language === 'คำเมือง' ? 'ไทย' : 'คำเมือง';
      setLanguage(newLanguage);
      if (transcription) {
        await handleTranslate(transcription);
      }
    } catch (error) {
      console.error('Error toggling language:', error);
      setError('เกิดข้อผิดพลาดในการเปลี่ยนภาษา');
    }
  }, [language, setLanguage, transcription, handleTranslate, setError]);

  useEffect(() => {
    if (file && !hasTranscribedRef.current && !isTranscribingRef.current) {
      hasTranscribedRef.current = false;
      setHasSaved(false);
      onRatingChange('unknown');
      handleTranscribe();
    }
  }, [file, handleTranscribe, onRatingChange]);

  const theme = useTheme();

  const handleFileUpload = useCallback((event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      onFileUpload(uploadedFile);
      onRatingChange('unknown');
      hasTranscribedRef.current = false;
      isTranscribingRef.current = false;
    }
  }, [onFileUpload, onRatingChange]);

  const LanguageSwitch = useMemo(() => (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', mb: 1 }}>
      <Button 
        sx={{ 
          borderRadius: '20px', 
          padding: '8px 15px', 
          border: '2px solid #e0e0e0', 
          minWidth: '80px', 
          bgcolor: 'ButtonShadow',
          color: 'black',
          transition: 'background-color 0.3s', 
          '&:hover': {
            bgcolor: '#CBC3E3'
          }
        }}
        onClick={toggleLanguage}
        disabled={isLoading}
      >
        <Typography sx={{ fontFamily: '"Mitr", sans-serif', fontWeight: 400, fontSize: '0.8rem' }}>{language}</Typography>
      </Button>
      <IconButton sx={{ color: '#4a90e2' }} onClick={toggleLanguage} disabled={isLoading}>
        <SwapHorizIcon />
      </IconButton>
      <Button 
        sx={{ 
          borderRadius: '20px', 
          padding: '8px 15px', 
          border: '1px solid #e0e0e0', 
          minWidth: '80px', 
          bgcolor: 'ButtonShadow',
          color: 'black',
          transition: 'background-color 0.3s', 
          '&:hover': {
            bgcolor: '#CBC3E3'
          }
        }}
        onClick={toggleLanguage}
        disabled={isLoading}
      >
        <Typography sx={{ fontFamily: '"Mitr", sans-serif', fontWeight: 400, fontSize: '0.8rem' }}>{language === 'คำเมือง' ? 'ไทย' : 'คำเมือง'}</Typography>
      </Button>
    </Box>
  ), [language, toggleLanguage, isLoading]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', minHeight: '500px' }}>
      {isMobile && (
        <>
          {LanguageSwitch}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Paper
              elevation={3}
              sx={{
                width: '100%',
                maxWidth: '300px',
                height: '120px',
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              <Button
                component="label"
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                <CloudUploadIcon sx={{ fontSize: '3rem', mb: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  อัปโหลดไฟล์เสียง
                </Typography>
                <Typography variant="caption" sx={{ mt: 0.5 }}>
                  แตะเพื่อเลือกไฟล์
                </Typography>
                <input
                  type="file"
                  hidden
                  accept="audio/*"
                  onChange={handleFileUpload}
                />
              </Button>
            </Paper>
          </Box>
        </>
      )}

      {isLoading && <CircularProgress sx={{ display: 'block', margin: '20px' }} />}
      {error && (
        <Typography color="error" variant="body1" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}
      {transcription && (
        <Box 
          elevation={3} 
          sx={{ 
            p: 2, 
            borderRadius: '8px', 
            width: '100%', 
            backgroundColor: '#f5f5f5',
            mb: { xs: 1, lg: 0 },
            boxShadow: isMobile ? 'none' : 3
          }}
        >
          <Box sx={{ bgcolor: 'black', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', mb: 2 }}>
            <Typography variant="h6" sx={{ fontFamily: '"Chakra Petch", sans-serif', color: 'white' }} gutterBottom>
              ผลลัพธ์การถอดความ
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mt: 2, mb: 2, fontFamily: '"Chakra Petch", sans-serif' }}>
            {transcription}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, alignItems: 'center' }}>
            <IconButton
              onClick={() => handleRating('like')}
              sx={{
                animation: isLikeAnimating ? `${pulse} 0.3s ease-in-out` : 'none',
              }}
            >
              {rating === 'like' ? <ThumbUpAltIcon sx={{ fontSize: '1.5rem', color: '#1976d2' }} /> : <ThumbUpOffAltIcon sx={{ fontSize: '1.5rem' }} />}
            </IconButton>
            <IconButton
              onClick={() => handleRating('dislike')}
              sx={{
                animation: isDislikeAnimating ? `${pulse} 0.3s ease-in-out` : 'none',
              }}
            >
              {rating === 'dislike' ? <ThumbDownAltIcon sx={{ fontSize: '1.5rem', color: '#d32f2f' }} /> : <ThumbDownOffAltIcon sx={{ fontSize: '1.5rem' }} />}
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(Transcription);