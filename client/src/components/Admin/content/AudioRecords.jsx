import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, LinearProgress, Pagination, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import useAdminAPI from '../../../APIadmin';

const AudioRecords = () => {
  const [audioRecords, setAudioRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const adminAPI = useAdminAPI();

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
    console.log('Delete audio record:', id);
    // TODO: Implement delete functionality
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>Audio Records</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Play</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Expiration Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {audioRecords.map((record) => (
              <TableRow 
                key={record.id}
                sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
              >
                <TableCell>
                  <audio controls style={{ width: '200px', height: '40px' }}>
                    <source src={`/api/admin/audio/${record.hashed_id}/stream`} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </TableCell>
                <TableCell>{record.id}</TableCell>
                <TableCell>{record.username}</TableCell>
                <TableCell>{record.analytics?.duration || 'N/A'}</TableCell>
                <TableCell>{new Date(record.created_at).toLocaleString()}</TableCell>
                <TableCell>{record.analytics?.language || 'N/A'}</TableCell>
                <TableCell>{record.analytics?.rating || 'N/A'}</TableCell>
                <TableCell>{record.analytics?.source || 'N/A'}</TableCell>
                <TableCell>{new Date(record.expiration_date).toLocaleString()}</TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton onClick={() => console.log('View details for:', record.id)}>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton onClick={() => handleDelete(record.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination 
          count={totalPages} 
          page={page} 
          onChange={handleChangePage} 
          color="primary" 
        />
      </Box>
    </Box>
  );
};

export default AudioRecords;