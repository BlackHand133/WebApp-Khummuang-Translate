import React, { useState } from 'react';
import styles from "./Navbar.module.css";
import { Menu, Box, AppBar, Toolbar, Typography, Container, Button, Tooltip, MenuItem, Avatar, ListItemIcon } from '@mui/material';
import IconWeb from '../../assets/IconWeb.svg';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate, Link } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useUser } from "../../ContextUser";
import Logout from '@mui/icons-material/Logout';

const pages = [
  { name: 'บริจากข้อมูล', path: '/donate' }, 
  { name: 'ติดต่อ', path: '/contact' }
];

function Navbar() {
  const { isLoggedIn, username, logout } = useUser();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: 'white !important',
        color: 'black !important',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)', // Adjusted shadow
      }}
      className={styles.Navbar}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              className={styles.IconWeb}
              src={IconWeb}
              alt="logo"
              style={{
                marginLeft: '3.5em',
                marginRight: '3.5em',
                height: 'auto',
                width: '200px',
              }}
            />
            <Typography
              variant="h6"
              noWrap
              component={Link}
              to='/'
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              Welcome!
            </Typography>
          </div>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                component={Link}
                to={page.path}
                sx={{
                  my: 2,
                  color: 'black',
                  display: 'block',
                  fontFamily: '"Pridi", sans-serif',
                  fontWeight: '500',
                  ml: '1em',
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0, display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Donate">
              <Button
                variant="outlined"
                className={styles.donate}
                color="inherit"
                sx={{
                  marginRight: '3em !important',
                  borderRadius: '50px !important',
                  backgroundColor: '#43CCF8 !important',
                  color: 'white !important',
                  width: '120px !important',
                }}
              >
                <FavoriteIcon sx={{ color: 'red' }} />
                Donate
              </Button>
            </Tooltip>
          </Box>
          <Box sx={{ flexGrow: 0, display: 'flex', justifyContent: 'center' }}>
            {isLoggedIn ? (
              <>
                <Button
                  size="large"
                  aria-label="menu"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleOpenMenu}
                  color="inherit"
                  sx={{
                    backgroundColor: 'black',
                    borderRadius: '50px !important',
                    marginRight: '3.5em !important',
                    width: '200px',
                    gap: '20px',
                    '&:hover': {
                      outline: '2px solid gray',
                      backgroundColor: 'white !important',
                      color: 'black !important',
                      '& .MuiTypography-root': {
                        color: 'black !important',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'black !important',
                      },
                    },
                  }}
                >
                  <Typography sx={{ color: 'white', padding: '5px', display: 'flex', justifyContent: 'space-between' }}>
                    {username}
                  </Typography>
                  <ArrowDropDownIcon sx={{ color: 'white' }} />
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  id="account-menu"
                  open={open}
                  onClose={handleCloseMenu}
                  onClick={handleCloseMenu}
                  slotProps={{
                    paper: {
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        minWidth: 200,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        '&::before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem  component={Link} to={`/${username}`} onClick={handleCloseMenu}>
                    <Avatar /> Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
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
                  marginRight: '3.5em !important',
                  backgroundColor: 'white !important',
                  borderRadius: '50px !important',
                  color: 'black !important',
                }}
              >
                Login / Register
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
