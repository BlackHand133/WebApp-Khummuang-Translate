import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, IconButton, Alert, Button, useTheme } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
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
  liked,
  setLiked,
  isLoading,
  setIsLoading,
  error,
  setError,
  transcribedFiles,
  setTranscribedFiles,
  getFileKey,
  isMobile,
  onFileUpload
}) => {
  const { userId } = useUser();
  const { transcribe, translate, recordAudio } = useApi();
  
  const previousFileRef = useRef(null);
  const hasTranscribedRef = useRef(false);

  const fileKey = useMemo(() => getFileKey(file), [getFileKey, file]);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [showUploadAlert, setShowUploadAlert] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

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
    if (!file || hasTranscribedRef.current) return;

    if (fileKey && transcribedFiles[fileKey]) {
      setTranscription(transcribedFiles[fileKey]);
      await handleTranslate(transcribedFiles[fileKey]);
      hasTranscribedRef.current = true;
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const result = await transcribe(file, language);
      setTranscription(result);
      setTranscribedFiles(prev => ({ ...prev, [fileKey]: result }));
      await handleTranslate(result);
      hasTranscribedRef.current = true;
    } catch (err) {
      console.error('Transcription failed:', err);
      setError('การถอดความล้มเหลว');
    } finally {
      setIsLoading(false);
    }
  }, [file, fileKey, language, transcribe, handleTranslate, setTranscription, setTranscribedFiles, setIsLoading, setError, transcribedFiles]);

  const saveFile = useCallback(async () => {
    if (!file || !transcription) return;
  
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
  
      const result = await recordAudio(formData);
      console.log('File saved successfully:', result);
      setHasSaved(true);
    } catch (err) {
      console.error('Error saving file:', err);
      setError('การบันทึกไฟล์ล้มเหลว');
    } finally {
      setIsLoading(false);
    }
  }, [file, transcription, userId, language, recordAudio, setIsLoading, setError]);

  const toggleLike = useCallback(async () => {
    if (!liked && !hasSaved) {
      await saveFile();
    }
    setLiked(prev => !prev);
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 300);
  }, [liked, hasSaved, saveFile, setLiked]);

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
    hasTranscribedRef.current = false;
    setHasSaved(false);
    if (file && file !== previousFileRef.current) {
      handleTranscribe();
      previousFileRef.current = file;
      setShowUploadAlert(false);
    } else if (!file) {
      setShowUploadAlert(true);
    }
  }, [file, handleTranscribe]);

  const theme = useTheme();

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      onFileUpload(uploadedFile);
    }
  };

  const LanguageSwitch = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', my: '1em' }}>
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
  );

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {!isMobile && showUploadAlert && (
        <Alert severity="info" sx={{ width: '100%', maxWidth: '800px', mb: 2 }}>
          กรุณากดปุ่มอัปโหลดไฟล์ที่แถบด้านซ้ายเพื่อเริ่มการถอดความ
        </Alert>
      )}

      {isMobile && (
        <>
          <LanguageSwitch />
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 3 }}>
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
        <Paper elevation={3} sx={{ p: 2, borderRadius: '8px', width: '100%', maxWidth: '800px' }}>
          <Box sx={{ bgcolor: 'black', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontFamily: '"Chakra Petch", sans-serif', color: 'white' }} gutterBottom>
              ผลลัพธ์การถอดความ
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {transcription}
          </Typography>
          <IconButton
            sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              mt: 2, 
              ml: 'auto',
              animation: isLikeAnimating ? `${pulse} 0.3s ease-in-out` : 'none',
            }}
            onClick={toggleLike}
          >
            {liked ? (
              <ThumbUpAltIcon sx={{ fontSize: '2rem', color: '#1976d2' }} />
            ) : (
              <ThumbUpOffAltIcon sx={{ fontSize: '1.5rem' }} />
            )}
          </IconButton>
        </Paper>
      )}
    </Box>
  );
};

export default Transcription;