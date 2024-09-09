import React from 'react';
import { TextField, Button, Grid, Box, Typography, Divider, CircularProgress } from '@mui/material';
import { Person, Email, Cake, Wc, Public, LocationCity, Phone } from '@mui/icons-material';
import { StyledTextField, EnhancedSaveButton } from './StyledComponents';

function ProfileForm({ editProfile, handleChange, handleSave, isProfileChanged, saving }) {
  return (
    <Box >
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
            name="profile.phone_number"
            value={editProfile.profile?.phone_number || ''}
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
}

export default ProfileForm;