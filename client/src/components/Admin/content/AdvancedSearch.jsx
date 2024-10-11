import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const AdvancedSearch = ({ initialSearchParams, onSearch }) => {
  const [localSearchParams, setLocalSearchParams] = useState(initialSearchParams);

  useEffect(() => {
    setLocalSearchParams(initialSearchParams);
  }, [initialSearchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    onSearch(localSearchParams);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        label="Language"
        name="language"
        value={localSearchParams.language}
        onChange={handleChange}
        sx={{ mr: 1, mb: 1 }}
      />
      <TextField
        label="Min Duration"
        name="minDuration"
        type="number"
        value={localSearchParams.minDuration}
        onChange={handleChange}
        sx={{ mr: 1, mb: 1 }}
      />
      <TextField
        label="Max Duration"
        name="maxDuration"
        type="number"
        value={localSearchParams.maxDuration}
        onChange={handleChange}
        sx={{ mr: 1, mb: 1 }}
      />
      <FormControl sx={{ mr: 1, mb: 1, minWidth: 120 }}>
        <InputLabel>Rating</InputLabel>
        <Select
          name="rating"
          value={localSearchParams.rating}
          onChange={handleChange}
          label="Rating"
        >
          <MenuItem value=""><em>None</em></MenuItem>
          <MenuItem value="UNKNOWN">Unknown</MenuItem>
          <MenuItem value="LIKE">Like</MenuItem>
          <MenuItem value="DISLIKE">Dislike</MenuItem>
        </Select>
      </FormControl>
      <FormControl sx={{ mr: 1, mb: 1, minWidth: 120 }}>
        <InputLabel>Source</InputLabel>
        <Select
          name="source"
          value={localSearchParams.source}
          onChange={handleChange}
          label="Source"
        >
          <MenuItem value=""><em>None</em></MenuItem>
          <MenuItem value="MICROPHONE">Microphone</MenuItem>
          <MenuItem value="UPLOAD">Upload</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Start Date"
        name="startDate"
        type="date"
        value={localSearchParams.startDate}
        onChange={handleChange}
        sx={{ mr: 1, mb: 1 }}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="End Date"
        name="endDate"
        type="date"
        value={localSearchParams.endDate}
        onChange={handleChange}
        sx={{ mr: 1, mb: 1 }}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="User ID"
        name="userId"
        value={localSearchParams.userId}
        onChange={handleChange}
        sx={{ mr: 1, mb: 1 }}
      />
      <TextField
        label="Transcription"
        name="transcriptionQuery"
        value={localSearchParams.transcriptionQuery}
        onChange={handleChange}
        sx={{ mr: 1, mb: 1 }}
      />
      <Button
        variant="contained"
        startIcon={<SearchIcon />}
        onClick={handleSearch}
        sx={{ mt: 1 }}
      >
        Search
      </Button>
    </Box>
  );
};

export default AdvancedSearch;