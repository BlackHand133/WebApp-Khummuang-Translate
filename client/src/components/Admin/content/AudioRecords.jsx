import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Alert, Snackbar } from '@mui/material';
import useAdminAPI from '../../../APIadmin';

const AudioRecords = () => {
  const [audioRecords, setAudioRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const adminAPI = useAdminAPI();

  const fetchAudioRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Replace with actual API call when available
      // const response = await adminAPI.getAllAudioRecords();
      // setAudioRecords(response.audioRecords);
      // For now, we'll use dummy data
      setAudioRecords([
        { id: 1, user: 'user1', duration: '2:30', created_at: '2023-05-10' },
        { id: 2, user: 'user2', duration: '1:45', created_at: '2023-05-11' },
      ]);
    } catch (error) {
      console.error('Error fetching audio records:', error);
      setError('Failed to fetch audio records. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [adminAPI]);

  useEffect(() => {
    fetchAudioRecords();
  }, [fetchAudioRecords]);

  const handleDelete = useCallback(async (id) => {
    try {
      // TODO: Replace with actual API call when available
      // await adminAPI.deleteAudioRecord(id);
      setAudioRecords(prevRecords => prevRecords.filter(record => record.id !== id));
      setSnackbar({ open: true, message: 'Audio record deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting audio record:', error);
      setSnackbar({ open: true, message: 'Failed to delete audio record', severity: 'error' });
    }
  }, [adminAPI]);

  const handleListen = useCallback((id) => {
    // TODO: Implement audio playback functionality
    console.log(`Listening to audio record with id: ${id}`);
    setSnackbar({ open: true, message: 'Audio playback not implemented yet', severity: 'info' });
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {audioRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.id}</TableCell>
                <TableCell>{record.user}</TableCell>
                <TableCell>{record.duration}</TableCell>
                <TableCell>{record.created_at}</TableCell>
                <TableCell>
                  <Button color="primary" onClick={() => handleListen(record.id)}>Listen</Button>
                  <Button color="secondary" onClick={() => handleDelete(record.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AudioRecords;