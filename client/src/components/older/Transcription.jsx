import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  IconButton, 
  Button, 
  useTheme, 
  Fade, 
  Grow
} from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useUser } from '../../ContextUser';
import { useApi } from '../../ServiceAPI';
import { keyframes } from '@emotion/react';
import GuideModal from './GuideModal';  // Import the GuideModal component

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
  const theme = useTheme();
  
  const hasTranscribedRef = useRef(false);
  const isTranscribingRef = useRef(false);

  const fileKey = useMemo(() => getFileKey(file), [getFileKey, file]);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isDislikeAnimating, setIsDislikeAnimating] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [audioHashedId, setAudioHashedId] = useState(null);
  const audioRef = useRef(null);

  const [openGuide, setOpenGuide] = useState(false);
  const handleOpenGuide = () => setOpenGuide(true);
  const handleCloseGuide = () => setOpenGuide(false);

  const supportedWords = [
    "คำ1", "คำ2", "คำ3", // ... add all 100 supported words here
  ];

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

  const handleFileUpload = useCallback((event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      onFileUpload(uploadedFile);
      onRatingChange('unknown');
      hasTranscribedRef.current = false;
      isTranscribingRef.current = false;
    }
  }, [onFileUpload, onRatingChange]);

  useEffect(() => {
    // Show guide on first visit
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      setOpenGuide(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

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
      mt: isMobile ? 1 : 2,
      px: isMobile ? 2 : 0,
      bgcolor: '#f0f4f8',
      borderRadius: '16px',
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <IconButton 
        onClick={handleOpenGuide}
        sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10,
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
        }}
      >
        <HelpOutlineIcon />
      </IconButton>
      {isMobile && (
        <Box sx={{ width: '100%', mb: 2 }}>
          {LanguageSwitch}
          <Grow in={true} timeout={1000}>
            <Box sx={{ 
              width: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              bgcolor: 'white', 
              borderRadius: '12px', 
              p: 2, 
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
              }
            }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{
                  width: '100%',
                  height: '56px',
                  borderRadius: '28px',
                  fontFamily: '"Chakra Petch", sans-serif',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                    boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease-in-out',
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
              
              {file && (
                <Fade in={true} timeout={500}>
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif', fontSize: '0.9rem', color: 'text.secondary' }}>
                      ไฟล์ที่เลือก: {file.name}
                    </Typography>
                    <Box sx={{ 
                      width: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      bgcolor: 'rgba(25, 118, 210, 0.05)', 
                      borderRadius: '8px', 
                      p: 1,
                      transition: 'background-color 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(25, 118, 210, 0.1)'
                      }
                    }}>
                      <VolumeUpIcon sx={{ mr: 1, color: '#1976d2', fontSize: '1.5rem' }} />
                      <audio ref={audioRef} controls src={URL.createObjectURL(file)} style={{ width: '100%', height: '40px' }} />
                    </Box>
                  </Box>
                </Fade>
              )}
            </Box>
          </Grow>
        </Box>
      )}
    
      {isLoading && (
        <Fade in={isLoading} timeout={300}>
          <CircularProgress sx={{ display: 'block', margin: '20px auto' }} size={40} thickness={4} />
        </Fade>
      )}
      {error && (
        <Grow in={true} timeout={500}>
          <Typography color="error" variant="body2" sx={{ 
            mb: 2, 
            textAlign: 'center', 
            fontFamily: '"Chakra Petch", sans-serif', 
            fontSize: '0.9rem',
            bgcolor: 'rgba(211, 47, 47, 0.1)',
            borderRadius: '8px',
            p: 2,
            width: '100%'
          }}>
            Error: {error}
          </Typography>
        </Grow>
      )}
      {transcription && (
        <Grow in={true} timeout={800}>
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: '12px', 
              width: '100%', 
              backgroundColor: 'white',
              mb: { xs: 2, lg: 0 },
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
              }
            }}
          >
            <Box sx={{ 
              bgcolor: theme.palette.primary.main, 
              padding: '12px', 
              borderRadius: '8px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              width: '100%', 
              mb: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="h6" sx={{ fontFamily: '"Chakra Petch", sans-serif', color: 'white', fontWeight: 'bold' }}>
                ผลลัพธ์การถอดความ
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ 
              p: 2, 
              fontFamily: '"Chakra Petch", sans-serif', 
              bgcolor: 'rgba(25, 118, 210, 0.05)', 
              borderRadius: '8px', 
              mb: 2,
              lineHeight: 1.6,
              transition: 'background-color 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.1)'
              }
            }}>
              {transcription}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, gap: 2 }}>
              <IconButton
                onClick={() => handleRating('like')}
                sx={{
                  animation: isLikeAnimating ? `${pulse} 0.3s ease-in-out` : 'none',
                  padding: '12px',
                  bgcolor: rating === 'like' ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                  '&:hover': { 
                    bgcolor: 'rgba(25, 118, 210, 0.2)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {rating === 'like' ? <ThumbUpAltIcon sx={{ fontSize: '1.8rem', color: '#1976d2' }} /> : <ThumbUpOffAltIcon sx={{ fontSize: '1.8rem' }} />}
              </IconButton>
              <IconButton
                onClick={() => handleRating('dislike')}
                sx={{
                  animation: isDislikeAnimating ? `${pulse} 0.3s ease-in-out` : 'none',
                  padding: '12px',
                  bgcolor: rating === 'dislike' ? 'rgba(211, 47, 47, 0.1)' : 'transparent',
                  '&:hover': { 
                    bgcolor: 'rgba(211, 47, 47, 0.2)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {rating === 'dislike' ? <ThumbDownAltIcon sx={{ fontSize: '1.8rem', color: '#d32f2f' }} /> : <ThumbDownOffAltIcon sx={{ fontSize: '1.8rem' }} />}
              </IconButton>
            </Box>
          </Box>
        </Grow>
      )}
      <GuideModal 
        open={openGuide} 
        onClose={handleCloseGuide}
        supportedWords={supportedWords}
        isMobile={isMobile}
        theme={theme}
      />
    </Box>    
  );
};

export default React.memo(Transcription);
