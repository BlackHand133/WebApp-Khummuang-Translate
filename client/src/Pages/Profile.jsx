import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../ContextUser';
import { TextField, Button, Container, CircularProgress, Alert } from '@mui/material';

function Profile() {
  const { username, getProfile } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editProfile, setEditProfile] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getProfile();
        setProfile(profileData);
        setEditProfile(profileData);  // Initialize edit fields with current profile data
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username, getProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      setSuccessMessage(null);
      // Implement API call to save the edited profile data here
      // await saveProfile(editProfile); // Assuming saveProfile is an API function to save profile data
      setSuccessMessage('Profile updated successfully');
    } catch (err) {
      setSaveError('Failed to save profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profile) return <div>No profile data found</div>;

  return (
    <Container maxWidth="sm" className="profile-container" sx={{backgroundColor:'white' ,mt:8,p:5}}>
      <h2>User Profile</h2>
      <TextField
        label="Username"
        name="username"
        value={editProfile.username || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
        disabled
      />
      <TextField
        label="Email"
        name="email"
        value={editProfile.email || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Gender"
        name="gender"
        value={editProfile.gender || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Birth Date"
        name="birth_date"
        value={editProfile.birth_date || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="First Name"
        name="firstname"
        value={editProfile.profile?.firstname || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Last Name"
        name="lastname"
        value={editProfile.profile?.lastname || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Country"
        name="country"
        value={editProfile.profile?.country || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="State"
        name="state"
        value={editProfile.profile?.state || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Phone Number"
        name="phone_number"
        value={editProfile.profile?.phone_number || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      {saveError && <Alert severity="error">{saveError}</Alert>}
      {successMessage && <Alert severity="success">{successMessage()}</Alert>}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={saving}
        sx={{ mt: 2 }}
      >
        {saving ? <CircularProgress size={24} /> : 'Save'}
      </Button>
    </Container>
  );
}

export default Profile;
