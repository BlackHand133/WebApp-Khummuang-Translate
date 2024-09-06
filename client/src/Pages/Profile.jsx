import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useUser } from '../ContextUser';
import { TextField, Button, Container, CircularProgress, Alert, Grid, Box, Typography, List, ListItem, ListItemIcon, ListItemText, Divider, Snackbar } from '@mui/material';
import { Person, Lock, Save, Email, Phone, Cake, Wc, Public, LocationCity } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Custom styled component for rounded menu buttons
const RoundedMenuItem = styled(ListItem)(({ theme }) => ({
  borderRadius: 25,
  marginBottom: theme.spacing(1),
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.contrastText,
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: 25,
  },
}));

// Custom styled TextField for consistent appearance
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
  },
}));

const EnhancedSaveButton = styled(Button)(({ theme }) => ({
  minWidth: 250,
  height: 60,
  borderRadius: 30,
  fontSize: '1.2rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
  },
  '&:active': {
    transform: 'translateY(1px)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
}));

function Profile() {
  const { username, getProfile, updateProfile, resetPassword } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editProfile, setEditProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isProfileChanged, setIsProfileChanged] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handlePasswordChange = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    try {
      setSaving(true);
      setPasswordError(null);

      // Use resetPassword function instead of updateProfile
      await resetPassword(currentPassword, newPassword);

      showSnackbar('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError('Failed to change password: ' + err.message);
      showSnackbar('Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword, resetPassword, showSnackbar]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profileData = await getProfile();
      setProfile(profileData);
      setEditProfile(profileData);
    } catch (err) {
      setError(err.message);
      showSnackbar('Failed to fetch profile', 'error');
    } finally {
      setLoading(false);
    }
  }, [getProfile, showSnackbar]);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username, fetchProfile]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditProfile((prevProfile) => {
      const updatedProfile = { ...prevProfile };

      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        updatedProfile[parent] = {
          ...updatedProfile[parent],
          [child]: value,
        };
      } else {
        updatedProfile[name] = value;
      }

      return updatedProfile;
    });

    setIsProfileChanged(true);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);

      await updateProfile(editProfile);

      showSnackbar('Profile updated successfully');
      setProfile(editProfile);
      setIsProfileChanged(false);
    } catch (err) {
      showSnackbar('Failed to save profile: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  }, [editProfile, updateProfile, showSnackbar]);

  const ProfileForm = useMemo(() => {
    if (!editProfile) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>Account Information</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <StyledTextField
              label="Username"
              name="username"
              value={editProfile.username || ''}
              onChange={handleChange}
              fullWidth
              disabled
              variant="outlined"
              InputProps={{
                startAdornment: <Person color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StyledTextField
              label="Email"
              name="email"
              value={editProfile.email || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: <Email color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Personal Information</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <StyledTextField
              label="First Name"
              name="profile.firstname"
              value={editProfile.profile?.firstname || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StyledTextField
              label="Last Name"
              name="profile.lastname"
              value={editProfile.profile?.lastname || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StyledTextField
              label="Birth Date"
              name="birth_date"
              value={editProfile.birth_date || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              type="date"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <Cake color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StyledTextField
              label="Gender"
              name="gender"
              value={editProfile.gender || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: <Wc color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Address Information</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <StyledTextField
              label="Country"
              name="profile.country"
              value={editProfile.profile?.country || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: <Public color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StyledTextField
              label="State"
              name="profile.state"
              value={editProfile.profile?.state || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: <LocationCity color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Contact Information</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <StyledTextField
              label="Phone Number"
              name="phone"
              value={editProfile.phone || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: <Phone color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="center" mt={3}>
          <EnhancedSaveButton
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!isProfileChanged || saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
          </EnhancedSaveButton>
        </Box>
      </Box>
    );
  }, [editProfile, handleChange, handleSave, isProfileChanged, saving]);

  const PasswordChangeForm = useMemo(() => (
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
  ), [currentPassword, newPassword, confirmPassword, passwordError, handlePasswordChange, saving]);

  if (loading) return <CircularProgress />;

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={3}>
          <List>
            <RoundedMenuItem button selected={activeSection === 'profile'} onClick={() => setActiveSection('profile')}>
              <ListItemIcon><Person /></ListItemIcon>
              <ListItemText primary="Profile" />
            </RoundedMenuItem>
            <RoundedMenuItem button selected={activeSection === 'password'} onClick={() => setActiveSection('password')}>
              <ListItemIcon><Lock /></ListItemIcon>
              <ListItemText primary="Change Password" />
            </RoundedMenuItem>
          </List>
        </Grid>
        <Grid item xs={12} sm={9}>
          {activeSection === 'profile' ? ProfileForm : PasswordChangeForm}
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Profile;
