import React, { useRef, forwardRef, useImperativeHandle, useCallback, useEffect, useState } from 'react';
import { Typography, Box, Paper, IconButton, CircularProgress, Fade, Chip, Alert, Divider } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import MicIcon from '@mui/icons-material/Mic';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useApi } from '../../ServiceAPI';
import { useUser } from '../../ContextUser';
import { keyframes } from '@emotion/react';
import InfoIcon from '@mui/icons-material/Info';

const SpeechMic = forwardRef(({ 
  onTranslation, 
  language,
  transcription,
  setTranscription,
  audioUrl,
  onAudioRecorded,
  transcriptionStatus,
  setTranscriptionStatus,
  translation,
  setTranslation,
  liked,
  setLiked,
  isLoading,
  setIsLoading,
  error,
  setError,
  isMobile
}, ref) => {
  const { userId } = useUser();
  const { transcribeMic, translate, recordAudio } = useApi();
  const [isRecording, setIsRecording] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [hasSaved, setHasSaved] = useState(false);

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording
  }));

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const translateText = useCallback(async (text) => {
    setIsLoading(true);
    setError('');
    try {
      const translatedText = await translate(text, language, language === 'ไทย' ? 'คำเมือง' : 'ไทย');
      setTranslation(translatedText);
      onTranslation(translatedText);
    } catch (error) {
      console.error('Error translating text:', error);
      setError('เกิดข้อผิดพลาดในการแปล');
    } finally {
      setIsLoading(false);
    }
  }, [language, onTranslation, setError, setIsLoading, setTranslation, translate]);

  const saveFile = useCallback(async () => {
    if (!audioUrl || !transcription || hasSaved) return;

    setIsLoading(true);
    setError('');
    try {
      const audioBlob = await fetch(audioUrl).then(r => r.blob());
      const duration = Math.round(audioBlob.size / 16000);

      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.webm');
      formData.append('user_id', userId || 'guest');
      formData.append('transcription', transcription);
      formData.append('language', language);
      formData.append('duration', duration.toString());

      const result = await recordAudio(formData);
      console.log('File saved successfully:', result);
      setHasSaved(true);
    } catch (error) {
      console.error('Error saving file:', error);
      setError('เกิดข้อผิดพลาดในการบันทึกไฟล์');
    } finally {
      setIsLoading(false);
    }
  }, [audioUrl, transcription, userId, language, recordAudio, setError, setIsLoading, hasSaved]);

  const startRecording = useCallback(async () => {
    setError('');
    setTranscription('');
    setTranslation('');
    setTranscriptionStatus('');
    setHasSaved(false);
    setIsRecording(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
        audioBitsPerSecond: 192000,
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onAudioRecorded(audioBlob);
      
        setIsLoading(true);
        try {
          const formData = new FormData();
          formData.append('audio_file', audioBlob, 'recording.webm');
          formData.append('language', language);
      
          const transcriptionText = await transcribeMic(formData);
          setTranscription(transcriptionText);
          setTranscriptionStatus('ถอดเสียงเสร็จสิ้น');
          await translateText(transcriptionText);
        } catch (error) {
          console.error('Error transcribing audio:', error);
          setError('เกิดข้อผิดพลาดในการถอดเสียง');
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setTranscriptionStatus('กำลังบันทึกเสียง...');
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('เกิดข้อผิดพลาดในการเริ่มบันทึก');
    }
  }, [language, setTranscription, setTranslation, setTranscriptionStatus, setIsLoading, setError, onAudioRecorded, transcribeMic, translateText]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const toggleLike = useCallback(async () => {
    if (!liked && !hasSaved) {
      await saveFile();
    }
    setLiked(prev => !prev);
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 300);
  }, [liked, hasSaved, saveFile, setLiked]);

  const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const ripple = keyframes`
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.4); opacity: 0; }
`;

return (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', mt: 2 }}>
    <Paper elevation={3} sx={{ p: 3, width: '100%', maxWidth: 600, bgcolor: '#f5f5f5', borderRadius: '16px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontFamily: '"Chakra Petch", sans-serif', color: '#333' }}>
          บันทึกเสียง
        </Typography>
        
        {!isMobile && (
          <Chip
            icon={<MicIcon />}
            label={isRecording ? "กำลังบันทึก..." : "พร้อมบันทึก"}
            color={isRecording ? "secondary" : "default"}
            sx={{
              animation: isRecording ? `${pulse} 1.5s ease-in-out infinite` : 'none',
              '& .MuiChip-icon': {
                color: isRecording ? 'inherit' : '#757575',
              },
            }}
          />
        )}
      </Box>
      
      {!isMobile && (
        <Alert
          severity="info" 
          icon={<InfoIcon />}
          sx={{ 
            mt: 2, 
            fontFamily: '"Chakra Petch", sans-serif',
            '& .MuiAlert-icon': {
              color: '#1976d2',
            },
          }}
        >
          กดปุ่มไมโครโฟนแถบด้านซ้าย เพื่อเริ่มบันทึก
        </Alert>
      )}

      {isMobile && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
          <Box
            sx={{
              position: 'relative',
              width: 120,
              height: 120,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                animation: isRecording ? `${ripple} 1.5s infinite` : 'none',
                backgroundColor: isRecording ? 'rgba(255, 0, 0, 0.3)' : 'transparent',
              }}
            />
            <IconButton
              onClick={isRecording ? stopRecording : startRecording}
              sx={{
                width: 100,
                height: 100,
                backgroundColor: isRecording ? 'red' : 'primary.main',
                color: 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: isRecording ? 'darkred' : 'primary.dark',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <MicIcon sx={{ fontSize: 48 }} />
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, fontFamily: '"Chakra Petch", sans-serif', color: '#666' }}>
            {isRecording ? 'แตะเพื่อหยุดบันทึก' : 'แตะเพื่อเริ่มบันทึก'}
          </Typography>
        </Box>
      )}

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        
        {error && (
          <Typography color="error" sx={{ mt: 2, textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif' }}>
            {error}
          </Typography>
        )}

        {transcriptionStatus && (
          <Fade in={Boolean(transcriptionStatus)}>
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif', color: '#666' }}>
              {transcriptionStatus}
            </Typography>
          </Fade>
        )}

        {audioUrl && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', width: '100%' }}>
            <VolumeUpIcon sx={{ mr: 1, color: '#1976d2' }} />
            <audio controls src={audioUrl} style={{ width: '100%' }} />
          </Box>
        )}

        {transcription && (
          <Fade in={Boolean(transcription)}>
            <Box sx={{ mt: 3, width: '100%' }}>
              <Box sx={{ bgcolor: 'black', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', mb:3 }}>
                <Typography variant="h6" sx={{ fontFamily: '"Chakra Petch", sans-serif', color: 'white' }} gutterBottom>
                  ผลลัพธ์การถอดความ
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontFamily: '"Chakra Petch", sans-serif',p:2 }}>
                {transcription}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, alignItems: 'center' }}>
                <IconButton
                  onClick={toggleLike}
                  sx={{
                    animation: isLikeAnimating ? `${pulse} 0.3s ease-in-out` : 'none',
                  }}
                >
                  {liked ? <ThumbUpAltIcon sx={{ fontSize: '1.5rem', color: '#1976d2' }} /> : <ThumbUpOffAltIcon sx={{ fontSize: '1.5rem' }} />}
                </IconButton>
              </Box>
            </Box>
          </Fade>
        )}
      </Paper>
    </Box>
  );
});

export default SpeechMic;