import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  useTheme, 
  Fade, 
  Grow,
  Paper,
  IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useUser } from '../../ContextUser';
import { useApi } from '../../ServiceAPI';
import GuideModal from './GuideModal';
import LanguageSwitch from '../shared/LanguageSwitch';
import AudioPlayer from '../shared/AudioPlayer';
import TranscriptionResult from '../shared/TranscriptionResult';
import LoadingIndicator from '../shared/LoadingIndicator';
import ErrorDisplay from '../shared/ErrorDisplay';

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
  
  const transcribedFilesRef = useRef({});
  const [hasSaved, setHasSaved] = useState(false);
  const [audioHashedId, setAudioHashedId] = useState(null);
  const audioRef = useRef(null);

  const fileKey = useMemo(() => getFileKey(file), [getFileKey, file]);

  const [openGuide, setOpenGuide] = useState(false);
  const handleOpenGuide = () => setOpenGuide(true);
  const handleCloseGuide = () => setOpenGuide(false);
  const [isDragging, setIsDragging] = useState(false);

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
    console.log('handleTranscribe called', { file, fileKey });
    if (!file || !fileKey) return;
    
    if (transcribedFilesRef.current[fileKey]) {
      console.log('Using cached transcription');
      setTranscription(transcribedFilesRef.current[fileKey]);
      return;
    }
    
    setIsLoading(true);
    setError('');
    onRatingChange('unknown');
  
    try {
      const result = await transcribe(file, language, userId);
      transcribedFilesRef.current[fileKey] = result.transcription;
      setTranscription(result.transcription);
      setTranscribedFiles(prev => ({ ...prev, [fileKey]: result.transcription }));
      setAudioHashedId(result.hashedId);
      await handleTranslate(result.transcription);
    } catch (err) {
      console.error('Transcription failed:', err);
      setError('การถอดความล้มเหลว');
    } finally {
      setIsLoading(false);
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
    console.log('fileKey changed:', fileKey);
    if (file && fileKey && !transcribedFilesRef.current[fileKey]) {
      handleTranscribe();
    } else if (file && fileKey && transcribedFilesRef.current[fileKey]) {
      setTranscription(transcribedFilesRef.current[fileKey]);
    }
  }, [file, fileKey, handleTranscribe, setTranscription]);

  const handleFileUpload = useCallback((uploadedFile) => {
    if (uploadedFile) {
      onFileUpload(uploadedFile);
      onRatingChange('unknown');
      setTranscription('');
      setError('');
      setAudioHashedId(null);
      setHasSaved(false);
    }
  }, [onFileUpload, onRatingChange, setTranscription, setError]);
  
  useEffect(() => {
    if (transcription) {
      window.scrollTo(0, 0);
    }
  }, [transcription]);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    if (!hasVisited) {
      setOpenGuide(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  useEffect(() => {
    console.log('Component mounted');
    return () => {
      console.log('Component will unmount');
    };
  }, []);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMobile) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isMobile) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

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

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          width: '100%', 
          maxWidth: 600, 
          bgcolor: '#f5f5f5', 
          borderRadius: '16px',
          ...(isMobile ? {} : {
            border: isDragging ? '2px dashed #1976d2' : '2px dashed #ccc',
            backgroundColor: isDragging ? '#e3f2fd' : '#f5f5f5',
            transition: 'all 0.3s ease',
          })
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Typography variant="h6" sx={{ fontFamily: '"Chakra Petch", sans-serif', color: '#333', mb: 2 }}>
          {isMobile ? 'อัปโหลดไฟล์เสียง' : 'ลากและวางไฟล์เสียงที่นี่'}
        </Typography>

        {isMobile && (
          <LanguageSwitch language={language} toggleLanguage={toggleLanguage} />
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
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
            {isMobile ? 'อัปโหลดไฟล์เสียง' : 'เลือกไฟล์เสียง'}
            <input
              type="file"
              hidden
              accept="audio/*"
              onChange={(e) => handleFileUpload(e.target.files[0])}
            />
          </Button>
          
          {file && (
            <Fade in={true} timeout={500}>
              <Box sx={{ width: '100%', mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif', fontSize: '0.9rem', color: 'text.secondary' }}>
                  ไฟล์ที่เลือก: {file.name}
                </Typography>
                <AudioPlayer audioUrl={URL.createObjectURL(file)} />
              </Box>
            </Fade>
          )}
        </Box>

        {isLoading && <LoadingIndicator />}
        {error && <ErrorDisplay error={error} />}

        {transcription && (
          <Fade in={Boolean(transcription)}>
            <Box>
              <TranscriptionResult
                transcription={transcription}
                rating={rating}
                handleRating={handleRating}
              />
            </Box>
          </Fade>
        )}
      </Paper>

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