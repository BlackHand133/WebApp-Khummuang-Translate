import React, { useState, useRef, forwardRef, useImperativeHandle, useCallback, useEffect } from 'react';
import { Typography, Box, Paper, CircularProgress, IconButton } from '@mui/material';
import axios from 'axios';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { useUser } from '../../ContextUser';

const SpeechMic = forwardRef(({ onTranslation, language }, ref) => {
  const [transcription, setTranscription] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [transcriptionStatus, setTranscriptionStatus] = useState('');
  const [translation, setTranslation] = useState('');
  const [liked, setLiked] = useState(false);

  const { userId, username } = useUser();

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording
  }));

  useEffect(() => {
    // Retrieve saved data from sessionStorage when component mounts
    const savedTranscription = sessionStorage.getItem('transcription');
    const savedAudioUrl = sessionStorage.getItem('audioUrl');
    const savedTranscriptionStatus = sessionStorage.getItem('transcriptionStatus');
    const savedTranslation = sessionStorage.getItem('translation');

    if (savedTranscription) setTranscription(savedTranscription);
    if (savedAudioUrl) setAudioUrl(savedAudioUrl);
    if (savedTranscriptionStatus) setTranscriptionStatus(savedTranscriptionStatus);
    if (savedTranslation) setTranslation(savedTranslation);
  }, []);

  useEffect(() => {
    // Save data to sessionStorage whenever they change
    sessionStorage.setItem('transcription', transcription);
    sessionStorage.setItem('audioUrl', audioUrl);
    sessionStorage.setItem('transcriptionStatus', transcriptionStatus);
    sessionStorage.setItem('translation', translation);
  }, [transcription, audioUrl, transcriptionStatus, translation]);

  const setupAudioProcessing = useCallback((stream) => {
    // Setup audio processing (implement as needed)
  }, []);

  const translateText = async (text) => {
    try {
      const response = await axios.post('http://localhost:8080/api/translate', {
        sentence: text,
        language: language,
      });
      const translatedText = response.data.translated_sentence;
      setTranslation(translatedText);
      onTranslation(translatedText);
    } catch (error) {
      console.error('Error translating text:', error);
      setTranslation('เกิดข้อผิดพลาดในการแปล');
    }
  };

  const saveFile = async () => {
    if (!audioUrl || !transcription) return;

    const formData = new FormData();
    formData.append('file', audioUrl, 'recording.webm');
    formData.append('user_id', userId || 'guest');
    formData.append('transcription_text', transcription);

    try {
      await axios.post('http://localhost:8080/api/savefile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      console.error('Error saving file:', error.message);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      setupAudioProcessing(stream);

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
        const newAudioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(newAudioUrl);

        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('language', language);
        formData.append('username', username);

        try {
          const response = await axios.post('http://localhost:8080/api/transcribe_Mic', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const transcriptionText = response.data.transcription;
          setTranscription(transcriptionText);
          setTranscriptionStatus('ถอดเสียงเสร็จสิ้น');
          translateText(transcriptionText);
        } catch (error) {
          console.error('Error transcribing audio:', error);
          setTranscriptionStatus('เกิดข้อผิดพลาดในการถอดเสียง');
        }
      };

      mediaRecorder.start();
      setTranscriptionStatus('กำลังบันทึกเสียง...');
    } catch (error) {
      console.error('Error starting recording:', error);
      setTranscriptionStatus('เกิดข้อผิดพลาดในการเริ่มบันทึก');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      saveFile(); // Save the file when stopping recording
    }
  };

  const toggleLike = async () => {
    setLiked(prevLiked => !prevLiked); // Toggle like status

    if (!liked) {
      await saveFile(); // Save file when liking
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      {transcriptionStatus && (
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif' }}>
          {transcriptionStatus}
        </Typography>
      )}
      {!transcription && !transcriptionStatus && (
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
          >
            {liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
          </IconButton>
        </Paper>
      )}
    </Box>
  );
});

export default SpeechMic;
