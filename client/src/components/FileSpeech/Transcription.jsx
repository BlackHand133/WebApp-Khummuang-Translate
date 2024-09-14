import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, IconButton } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { useUser } from '../../ContextUser';
import { useApi } from '../../ServiceAPI';

const Transcription = ({
  file,
  onTranslation,
  language,
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
  setTranscribedFiles, // Add this prop
  getFileKey
}) => {
  const { userId } = useUser();
  const { transcribe, translate, recordAudio } = useApi();
  
  const previousFileRef = useRef(null);
  const hasTranscribedRef = useRef(false);

  const fileKey = useMemo(() => getFileKey(file), [getFileKey, file]);

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
      setTranscribedFiles(prev => ({ ...prev, [fileKey]: result })); // Update transcribedFiles
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
    } catch (err) {
      console.error('Error saving file:', err);
      setError('การบันทึกไฟล์ล้มเหลว');
    } finally {
      setIsLoading(false);
    }
  }, [file, transcription, userId, language, recordAudio, setIsLoading, setError]);

  const [hasSaved, setHasSaved] = useState(false);

  const toggleLike = useCallback(async () => {
    if (!liked && !hasSaved) {
      await saveFile();
      setHasSaved(true);
    }
    setLiked(prev => !prev);
  }, [liked, hasSaved, saveFile, setLiked]);

  useEffect(() => {
    hasTranscribedRef.current = false;
    setHasSaved(false);
    if (file && file !== previousFileRef.current) {
      handleTranscribe();
      previousFileRef.current = file;
    }
  }, [file, handleTranscribe]);

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, ml: 'auto' }}
            onClick={toggleLike}
          >
            {liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
          </IconButton>
        </Paper>
      )}
    </Box>
  );
};

export default Transcription;