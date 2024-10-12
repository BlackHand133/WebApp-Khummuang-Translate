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
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'; // เพิ่ม import สำหรับไอคอนลูกศร
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
  const { isLoggedIn, username, logout } = useUser();
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
      await logout();
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
          ml: isMobile ? 1 : 2
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
              marginLeft: isMobile ? '25px' : '16px',
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
                  minWidth: '120px', // กำหนดความกว้างขั้นต่ำ
                  justifyContent: 'space-between', // จัดวางเนื้อหาภายในปุ่ม
                  padding: '5px 10px', // เพิ่ม padding เพื่อให้มีพื้นที่สำหรับลูกศร
                }}
              >
                <Typography sx={{ 
                  color: 'white', 
                  fontSize: '1rem',
                  maxWidth: '100px', // จำกัดความกว้างของข้อความ
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {username}
                </Typography>
                <ArrowDropDownIcon sx={{ color: 'white' }} />
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
                padding: '4px 12px',
                fontSize: '1rem',
                minWidth: '120px', // กำหนดความกว้างขั้นต่ำเพื่อให้เท่ากับปุ่มชื่อผู้ใช้
              }}
            >
              Login / Register
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;