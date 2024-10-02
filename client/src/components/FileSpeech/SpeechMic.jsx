import React, { useRef, forwardRef, useImperativeHandle, useCallback, useEffect, useState } from 'react';
import { Typography, Box, IconButton, Chip, Alert, Button, useTheme } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import InfoIcon from '@mui/icons-material/Info';
import { useApi } from '../../ServiceAPI';
import { useUser } from '../../ContextUser';
import { keyframes } from '@emotion/react';
import LanguageSwitch from '../shared/LanguageSwitch';
import AudioPlayer from '../shared/AudioPlayer';
import TranscriptionResult from '../shared/TranscriptionResult';
import LoadingIndicator from '../shared/LoadingIndicator';
import ErrorDisplay from '../shared/ErrorDisplay';
import GuideModal from './GuideModal'; // เพิ่มการ import GuideModal

const SpeechMic = forwardRef(({ 
  onTranslation, 
  language,
  setLanguage,
  transcription,
  setTranscription,
  audioUrl,
  onAudioRecorded,
  transcriptionStatus,
  setTranscriptionStatus,
  translation,
  setTranslation,
  isLoading,
  setIsLoading,
  error,
  setError,
  isMobile,
  rating,
  onRatingChange,
}, ref) => {
  const { userId } = useUser();
  const { transcribeMic, translate, recordAudio, updateRating } = useApi();
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecordId, setAudioRecordId] = useState(null);
  const [audioHashedId, setAudioHashedId] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [hasSaved, setHasSaved] = useState(false);

  // เพิ่ม state สำหรับควบคุม GuideModal
  const [openGuide, setOpenGuide] = useState(false);
  const handleOpenGuide = () => setOpenGuide(true);
  const handleCloseGuide = () => setOpenGuide(false);

  const theme = useTheme();

  const supportedWords = [
    "คำ1", "คำ2", "คำ3", // ... เพิ่มคำที่รองรับทั้งหมดที่นี่
  ];

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    startRecording: requestMicrophonePermission,
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

  const toggleLanguage = useCallback(async () => {
    try {
      const newLanguage = language === 'คำเมือง' ? 'ไทย' : 'คำเมือง';
      setLanguage(newLanguage);
      if (transcription) {
        await translateText(transcription);
      }
    } catch (error) {
      console.error('Error toggling language:', error);
      setError('เกิดข้อผิดพลาดในการเปลี่ยนภาษา');
    }
  }, [language, setLanguage, transcription, translateText, setError]);

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
      formData.append('source', 'MICROPHONE');

      const result = await recordAudio(formData);
      console.log('File saved successfully:', result);
      setAudioRecordId(result.recordId);
      setAudioHashedId(result.hashedId);
      setHasSaved(true);
    } catch (error) {
      console.error('Error saving file:', error);
      setError('เกิดข้อผิดพลาดในการบันทึกไฟล์');
    } finally {
      setIsLoading(false);
    }
  }, [audioUrl, transcription, userId, language, recordAudio, setError, setIsLoading, hasSaved]);

  const handleRating = useCallback(async (newRating) => {
    if (!audioHashedId) {
      console.error('No audio record hashed ID available');
      setError('ไม่สามารถอัปเดตเรตติ้งได้ เนื่องจากไม่มี ID ของบันทึกเสียง');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Updating rating for audio record:', audioHashedId);
      await updateRating(audioHashedId, newRating);
      onRatingChange(newRating);
    } catch (error) {
      console.error('Error updating rating:', error);
      setError('เกิดข้อผิดพลาดในการอัปเดตเรตติ้ง');
    } finally {
      setIsLoading(false);
    }
  }, [audioHashedId, updateRating, setError, setIsLoading, onRatingChange]);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      startRecording();
    } catch (error) {
      console.error('Error accessing the microphone:', error);
      setError('ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาตรวจสอบการอนุญาตในการตั้งค่าเบราว์เซอร์ของคุณ');
    }
  }, []);

  const startRecording = useCallback(async () => {
    onRatingChange('unknown');
    setError('');
    setTranscription('');
    setTranslation('');
    setTranscriptionStatus('');
    setHasSaved(false);
    setIsRecording(true);
    setAudioRecordId(null);
    setAudioHashedId(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      let options = { mimeType: 'audio/webm' };
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/ogg; codecs=opus' };
        if (!MediaRecorder.isTypeSupported('audio/ogg; codecs=opus')) {
          options = {};
        }
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType || 'audio/webm' });
        onAudioRecorded(audioBlob);

        setIsLoading(true);
        try {
          const formData = new FormData();
          formData.append('audio_file', audioBlob, 'recording.webm');
          formData.append('language', language);

          const result = await transcribeMic(formData);
          setTranscription(result.transcription);
          setAudioRecordId(result.recordId);
          setAudioHashedId(result.hashedId);
          setTranscriptionStatus('ถอดเสียงเสร็จสิ้น');
          await translateText(result.transcription);
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
  }, [language, setTranscription, setTranslation, setTranscriptionStatus, setIsLoading, setError, onAudioRecorded, transcribeMic, translateText, onRatingChange]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  `;

  const ripple = keyframes`
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2.4); opacity: 0; }
  `;

  const DesktopRecordButton = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
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
          onClick={isRecording ? stopRecording : requestMicrophonePermission}
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
        {isRecording ? 'คลิกเพื่อหยุดบันทึก' : 'คลิกเพื่อเริ่มบันทึก'}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', mt: 2 }}>
      <Box elevation={3} sx={{ p: 3, width: '100%', maxWidth: 600, bgcolor: '#f5f5f5', borderRadius: '16px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: '"Chakra Petch", sans-serif', color: '#333' }}>
            บันทึกเสียง
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              icon={<MicIcon />}
              label={isRecording ? "กำลังบันทึก..." : "พร้อมบันทึก"}
              color={isRecording ? "secondary" : "default"}
              sx={{
                animation: isRecording ? `${pulse} 1.5s ease-in-out infinite` : 'none',
                '& .MuiChip-icon': {
                  color: isRecording ? 'inherit' : '#757575',
                },
                mr: 2
              }}
            />
            <IconButton 
              onClick={handleOpenGuide}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
              }}
            >
              <InfoIcon />
            </IconButton>
          </Box>
        </Box>

        {!isSupported ? (
          <Alert severity="error">
            ขออภัย เบราว์เซอร์ของคุณไม่รองรับการบันทึกเสียง กรุณาใช้เบราว์เซอร์รุ่นใหม่หรือเปิดใช้งานฟีเจอร์นี้
          </Alert>
        ) : (
          <>
            {isMobile && (
              <Box sx={{ mb: 2 }}>
                <LanguageSwitch language={language} toggleLanguage={toggleLanguage} />
              </Box>
            )}

            {isMobile ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
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
                    onClick={isRecording ? stopRecording : requestMicrophonePermission}
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
            ) : (
              <DesktopRecordButton />
            )}

            {isLoading && <LoadingIndicator />}
            
            {error && <ErrorDisplay error={error} />}

            {transcriptionStatus && (
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif', color: '#666' }}>
                {transcriptionStatus}
              </Typography>
            )}

            {audioUrl && <AudioPlayer audioUrl={audioUrl} />}

            {transcription && (
              <TranscriptionResult
                transcription={transcription}
                rating={rating}
                handleRating={handleRating}
              />
            )}
          </>
        )}
      </Box>
      <GuideModal 
        open={openGuide} 
        onClose={handleCloseGuide}
        supportedWords={supportedWords}
        isMobile={isMobile}
        theme={theme}
      />
    </Box>
  );
});

export default SpeechMic;