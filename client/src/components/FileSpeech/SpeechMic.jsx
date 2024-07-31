import React, { useState } from 'react';
import { Button } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import axios from 'axios';

const SpeechMic = ({ onTranslation }) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const startRecording = async () => {
    try {
      // เริ่มการบันทึกเสียง
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      // เริ่มการบันทึกเสียง
      recorder.start();
      setRecording(true);

      // รอให้เสร็จสิ้นการบันทึกเสียง
      setTimeout(async () => {
        recorder.stop();
        setRecording(false);
        
        // เรียก API เพื่อถอดเสียงหลังจากการบันทึก
        try {
          const response = await axios.get('/api/transcribe_Mic');
          onTranslation(response.data.transcription); // ส่งผลการแปลให้กับ parent component
        } catch (error) {
          console.error('Error transcribing audio:', error);
        }
      }, 5000); // ตัวอย่าง: บันทึกเสียงเป็นเวลา 5 วินาที

    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  return (
    <div>
      <Button
        onClick={recording ? stopRecording : startRecording}
        sx={{ bgcolor: recording ? 'red' : 'green', color: 'white' }}
      >
        {recording ? <MicOffIcon /> : <MicIcon />}
        {recording ? 'หยุดบันทึก' : 'เริ่มบันทึก'}
      </Button>
    </div>
  );
};

export default SpeechMic;
