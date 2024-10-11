import React, { useState, useEffect, useRef } from 'react';
import { Box, IconButton, Slider, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import useAdminAPI from '../../../APIadmin';

const AudioPlayer = ({ hashedId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(new Audio());
  const adminAPI = useAdminAPI();

  useEffect(() => {
    const loadAudio = async () => {
      try {
        const response = await adminAPI.streamAudio(hashedId);
        const audioBlob = new Blob([response.data], { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        audioRef.current.src = url;

        audioRef.current.addEventListener('loadedmetadata', () => {
          setDuration(audioRef.current.duration);
        });

        audioRef.current.addEventListener('timeupdate', () => {
          setCurrentTime(audioRef.current.currentTime);
        });

        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
          setCurrentTime(0);
        });
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    };

    loadAudio();

    return () => {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    };
  }, [hashedId, adminAPI]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (event, newValue) => {
    audioRef.current.currentTime = newValue;
    setCurrentTime(newValue);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '200px', bgcolor: '#f5f5f5', borderRadius: '4px', p: 0.5 }}>
      <IconButton onClick={togglePlay} size="small">
        {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
      </IconButton>
      <Slider
        size="small"
        value={currentTime}
        max={duration}
        onChange={handleTimeChange}
        aria-label="Time"
        sx={{ mx: 1, flexGrow: 1 }}
      />
      <Typography variant="caption" sx={{ minWidth: '40px', textAlign: 'right' }}>
        {formatTime(currentTime)}
      </Typography>
    </Box>
  );
};

export default AudioPlayer;