import React, { useCallback, useState } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Typography, CircularProgress, Alert, TablePagination 
} from '@mui/material';
import { useAdminAnalytics } from '../../../AminAnalytics';
import { useAdmin } from '../../../ContextAdmin';

const AudioRecordsList = () => {
  const { audioRecords, fetchAudioRecords, loading, error } = useAdminAnalytics();
  const { axiosInstance } = useAdmin();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleDelete = useCallback(async (id) => {
    try {
      await axiosInstance.delete(`/admin/audio_records/${id}`);
      await fetchAudioRecords();
      // You might want to add a success message here
    } catch (error) {
      console.error('Error deleting audio record:', error);
      // You might want to add an error message here
    }
  }, [axiosInstance, fetchAudioRecords]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!audioRecords || audioRecords.length === 0) {
    return <Typography>No audio records available</Typography>;
  }

  return (
    <Paper>
      <Typography variant="h6" gutterBottom component="div">
        Audio Records
      </Typography>
      <TableContainer>
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
            {(rowsPerPage > 0
              ? audioRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : audioRecords
            ).map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.id}</TableCell>
                <TableCell>{record.user_id}</TableCell>
                <TableCell>{record.duration}</TableCell>
                <TableCell>{new Date(record.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Button 
                    color="secondary" 
                    onClick={() => handleDelete(record.id)}
                    variant="contained"
                    size="small"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={audioRecords.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default React.memo(AudioRecordsList);