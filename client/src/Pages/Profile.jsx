import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '../ContextUser';
import { Container, CircularProgress, Grid, Box } from '@mui/material';
import ProfileForm from '../components/Profile/ProfileForm';
import PasswordChangeForm from '../components/Profile/PasswordChangeForm';
import SideMenu from '../components/Profile/SideMenu';
import CustomSnackbar from '../components/Common/CustomSnackbar';
import DeleteAccountComponent from '../components/Profile/DeleteAccount';

function Profile() {
  const { username, getProfile, updateProfile, changePassword } = useUser();
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

  const handlePasswordChange = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }
    try {
      setSaving(true);
      await changePassword(currentPassword, newPassword, confirmPassword);
      showSnackbar('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError(null);
    } catch (err) {
      setPasswordError(err.message);
      showSnackbar('Failed to change password: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword, changePassword, showSnackbar]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={3} sx={{mt:4,p:4}}>
          <SideMenu activeSection={activeSection} setActiveSection={setActiveSection} />
        </Grid>
        <Grid item xs={12} sm={9} sx={{mt:4 ,p:4 }} >
        {activeSection === 'profile' && (
            <ProfileForm
              editProfile={editProfile}
              handleChange={handleChange}
              handleSave={handleSave}
              isProfileChanged={isProfileChanged}
              saving={saving}
            />
          )}
          {activeSection === 'password' && (
            <PasswordChangeForm
              currentPassword={currentPassword}
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              passwordError={passwordError}
              setCurrentPassword={setCurrentPassword}
              setNewPassword={setNewPassword}
              setConfirmPassword={setConfirmPassword}
              handlePasswordChange={handlePasswordChange}
              saving={saving}
            />
          )}
          {activeSection === 'account' && (
            <DeleteAccountComponent />
          )}
        </Grid>
      </Grid>

      <CustomSnackbar
        open={snackbarOpen}
        handleClose={handleCloseSnackbar}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </Container>
  );
}

export default Profile;