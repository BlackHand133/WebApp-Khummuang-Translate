import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography } from '@mui/material';
import styles from '../components/LoginPage/Login.module.css';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import IconWeb from '../assets/IconWeb.svg';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkTokenValidity(token);
    }
  }, []);

  const checkTokenValidity = async (token) => {
    try {
      const response = await axios.post('http://localhost:8080/api/protected', null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking token validity:', error);
      setErrorMessage('Token หมดอายุหรือไม่ถูกต้อง');
      localStorage.removeItem('token');
    }
  };
  
  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/login', {
        username,
        password,
      });
  
      if (response.data.message === 'Login successful') {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('username', username);
        navigate('/');
      } else {
        setErrorMessage('Username หรือ password ไม่ถูกต้อง');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setErrorMessage('Username หรือ password ไม่ถูกต้อง');
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
              enter
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
