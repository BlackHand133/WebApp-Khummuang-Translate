import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar, 
  Box,
  useTheme,
  useMediaQuery,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon as MenuItemIcon
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HomeIcon from '@mui/icons-material/Home';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from "../../ContextUser";
import IconWeb from '../../assets/IconWeb.svg';
import styles from "./Navbar.module.css";

const pages = [
  { name: 'หน้าแรก', path: '/', icon: <HomeIcon /> },
  { name: 'บริจากข้อมูล', path: '/donate', icon: <FavoriteIcon /> }, 
  { name: 'ติดต่อ', path: '/contact', icon: <ContactMailIcon /> }
];

function Navbar() {
  const { isLoggedIn, username, logout } = useUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setDrawerOpen(false);
      handleCloseMenu();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const mobileMenuList = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {pages.map((page) => (
          <ListItem button key={page.name} component={Link} to={page.path}>
            <ListItemIcon>{page.icon}</ListItemIcon>
            <ListItemText primary={page.name} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {isLoggedIn ? (
          <>
            <ListItem button component={Link} to={`/${username}`}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="โปรไฟล์" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="ออกจากระบบ" />
            </ListItem>
          </>
        ) : (
          <ListItem button component={Link} to="/login">
            <ListItemIcon><LoginIcon /></ListItemIcon>
            <ListItemText primary="เข้าสู่ระบบ / ลงทะเบียน" />
          </ListItem>
        )}
      </List>
    </Box>
  );

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
      <Toolbar disableGutters>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <img
            className={styles.IconWeb}
            src={IconWeb}
            alt="logo"
            style={{
              marginLeft: isMobile ? '1em' : '3.5em',
              marginRight: isMobile ? '1em' : '3.5em',
              height: 'auto',
              width: isMobile ? '150px' : '200px',
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
              }}
            >
              Welcome!
            </Typography>
          )}
        </Box>

        {isMobile ? (
          <>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{
                backgroundColor: '#f0f0f0',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
            >
              {mobileMenuList}
            </Drawer>
          </>
        ) : (
          <>
            <Box sx={{ flexGrow: 1, display: 'flex' }}>
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
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
              <Button
                variant="outlined"
                className={styles.donate}
                color="inherit"
                component={Link}
                to="/donate"
                sx={{
                  marginRight: '1em',
                  borderRadius: '50px',
                  backgroundColor: '#43CCF8',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#3bb8e0',
                  },
                }}
              >
                <FavoriteIcon sx={{ color: 'red', marginRight: 1 }} />
                Donate
              </Button>
              {isLoggedIn ? (
                <>
                  <Button
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleOpenMenu}
                    color="inherit"
                    sx={{
                      backgroundColor: 'black',
                      borderRadius: '50px',
                      marginRight: '1em',
                      '&:hover': {
                        backgroundColor: 'white',
                        color: 'black',
                        outline: '2px solid gray',
                      },
                    }}
                  >
                    <Typography sx={{ color: 'white', padding: '5px' }}>
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
                    marginRight: '1em',
                    backgroundColor: 'white',
                    borderRadius: '50px',
                    color: 'black',
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                    },
                  }}
                >
                  Login / Register
                </Button>
              )}
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;