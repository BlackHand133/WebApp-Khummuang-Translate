import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, IconButton, Alert, Button, useTheme } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
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
  const audioRef = useRef(null);

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
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      width: '100%', 
      minHeight: isMobile ? 'auto' : '500px',
      mt: isMobile ? 1 : 2
    }}>
      {isMobile && (
        <>
          {LanguageSwitch}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 1, px: 2 }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{
                width: '100%',
                height: '48px', // Increased height for touchable area
                borderRadius: '25px', // More rounded for modern mobile design
                fontFamily: '"Chakra Petch", sans-serif',
                fontSize: '1rem', // Slightly increased font size
                textTransform: 'none',
                backgroundColor: theme.palette.primary.main,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Adding slight shadow for better visibility
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                transition: 'background-color 0.3s ease-in-out', // Smooth transition for hover effect
              }}
            >
              อัปโหลดไฟล์เสียง
              <input
                type="file"
                hidden
                accept="audio/*"
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
    
          {file && (
            <>
              <Typography variant="body2" sx={{ mb: 0.5, textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif', fontSize: '0.9rem' }}>
                ไฟล์ที่เลือก: {file.name}
              </Typography>
              <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', mb: 1, px: 2 }}>
                <VolumeUpIcon sx={{ mr: 0.5, color: '#1976d2', fontSize: '1.5rem' }} />
                <audio ref={audioRef} controls src={URL.createObjectURL(file)} style={{ width: '100%', height: '40px' }} />
              </Box>
            </>
          )}
        </>
      )}
    
      {isLoading && <CircularProgress sx={{ display: 'block', margin: '10px auto' }} size={24} />}
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 1, textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif', fontSize: '0.9rem' }}>
          Error: {error}
        </Typography>
      )}
      {transcription && (
        <Box 
          sx={{ 
            p: isMobile ? 1 : 2, 
            borderRadius: isMobile ? '4px' : '8px', 
            width: '100%', 
            backgroundColor: '#f5f5f5',
            mb: { xs: 1, lg: 0 },
            boxShadow: isMobile ? 'none' : 3
          }}
        >
          <Box sx={{ bgcolor: 'black', padding: '8px', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontFamily: '"Chakra Petch", sans-serif', color: 'white', fontSize: '0.9rem' }} gutterBottom>
              ผลลัพธ์การถอดความ
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 1, mb: 1, fontFamily: '"Chakra Petch", sans-serif', fontSize: '0.9rem' }}>
            {transcription}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, alignItems: 'center' }}>
            <IconButton
              onClick={() => handleRating('like')}
              sx={{
                animation: isLikeAnimating ? `${pulse} 0.3s ease-in-out` : 'none',
                padding: '4px',
              }}
            >
              {rating === 'like' ? <ThumbUpAltIcon sx={{ fontSize: '1.2rem', color: '#1976d2' }} /> : <ThumbUpOffAltIcon sx={{ fontSize: '1.2rem' }} />}
            </IconButton>
            <IconButton
              onClick={() => handleRating('dislike')}
              sx={{
                animation: isDislikeAnimating ? `${pulse} 0.3s ease-in-out` : 'none',
                padding: '4px',
              }}
            >
              {rating === 'dislike' ? <ThumbDownAltIcon sx={{ fontSize: '1.2rem', color: '#d32f2f' }} /> : <ThumbDownOffAltIcon sx={{ fontSize: '1.2rem' }} />}
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>    
  );
};

export default React.memo(Transcription);