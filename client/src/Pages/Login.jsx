import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  CircularProgress, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Link 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../ContextUser';
import { usePasswordReset } from '../PasswordResetContext';
import styles from '../components/LoginPage/Login.module.css';
import IconWeb from '../assets/IconWeb.svg';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const navigate = useNavigate();
  const { login, checkAuth, isLoggedIn } = useUser();
  const { 
    forgotPassword, 
    loading: forgotPasswordLoading, 
    error: forgotPasswordError, 
    successMessage: forgotPasswordSuccess 
  } = usePasswordReset();

  const [loading, setLoading] = useState(false);

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

  const handleForgotPasswordClick = (event) => {
    event.preventDefault(); // ป้องกันการ submit ฟอร์ม
    setOpenForgotPassword(true);
  };

  const handleForgotPassword = async () => {
    try {
      await forgotPassword(forgotPasswordEmail);
      // แสดงข้อความสำเร็จ
      // ปิด dialog หลังจากส่งอีเมลสำเร็จ
      setTimeout(() => setOpenForgotPassword(false), 3000);
    } catch (error) {
      // จัดการข้อผิดพลาดถ้ามี (error จะถูกจัดการใน context แล้ว)
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
        <IconButton 
          href='/' 
          aria-label="close" 
          size="large" 
          sx={{ position: 'absolute', top: '10px', right: '10px' }}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
        <Box>
          <Typography variant="h6">
            <img src={IconWeb} className={styles.Logo} alt="Khum Muang Logo" />
          </Typography>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 2 }}>
              <Link
                component="button"
                variant="body2"
                onClick={handleForgotPasswordClick}
                underline="hover"
              >
                Forgot Password?
              </Link>
            </Box>
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{ 
                mt: 2, 
                mb: 2, 
                height: '48px',
                borderRadius: '24px',
                fontSize: '16px',
                textTransform: 'none'
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Log In'}
            </Button>
          </form>
          {errorMessage && (
            <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
              {errorMessage}
            </Typography>
          )}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account? <Link href="/register" underline="hover">Register here</Link>
            </Typography>
          </Box>
          <Box sx={{ mt: 3 }}>
            <Button 
              variant="outlined" 
              fullWidth 
              sx={{ 
                height: '48px',
                borderRadius: '24px',
                textTransform: 'none'
              }}
            >
              <img src="logo.png" alt="logo" className={styles.logosup} style={{ marginRight: '8px' }} />
              Log in with Sup
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog open={openForgotPassword} onClose={() => setOpenForgotPassword(false)}>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
          />
          {forgotPasswordError && (
            <Typography color="error" sx={{ mt: 2 }}>
              {forgotPasswordError}
            </Typography>
          )}
          {forgotPasswordSuccess && (
            <Typography color="success" sx={{ mt: 2 }}>
              {forgotPasswordSuccess}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForgotPassword(false)}>Cancel</Button>
          <Button onClick={handleForgotPassword} disabled={forgotPasswordLoading}>
            {forgotPasswordLoading ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Login;