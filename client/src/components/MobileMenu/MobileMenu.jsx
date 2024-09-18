import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Box,
  Collapse,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import MicIcon from '@mui/icons-material/Mic';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useNavigate } from 'react-router-dom';
import { useUser } from "../../ContextUser";

const pages = [
  { name: 'หน้าแรก', path: '/', icon: <HomeIcon /> },
  { name: 'บริจากข้อมูล', path: '/donate', icon: <FavoriteIcon /> },
  { name: 'ติดต่อ', path: '/contact', icon: <ContactMailIcon /> }
];

const StyledListItem = styled(ListItem)(({ theme }) => ({
  transition: theme.transitions.create(['padding-left'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  }),
}));

const MobileMenu = ({ 
  onOptionChange, 
  onInputToggle, 
  onLogout,
  selectedOption,
  activeInput
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [voiceOptionsOpen, setVoiceOptionsOpen] = useState(false);
  const { isLoggedIn, username } = useUser();
  const navigate = useNavigate();

  const handleOptionChange = (option) => {
    if (option === 'voice') {
      setVoiceOptionsOpen(!voiceOptionsOpen);
    } else {
      onOptionChange(option);
      onInputToggle(null);
      setVoiceOptionsOpen(false);
    }
  };

  const handleInputToggle = (input) => {
    onOptionChange('voice');
    onInputToggle(input);
    setDrawerOpen(false);
    setVoiceOptionsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await onLogout();
      setDrawerOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="open menu"
        onClick={() => setDrawerOpen(true)}
        sx={{ 
          position: 'fixed',
          top: 10, 
          left: 16, 
          zIndex: 1200,
          backgroundColor: 'rgba(32, 32, 32, 0.7)',
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(32, 32, 32, 0.9)',
          }
        }}
      >
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setVoiceOptionsOpen(false);
        }}
        PaperProps={{
          sx: { 
            width: '80%', 
            maxWidth: 360,
            backgroundColor: '#f5f5f5',
          }
        }}
      >
        <Box sx={{ 
          height: '100%', 
          padding: '20px', 
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontFamily: '"Mitr", sans-serif', fontWeight: 500 }}>
              เมนู
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 2 }} />

          <List component="nav">
            {pages.map((page) => (
              <ListItem 
                button 
                key={page.name} 
                onClick={() => handleNavigation(page.path)}
              >
                <ListItemIcon>{page.icon}</ListItemIcon>
                <ListItemText primary={page.name} />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <List>
            <StyledListItem 
              button 
              selected={selectedOption === 'text'}
              onClick={() => handleOptionChange('text')}
            >
              <ListItemIcon>
                <TextFieldsIcon />
              </ListItemIcon>
              <ListItemText primary="ข้อความ" />
            </StyledListItem>
            <StyledListItem 
              button 
              selected={selectedOption === 'voice'}
              onClick={() => handleOptionChange('voice')}
            >
              <ListItemIcon>
                <RecordVoiceOverIcon />
              </ListItemIcon>
              <ListItemText primary="เสียง" />
            </StyledListItem>
            <Collapse in={voiceOptionsOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <StyledListItem 
                  button 
                  selected={activeInput === 'microphone'}
                  onClick={() => handleInputToggle('microphone')}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>
                    <MicIcon />
                  </ListItemIcon>
                  <ListItemText primary="ไมโครโฟน" />
                </StyledListItem>
                <StyledListItem 
                  button 
                  selected={activeInput === 'upload'}
                  onClick={() => handleInputToggle('upload')}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>
                    <UploadFileIcon />
                  </ListItemIcon>
                  <ListItemText primary="อัปโหลดไฟล์" />
                </StyledListItem>
              </List>
            </Collapse>
          </List>

          <Box sx={{ mt: 'auto' }}>
            <Divider sx={{ my: 2 }} />
            {isLoggedIn ? (
              <>
                <ListItem button onClick={() => handleNavigation(`/${username}`)}>
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText primary="โปรไฟล์" />
                </ListItem>
                <ListItem button onClick={handleLogout}>
                  <ListItemIcon><LogoutIcon /></ListItemIcon>
                  <ListItemText primary="ออกจากระบบ" />
                </ListItem>
              </>
            ) : (
              <ListItem button onClick={() => handleNavigation('/login')}>
                <ListItemIcon><LoginIcon /></ListItemIcon>
                <ListItemText primary="เข้าสู่ระบบ / ลงทะเบียน" />
              </ListItem>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default MobileMenu;