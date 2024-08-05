import React, { useState, useRef, forwardRef, useImperativeHandle, useCallback, useEffect } from 'react';
import { Typography, Box, Paper } from '@mui/material';
import axios from 'axios';

const SpeechMic = forwardRef(({ onTranslation }, ref) => {
  const [transcription, setTranscription] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [transcriptionStatus, setTranscriptionStatus] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const processorNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const filterNodeRef = useRef(null);
  const compressorNodeRef = useRef(null);
  const audioChunksRef = useRef([]);

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording
  }));

  useEffect(() => {
    // Load saved data from local storage
    const savedTranscription = localStorage.getItem('transcription');
    const savedTranslatedText = localStorage.getItem('translatedText');
    const savedAudioUrl = localStorage.getItem('audioUrl');
    const savedTranscriptionStatus = localStorage.getItem('transcriptionStatus');

    if (savedTranscription) setTranscription(savedTranscription);
    if (savedTranslatedText) setTranslatedText(savedTranslatedText);
    if (savedAudioUrl) setAudioUrl(savedAudioUrl);
    if (savedTranscriptionStatus) setTranscriptionStatus(savedTranscriptionStatus);
  }, []);

  const setupAudioProcessing = useCallback((stream) => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(stream);

    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 2048;

    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.gain.setValueAtTime(1.2, audioContextRef.current.currentTime);

    filterNodeRef.current = audioContextRef.current.createBiquadFilter();
    filterNodeRef.current.type = "highpass";
    filterNodeRef.current.frequency.setValueAtTime(80, audioContextRef.current.currentTime);
    filterNodeRef.current.Q.setValueAtTime(0.7, audioContextRef.current.currentTime);

    compressorNodeRef.current = audioContextRef.current.createDynamicsCompressor();
    compressorNodeRef.current.threshold.setValueAtTime(-24, audioContextRef.current.currentTime);
    compressorNodeRef.current.knee.setValueAtTime(40, audioContextRef.current.currentTime);
    compressorNodeRef.current.ratio.setValueAtTime(12, audioContextRef.current.currentTime);
    compressorNodeRef.current.attack.setValueAtTime(0, audioContextRef.current.currentTime);
    compressorNodeRef.current.release.setValueAtTime(0.25, audioContextRef.current.currentTime);

    sourceNodeRef.current
      .connect(gainNodeRef.current)
      .connect(filterNodeRef.current)
      .connect(compressorNodeRef.current)
      .connect(analyser)
      .connect(audioContextRef.current.destination);

    processorNodeRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
    processorNodeRef.current.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const outputData = e.outputBuffer.getChannelData(0);
      
      for (let sample = 0; sample < inputData.length; sample++) {
        outputData[sample] = inputData[sample] * 1.5;
      }
    };

    sourceNodeRef.current.connect(processorNodeRef.current);
    processorNodeRef.current.connect(audioContextRef.current.destination);

  }, []);

  const translateText = async (text) => {
    try {
      const response = await axios.post('http://localhost:8080/api/translate', {
        sentence: text,
      });
      const translatedText = response.data.translated_sentence;
      setTranslatedText(translatedText);
      localStorage.setItem('translatedText', translatedText);
      onTranslation(translatedText); // Notify parent component
    } catch (error) {
      console.error('Error translating text:', error);
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
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        localStorage.setItem('audioUrl', audioUrl);

        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');

        try {
          const response = await axios.post('http://localhost:8080/api/transcribe_Mic', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const transcriptionText = response.data.transcription;
          setTranscription(transcriptionText);
          localStorage.setItem('transcription', transcriptionText);
          const newStatus = 'ถอดเสียงเสร็จสิ้น';
          setTranscriptionStatus(newStatus);
          localStorage.setItem('transcriptionStatus', newStatus);
          translateText(transcriptionText); // Translate the transcription text
        } catch (error) {
          console.error('Error transcribing audio:', error);
          const errorStatus = 'เกิดข้อผิดพลาดในการถอดเสียง';
          setTranscriptionStatus(errorStatus);
          localStorage.setItem('transcriptionStatus', errorStatus);
        }
      };

      mediaRecorder.start();
      const recordingStatus = 'กำลังบันทึกเสียง...';
      setTranscriptionStatus(recordingStatus);
      localStorage.setItem('transcriptionStatus', recordingStatus);
    } catch (error) {
      console.error('Error starting recording:', error);
      const errorStatus = 'เกิดข้อผิดพลาดในการเริ่มบันทึก';
      setTranscriptionStatus(errorStatus);
      localStorage.setItem('transcriptionStatus', errorStatus);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
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
        </Paper>
      )}
    </Box>
  );
});

export default SpeechMic;