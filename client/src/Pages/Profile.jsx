import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useUser } from '../ContextUser';
import { TextField, Button, Container, CircularProgress, Alert, Grid, Box, Typography, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Person, Lock, Save } from '@mui/icons-material';
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
  fontSize: '2 rem',
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
  const { username, getProfile, updateProfile } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editProfile, setEditProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [isProfileChanged, setIsProfileChanged] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profileData = await getProfile();
      setProfile(profileData);
      setEditProfile(profileData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getProfile]);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username, fetchProfile]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditProfile((prevProfile) => {
      let updatedProfile = { ...prevProfile };
      
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        updatedProfile[parent] = {
          ...updatedProfile[parent],
          [child]: value
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
      setSaveError(null);
      setSuccessMessage(null);
      
      await updateProfile(editProfile);
      
      setSuccessMessage('Profile updated successfully');
      setProfile(editProfile);
      setIsProfileChanged(false);
    } catch (err) {
      setSaveError('Failed to save profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  }, [editProfile, updateProfile]);

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
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>Contact Information</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledTextField
              label="Phone Number"
              name="profile.phone_number"
              value={editProfile.profile?.phone_number || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Box>
    );
  }, [editProfile, handleChange]);

  const PasswordChangeForm = useMemo(() => {
    return () => (
      <Box maxWidth={400} mx="auto">
        <Typography variant="h6" gutterBottom>Change Password</Typography>
        <StyledTextField
          label="Current Password"
          name="currentPassword"
          type="password"
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <StyledTextField
          label="New Password"
          name="newPassword"
          type="password"
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <StyledTextField
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          fullWidth
          margin="normal"
          variant="outlined"
        />
        <Box display="flex" justifyContent="center" mt={3}>
          <Button
            variant="contained"
            color="primary"
            sx={{ minWidth: 200 }}
          >
            Change Password
          </Button>
        </Box>
      </Box>
    );
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profile) return <div>No profile data found</div>;

  return (
    <Box sx={{ display: 'flex', backgroundColor: 'white', mt: 8 }}>
      <Box sx={{ width: 250, flexShrink: 0, borderRight: 1, borderColor: 'divider', p: 2 }}>
        <List>
          <RoundedMenuItem
            button
            selected={activeSection === 'profile'}
            onClick={() => setActiveSection('profile')}
          >
            <ListItemIcon><Person /></ListItemIcon>
            <ListItemText primary="Profile" />
          </RoundedMenuItem>
          <RoundedMenuItem
            button
            selected={activeSection === 'password'}
            onClick={() => setActiveSection('password')}
          >
            <ListItemIcon><Lock /></ListItemIcon>
            <ListItemText primary="Change Password" />
          </RoundedMenuItem>
        </List>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom sx={{ mb: 5, mt: 3 }}>
            {activeSection === 'profile' ? 'Profile' : 'Change Password'}
          </Typography>

          {activeSection === 'profile' ? ProfileForm : <PasswordChangeForm />}

          {activeSection === 'profile' && (
            <Box mt={6}>
              {saveError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {saveError}
                </Alert>
              )}
              {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {successMessage}
                </Alert>
              )}
              <Box display="flex" justifyContent="center">
                <EnhancedSaveButton
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={saving || !isProfileChanged}
                  startIcon={saving ? <CircularProgress size={24} color="inherit" /> : <Save />}
                >
                  {saving ? 'Saving...' : 'Save'}
                </EnhancedSaveButton>
              </Box>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default Profile;