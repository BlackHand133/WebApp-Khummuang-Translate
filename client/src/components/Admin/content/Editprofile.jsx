import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, TextField, Button, CircularProgress, Alert, Snackbar, 
  FormControlLabel, Checkbox, Grid, MenuItem
} from '@mui/material';
import useAdminAPI from '../../../APIadmin';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const EditProfile = () => {
    const { userId } = useParams();
    const [userData, setUserData] = useState({
      username: '',
      email: '',
      is_active: true,
      gender: '',
      birth_date: '',
      created_at: '',
      updated_at: '',
      profile: {
        firstname: '',
        lastname: '',
        country: '',
        state: '',
        phone_number: '',
        last_login: ''
      }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const adminAPI = useAdminAPI();
    const navigate = useNavigate();

    const fetchUserData = useCallback(async () => {
      if (!userId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await adminAPI.getUserDetails(userId);
        setUserData(response);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('Failed to fetch user details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }, [userId, adminAPI]);

    useEffect(() => {
      fetchUserData();
    }, [fetchUserData]);

    const handleChange = (event) => {
      const { name, value } = event.target;
      setUserData((prevData) => ({
        ...prevData,
        [name]: value
      }));
    };

    const handleProfileChange = (event) => {
      const { name, value } = event.target;
      setUserData((prevData) => ({
        ...prevData,
        profile: {
          ...prevData.profile,
          [name]: value
        }
      }));
    };

    const handleCheckboxChange = (event) => {
      setUserData((prevData) => ({
        ...prevData,
        is_active: event.target.checked
      }));
    };

    const handleBack = () => {
      navigate('/admin/dashboard/user-management');
    };

    const handleSubmit = async (event) => {
      event.preventDefault();
      try {
        await adminAPI.updateUser(userId, userData);
        setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
        setTimeout(() => {
          navigate('/admin/dashboard/user-management');
        }, 2000);
      } catch (error) {
        console.error('Error updating user profile:', error);
        setSnackbar({ open: true, message: 'Failed to update profile. Please try again.', severity: 'error' });
      }
    };

    const handleCloseSnackbar = (event, reason) => {
      if (reason === 'clickaway') return;
      setSnackbar({ ...snackbar, open: false });
    };

    const calculateAge = (birthDate) => {
      const today = new Date();
      const birthDateObj = new Date(birthDate);
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
      return age;
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
      <Box sx={{ padding: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} variant="outlined" color="secondary" sx={{ mb: 2 }}>
          Back to User Management
        </Button>
        <Typography variant="h4" gutterBottom>Edit Profile</Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sx={{ borderBottom: '1px solid #ccc', mb: 2 }}>
              <Typography variant="h6">Personal Information</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                name="username"
                value={userData.username}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={userData.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Gender"
                name="gender"
                select
                value={userData.gender}
                onChange={handleChange}
                fullWidth
                margin="normal"
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Birth Date"
                name="birth_date"
                type="date"
                value={userData.birth_date}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Age"
                value={calculateAge(userData.birth_date)}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                name="firstname"
                value={userData.profile.firstname}
                onChange={handleProfileChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                name="lastname"
                value={userData.profile.lastname}
                onChange={handleProfileChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                name="country"
                value={userData.profile.country}
                onChange={handleProfileChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                name="state"
                value={userData.profile.state}
                onChange={handleProfileChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                name="phone_number"
                value={userData.profile.phone_number}
                onChange={handleProfileChange}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Account Created"
                value={new Date(userData.created_at).toLocaleString()}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Updated"
                value={new Date(userData.updated_at).toLocaleString()}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Login"
                value={userData.profile.last_login ? new Date(userData.profile.last_login).toLocaleString() : 'N/A'}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={userData.is_active}
                    onChange={handleCheckboxChange}
                    name="is_active"
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>Save</Button>
        </form>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
};

export default EditProfile;