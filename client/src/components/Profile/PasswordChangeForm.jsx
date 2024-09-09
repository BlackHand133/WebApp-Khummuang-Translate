import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { StyledTextField, EnhancedSaveButton } from './StyledComponents';

function PasswordChangeForm({ 
  currentPassword, 
  newPassword, 
  confirmPassword, 
  passwordError,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  handlePasswordChange,
  saving
}) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Change Password</Typography>
      <StyledTextField
        label="Current Password"
        name="currentPassword"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        fullWidth
        margin="normal"
        variant="outlined"
        error={Boolean(passwordError)}
        helperText={passwordError}
        InputProps={{
          startAdornment: <Lock color="action" sx={{ mr: 1 }} />,
        }}
      />
      <StyledTextField
        label="New Password"
        name="newPassword"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        fullWidth
        margin="normal"
        variant="outlined"
        error={Boolean(passwordError)}
        helperText={passwordError}
        InputProps={{
          startAdornment: <Lock color="action" sx={{ mr: 1 }} />,
        }}
      />
      <StyledTextField
        label="Confirm New Password"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        fullWidth
        margin="normal"
        variant="outlined"
        error={Boolean(passwordError)}
        helperText={passwordError}
        InputProps={{
          startAdornment: <Lock color="action" sx={{ mr: 1 }} />,
        }}
      />
      <Box display="flex" justifyContent="center" mt={3}>
        <EnhancedSaveButton
          variant="contained"
          color="primary"
          onClick={handlePasswordChange}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Change Password'}
        </EnhancedSaveButton>
      </Box>
    </Box>
  );
}

export default PasswordChangeForm;