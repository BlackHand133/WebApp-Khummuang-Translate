import React, { useState, useRef } from 'react';
import { Button, Typography, Box } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import axios from 'axios';

const SpeechMic = ({ onTranslation }) => {
  const [recording, setRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [transcriptionStatus, setTranscriptionStatus] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');

        try {
          const response = await axios.post('http://localhost:8080/api/transcribe_Mic', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const transcriptionText = response.data.transcription;
          setTranscription(transcriptionText);
          setTranscriptionStatus('ถอดเสียงเสร็จสิ้น');
          onTranslation(transcriptionText);
        } catch (error) {
          console.error('Error transcribing audio:', error);
          setTranscriptionStatus('เกิดข้อผิดพลาดในการถอดเสียง');
        }

        setRecording(false);
      };

      mediaRecorder.start();
      setRecording(true);
      setTranscriptionStatus('กำลังบันทึกเสียง...');
    } catch (error) {
      console.error('Error starting recording:', error);
      setTranscriptionStatus('เกิดข้อผิดพลาดในการเริ่มบันทึก');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Button
        onClick={recording ? stopRecording : startRecording}
        sx={{ bgcolor: recording ? 'red' : 'green', color: 'white', mb: 2 }}
      >
        {recording ? <MicOffIcon /> : <MicIcon />}
        {recording ? 'หยุดบันทึก' : 'เริ่มบันทึก'}
      </Button>
      {transcriptionStatus && (
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif' }}>
          {transcriptionStatus}
        </Typography>
      )}
      {transcription && (
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif', bgcolor: '#f0f0f0', p: 2, borderRadius: 1 }}>
          {transcription}
        </Typography>
      )}
      {!transcription && !recording && (
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif', color: 'grey' }}>
          กรุณาเริ่มบันทึกเสียงเพื่อถอดเสียง
        </Typography>
      )}
    </Box>
  );
};

export default SpeechMic;