import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Avatar, 
  Box,
  Menu,
  MenuItem,
  ListItemIcon as MenuItemIcon,
  useMediaQuery,
  useTheme
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from "../../ContextUser";
import IconWeb from '../../assets/IconWeb.svg';
import styles from "./Navbar.module.css";

const pages = [
  { name: 'หน้าแรก', path: '/' },
  { name: 'บริจากข้อมูล', path: '/donate' }, 
  { name: 'ติดต่อ', path: '/contact' }
];

const Navbar = ({ onLogout }) => {
  const { isLoggedIn, username } = useUser();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await onLogout();
      navigate('/');
      handleCloseMenu();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: 'white !important',
        color: 'black !important',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
      }}
      className={styles.Navbar}
    >
      <Toolbar 
        disableGutters 
        sx={{ 
          justifyContent: 'space-between', 
          px: isMobile ? 2 : 3,
          ml: isMobile ? 1 : 2 // Added left margin for both mobile and desktop
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img
            className={styles.IconWeb}
            src={IconWeb}
            alt="logo"
            style={{
              height: 'auto',
              width: isMobile ? '100px' : '200px',
              marginLeft: isMobile ? '25px' : '16px', // Added margin-left to the logo
            }}
          />
          {!isMobile && (
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to='/'
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
                ml: 2
              }}
            >
              Welcome!
            </Typography>
          )}
        </Box>

        {!isMobile && (
          <Box sx={{ display: 'flex' }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                component={Link}
                to={page.path}
                sx={{
                  color: 'black',
                  display: 'block',
                  fontFamily: '"Pridi", sans-serif',
                  fontWeight: '500',
                  mx: 1,
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!isMobile && (
            <Button
              variant="outlined"
              className={styles.donate}
              color="inherit"
              component={Link}
              to="/donate"
              sx={{
                mr: 1,
                borderRadius: '50px',
                backgroundColor: '#43CCF8',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#3bb8e0',
                },
              }}
            >
              <FavoriteIcon sx={{ color: 'red', mr: 1 }} />
              Donate
            </Button>
          )}
          {isLoggedIn ? (
            <>
              <Button
                size="small"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenMenu}
                color="inherit"
                sx={{
                  backgroundColor: 'black',
                  borderRadius: '50px',
                  '&:hover': {
                    backgroundColor: 'white',
                    color: 'black',
                    outline: '2px solid gray',
                  },
                  ...(isMobile && {
                    padding: '4px 8px',
                    minWidth: 0,
                  }),
                }}
              >
                <Typography sx={{ 
                  color: 'white', 
                  padding: isMobile ? '2px' : '5px',
                  fontSize: isMobile ? '0.8rem' : '1rem',
                }}>
                  {isMobile ? username.charAt(0).toUpperCase() : username}
                </Typography>
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                onClick={handleCloseMenu}
              >
                <MenuItem component={Link} to={`/${username}`}>
                  <MenuItemIcon>
                    <Avatar sx={{ width: 24, height: 24 }} />
                  </MenuItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <MenuItemIcon>
                    <LogoutIcon fontSize="small" />
                  </MenuItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="outlined"
              className={styles.loginButton}
              color="inherit"
              component={Link}
              to="/login"
              sx={{
                backgroundColor: 'white',
                borderRadius: '50px',
                color: 'black',
                '&:hover': {
                  backgroundColor: '#f0f0f0',
                },
                ...(isMobile && {
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  minWidth: 0,
                }),
              }}
            >
              {isMobile ? 'Login' : 'Login / Register'}
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;