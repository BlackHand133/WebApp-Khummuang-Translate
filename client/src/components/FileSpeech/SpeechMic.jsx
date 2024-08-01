import React, { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import axios from 'axios';

const SpeechMic = ({ onTranslation }) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [transcriptionStatus, setTranscriptionStatus] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        let audioChunks = [];

        recorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        recorder.onstop = async () => {
            const blob = new Blob(audioChunks, { type: 'audio/wav' });
            const formData = new FormData();
            formData.append('file', blob, 'recording.wav');

            try {
                const response = await axios.post('http://localhost:8080/api/transcribe_Mic', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                const transcriptionText = response.data.transcription;
                setTranscription(transcriptionText);
                setTranscriptionStatus('ถอดเสียงเสร็จสิ้น');
                onTranslation(transcriptionText);
                
                // Create a URL for the recorded audio
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
            } catch (error) {
                console.error('Error transcribing audio:', error);
                setTranscriptionStatus('เกิดข้อผิดพลาดในการถอดเสียง');
            }
        };

        recorder.start();
        setMediaRecorder(recorder);
        setRecording(true);
        setTranscriptionStatus('กำลังบันทึกเสียง...');
    } catch (error) {
        console.error('Error starting recording:', error);
        setTranscriptionStatus('เกิดข้อผิดพลาดในการเริ่มบันทึก');
    }
};


  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop()); // Stop all media tracks
      setRecording(false);
      setMediaRecorder(null); // Clear media recorder after stopping
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif' }}>
          {transcription}
        </Typography>
      )}
      {audioUrl && (
        <Box sx={{ mt: 2 }}>
          <audio controls src={audioUrl} />
        </Box>
      )}
    </Box>
  );
};

export default SpeechMic;
