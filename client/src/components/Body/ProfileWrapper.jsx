import React, { Suspense, lazy } from 'react';
import { Box, Container, Skeleton } from '@mui/material';

const Profile = lazy(() => import('../../Pages/Profile.jsx'));

const ProfilePlaceholder = () => (
  <Box sx={{ backgroundColor: 'white', mt: 8, minHeight: '80vh' }}>
    <Container maxWidth="md">
      <Skeleton variant="rectangular" width="100%" height={200} />
      <Box sx={{ mt: 4 }}>
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="text" width="70%" height={40} />
      </Box>
    </Container>
  </Box>
);

const ProfileWrapper = () => (
  <Suspense fallback={<ProfilePlaceholder />}>
    <Profile />
  </Suspense>
);

export default ProfileWrapper;