import axios from "axios";
import React, { useState, useEffect } from 'react';
import styles from "./Navbar.module.css";
import {Menu, Box, AppBar, Toolbar, IconButton, Typography, Container, Button, Tooltip, MenuItem} from '@mui/material';
import IconWeb from '../../assets/IconWeb.svg';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate, Link } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const pages = ['บริจากข้อมูล', 'ติดต่อ'];
const settings = ['Profile', 'Account', 'Dashboard'];

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(''); // State for storing username
  const [anchorEl, setAnchorEl] = useState(null); // State for anchorEl of the menu
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username'); // Remove the username from local storage
    setIsLoggedIn(false);
    navigate('/');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkTokenValidity(token);
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername); // Retrieve the username from local storage
      }
      setIsLoggedIn(true);
    }
  }, []);

  const checkTokenValidity = async (token) => {
    try {
      const response = await axios.post('http://localhost:8080/api/check_token', { token });
      if (response.data.valid) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error checking token validity:', error);
    }
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" style={{ height: '70px' }} className={styles.Navbar}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img className={styles.IconWeb} src={IconWeb} alt="logo" />
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
                key={page}
                sx={{ my: 2, color: 'black', display: 'block', fontFamily: '"Pridi", sans-serif', fontWeight: '500', ml: '1em' }}
              >
                {page}
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0, display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="">
              <Button variant="outlined" className={styles.donate} color="inherit"><FavoriteIcon color="error" />donate</Button>
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
                  sx={{backgroundColor:'black',borderRadius:'30px',mr:'3.5em',width:'200px',
                  '&:hover': {
                    outline: '2px solid gray',
                    backgroundColor: 'white',
                    color: 'black', // สีของตัวอักษรเมื่อมีการวางเม้าส์เหนือปุ่ม
                    '& .MuiTypography-root': {
                      color: 'black' // สีของ Typography เมื่อมีการวางเม้าส์เหนือปุ่ม
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'black' // สีของ Icon เมื่อมีการวางเม้าส์เหนือปุ่ม
                    }
                  }
                  }}
                >
                  <Typography sx={{color:'white',padding:'5px'
                    , display: 'flex', justifyContent: 'space-between'
                  }}>{username}</Typography>
                  <ArrowDropDownIcon sx={{color:'white'
                  }}/>
                </Button>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem key={setting} onClick={handleCloseMenu}>
                      {setting}
                    </MenuItem>
                  ))}
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="outlined"
                className={styles.loginButton}
                color="inherit"
                component={Link}
                to="/login"
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
