import React,{lazy} from 'react'
import { Box, Container } from '@mui/material';
const ProfileWrapper = lazy(() => import('./ProfileWrapper.jsx'));
function Wrapperwhite() {
  return (
    <Box sx={{ backgroundColor: 'white', mt: 8, minHeight: '80vh' }}>
        <ProfileWrapper/>
    </Box>
  )
}

export default Wrapperwhite