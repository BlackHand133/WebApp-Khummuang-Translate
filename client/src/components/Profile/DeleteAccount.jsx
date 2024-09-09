import React, { useState } from 'react';
import { useUser } from '../../ContextUser';
import { TextField, Button, Typography, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { StyledTextField, EnhancedSaveButton } from './StyledComponents';

function DeleteAccountComponent() {
  const { deleteAccount, error, successMessage } = useUser();
  const [password, setPassword] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount(password);
      setOpenDialog(false);
      // นำทางกลับไปยังหน้าหลักหรือหน้า login หลังจากลบบัญชีสำเร็จ
    } catch (err) {
      // จัดการข้อผิดพลาดถ้ามี
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Delete Account</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Warning: This action is irreversible. Your account will be permanently deleted.
      </Typography>
      <Button variant="contained" color="error" onClick={() => setOpenDialog(true)}>
        Delete Account
      </Button>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter your password to confirm account deletion. This action cannot be undone.
          </DialogContentText>
          <StyledTextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <EnhancedSaveButton
            onClick={handleDeleteAccount}
            color="error"
            disabled={deleting || !password}
            sx={{boxSizing:2}}
          >
            {deleting ? 'Deleting...' : 'Confirm Deletion'}
          </EnhancedSaveButton>
        </DialogActions>
      </Dialog>

      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      {successMessage && <Typography color="success" sx={{ mt: 2 }}>{successMessage}</Typography>}
    </Box>
  );
}

export default DeleteAccountComponent;