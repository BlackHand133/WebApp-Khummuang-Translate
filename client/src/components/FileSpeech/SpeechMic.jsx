import React, { useRef, forwardRef, useImperativeHandle, useCallback, useEffect, useState } from 'react';
import { Typography, Box, Paper, IconButton, CircularProgress } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { useApi } from '../../ServiceAPI';
import { useUser } from '../../ContextUser';

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
  setError
}, ref) => {
  const { userId } = useUser();
  const { transcribeMic, translate, recordAudio } = useApi();

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
  }, []);

  const toggleLike = useCallback(async () => {
    if (!liked && !hasSaved) {
      await saveFile();
    }
    setLiked(prev => !prev);
  }, [liked, hasSaved, saveFile, setLiked]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      {isLoading && <CircularProgress />}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      {transcriptionStatus && (
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif' }}>
          {transcriptionStatus}
        </Typography>
      )}
      {!transcription && !transcriptionStatus && !isLoading && (
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif', color: 'grey' }}>
          กรุณาเริ่มบันทึกเสียงเพื่อถอดเสียง
        </Typography>
      )}
      {audioUrl && (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper sx={{ p: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <audio controls src={audioUrl} />
          </Paper>
        </Box>
      )}
      {transcription && (
        <Paper sx={{ mt: 3, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif', bgcolor: 'black', color: 'white', p: 1, borderRadius: 1 }}>
            ผลการถอดเสียง
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif', p: 2, borderRadius: 1, mb: 1 }}>
            {transcription}
          </Typography>
          <IconButton
            sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, ml: 'auto' }}
            onClick={toggleLike}
            aria-label={liked ? "Unlike" : "Like"}
          >
            {liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
          </IconButton>
        </Paper>
      )}
    </Box>
  );
});

export default SpeechMic;