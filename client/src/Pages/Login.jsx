import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, CircularProgress } from '@mui/material';
import styles from '../components/LoginPage/Login.module.css';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import IconWeb from '../assets/IconWeb.svg';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../ContextUser';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { login, checkAuth, isLoggedIn } = useUser();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuth();
        if (isLoggedIn) {
          navigate('/');
        }
      } catch (error) {
        console.error('Initialization failed:', error.message);
      }
    };
    initializeAuth();
  }, [checkAuth, navigate, isLoggedIn]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (error) {
      console.error('Error logging in:', error.response?.data?.error || error.message);
      setErrorMessage(error.response?.data?.error || 'Username หรือ password ไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '95vh' }}>
      <Box
        sx={{
          position: 'relative',
          height: '500px',
          width: '400px',
          p: '70px',
          border: '1px solid #ccc',
          borderRadius: '0px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
        }}
      >
        <IconButton href='/' aria-label="close" size="large" sx={{ position: 'absolute', top: '10px', right: '10px' }}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
        <Box>
          <Typography variant="h6"><img src={IconWeb} className={styles.Logo} alt="" /></Typography>
          <Typography variant="body1" className={styles.leftAlign}>
            Log in with Khum Muang
          </Typography>
          <form onSubmit={handleLogin}>
            <Box className={styles.form} sx={{ mt: 8 }}>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                size="small"
              />
            </Box>
            <Box className={styles.form} sx={{ mt: 2 }}>
              <TextField
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                size="small"
              />
            </Box>
            <Button type="submit" variant="contained" className={styles.submit} sx={{ borderRadius: '50px', mt: 5 }}>
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Enter'}
            </Button>
            {errorMessage && (
              <Typography color="error" sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                {errorMessage}
              </Typography>
            )}
          </form>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" className={styles.register}>
              Don't have an account? <a href="/register" style={{ marginLeft: '2px' }}>Register here</a>.
            </Typography>
          </Box>
          <hr />
          <Box>
            <Button variant="outlined" className={styles.suplogin} sx={{ mt: 2, borderRadius: '50px', height: '70px', width: '400px' }}>
              <img src="logo.png" alt="logo" className={styles.logosup} />
              <span className={styles.Text}>enter</span>
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;
