import React, { useState, useEffect } from 'react';
import { usePasswordReset } from '../PasswordResetContext';
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();
  const { loading, error, successMessage, resetPassword, clearMessages } = usePasswordReset();

  useEffect(() => {
    clearMessages();
  }, [clearMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      // Handle password mismatch
      return;
    }
    try {
      await resetPassword(token, newPassword);
      // Redirect to login page after successful reset
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      // Error is already handled in the context
    }
  };

  return (    
  <Box sx={{ backgroundColor: 'white', mt: 3,p:5, minHeight: '80vh',display:'flex',alignItems:'center' }}>
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Reset Password
      </Typography>
      <TextField
        fullWidth
        type="password"
        label="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        type="password"
        label="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        margin="normal"
        required
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Reset Password'}
      </Button>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      {successMessage && (
        <Typography color="success" sx={{ mt: 2 }}>
          {successMessage}
        </Typography>
      )}
    </Box>
  </Box>
  );
}

export default ResetPassword;