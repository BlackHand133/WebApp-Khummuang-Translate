import React, { useState, useRef } from 'react';
import { Button, Typography, Box, Paper } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import axios from 'axios';

const SpeechMic = ({ onTranslation }) => {
  const [recording, setRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [transcriptionStatus, setTranscriptionStatus] = useState('');
  const [audioUrl, setAudioUrl] = useState(''); // เพิ่ม state ใหม่
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,  // ปรับอัตราตัวอย่างเสียง
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        // ปรับแต่งเสียงที่นี่
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
        audioBitsPerSecond: 192000, // เพิ่มบิตเรตเพื่อเพิ่มคุณภาพ
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
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl); // ตั้งค่า URL ของไฟล์เสียง

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
      {!transcription && !recording && (
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif', color: 'grey' }}>
          กรุณาเริ่มบันทึกเสียงเพื่อถอดเสียง
        </Typography>
      )}
      {audioUrl && (
        <Box sx={{ mt: 2 ,display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Paper sx={{p: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <audio controls src={audioUrl} />
          </Paper>
        </Box>
      )}
      {transcription && (
        <Paper sx={{ mt:3,mb:-3, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif', bgcolor: 'black',color: 'white', p: 1, borderRadius: 1 }}>
            ผลการถอดเสียง
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', fontFamily: '"Chakra Petch", sans-serif', p: 2, borderRadius: 1 ,mb:1}}>
          {transcription}
        </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default SpeechMic;
