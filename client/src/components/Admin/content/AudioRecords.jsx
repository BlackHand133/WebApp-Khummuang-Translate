import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Alert, Snackbar, Pagination } from '@mui/material';
import useAdminAPI from '../../../APIadmin';

const AudioRecords = () => {
  const [audioRecords, setAudioRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const adminAPI = useAdminAPI();
  const audioRef = useRef(new Audio());

  const fetchAudioRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAudioRecords(page);
      setAudioRecords(response.audio_records);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Error fetching audio records:', error);
      setError('Failed to fetch audio records. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [adminAPI, page]);

  useEffect(() => {
    fetchAudioRecords();
  }, [fetchAudioRecords]);

  const handleDelete = useCallback(async (id) => {
    // TODO: Implement delete functionality when API is available
    console.log('Delete audio record:', id);
    setSnackbar({ open: true, message: 'Delete functionality not implemented yet', severity: 'info' });
  }, []);

  const handleListen = useCallback((hashedId) => {
    const audioUrl = adminAPI.streamAudio(hashedId);
    audioRef.current.src = audioUrl;
    audioRef.current.play().catch(error => {
      console.error('Error playing audio:', error);
      setSnackbar({ open: true, message: 'Error playing audio. Please try again.', severity: 'error' });
    });
  }, [adminAPI]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Audio Records</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {audioRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.id}</TableCell>
                <TableCell>{record.username}</TableCell>
                <TableCell>{record.duration}</TableCell>
                <TableCell>{new Date(record.created_at).toLocaleString()}</TableCell>
                <TableCell>{record.language}</TableCell>
                <TableCell>
                  <Button color="primary" onClick={() => handleListen(record.hashed_id)}>Listen</Button>
                  <Button color="secondary" onClick={() => handleDelete(record.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination 
        count={totalPages} 
        page={page} 
        onChange={handleChangePage} 
        color="primary" 
        sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
      />
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AudioRecords;