import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, LinearProgress, Pagination, Tooltip, TableSortLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import useAdminAPI from '../../../APIadmin';
import AudioPlayer from './AudioPlayer';
import AdvancedSearch from './AdvancedSearch';

const AudioRecords = () => {
  const [audioRecords, setAudioRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [searchParams, setSearchParams] = useState({
    language: '',
    minDuration: '',
    maxDuration: '',
    rating: '',
    source: '',
    startDate: '',
    endDate: '',
    userId: '',
    transcriptionQuery: ''
  });
  const adminAPI = useAdminAPI();

  const fetchAudioRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAudioRecords(page, 10, sortBy, order, searchParams);
      setAudioRecords(response.audio_records);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Error fetching audio records:', error);
      setError('Failed to fetch audio records. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [adminAPI, page, sortBy, order, searchParams]);

  useEffect(() => {
    fetchAudioRecords();
  }, [fetchAudioRecords]);

  const handleDelete = useCallback(async (hashedId) => {
    if (window.confirm('Are you sure you want to delete this audio record?')) {
      try {
        await adminAPI.deleteAudioRecord(hashedId);
        fetchAudioRecords();
      } catch (error) {
        console.error('Error deleting audio record:', error);
      }
    }
  }, [adminAPI, fetchAudioRecords]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSort = (column) => {
    const isAsc = sortBy === column && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setSortBy(column);
  };

  const handleSearch = (newParams) => {
    setSearchParams(newParams);
    setPage(1);
    fetchAudioRecords();
  };

  if (loading) return <LinearProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>Audio Records</Typography>

      <AdvancedSearch         
        initialSearchParams={searchParams}
        onSearch={handleSearch} />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Play</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'id'}
                  direction={sortBy === 'id' ? order : 'asc'}
                  onClick={() => handleSort('id')}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'user_id'}
                  direction={sortBy === 'user_id' ? order : 'asc'}
                  onClick={() => handleSort('user_id')}
                >
                  User ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'duration'}
                  direction={sortBy === 'duration' ? order : 'asc'}
                  onClick={() => handleSort('duration')}
                >
                  Duration
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'created_at'}
                  direction={sortBy === 'created_at' ? order : 'asc'}
                  onClick={() => handleSort('created_at')}
                >
                  Created At
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'language'}
                  direction={sortBy === 'language' ? order : 'asc'}
                  onClick={() => handleSort('language')}
                >
                  Language
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'rating'}
                  direction={sortBy === 'rating' ? order : 'asc'}
                  onClick={() => handleSort('rating')}
                >
                  Rating
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'source'}
                  direction={sortBy === 'source' ? order : 'asc'}
                  onClick={() => handleSort('source')}
                >
                  Source
                </TableSortLabel>
              </TableCell>
              <TableCell>Transcription</TableCell>
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
                  <AudioPlayer url={record.playback_url} />
                </TableCell>
                <TableCell>{record.id}</TableCell>
                <TableCell>{record.user_id}</TableCell>
                <TableCell>{record.duration || 'N/A'}</TableCell>
                <TableCell>{new Date(record.created_at).toLocaleString()}</TableCell>
                <TableCell>{record.language || 'N/A'}</TableCell>
                <TableCell>{record.rating || 'N/A'}</TableCell>
                <TableCell>{record.source || 'N/A'}</TableCell>
                <TableCell>
                  <Tooltip title={record.transcription || 'No transcription available'}>
                    <Typography noWrap sx={{ maxWidth: 200 }}>
                      {record.transcription || 'N/A'}
                    </Typography>
                    </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton onClick={() => console.log('View details for:', record.id)}>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton onClick={() => handleDelete(record.hashed_id)}>
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