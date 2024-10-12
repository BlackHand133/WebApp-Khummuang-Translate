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
  Link,
  useTheme,
  useMediaQuery
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        console.error('ไม่สามารถเริ่มระบบได้:', error.message);
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
      console.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ:', error.response?.data?.error || error.message);
      setErrorMessage(error.response?.data?.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
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
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: isMobile ? 'white' : '#f5f5f5'
    }}>
      <Box
        sx={{
          position: 'relative',
          width: isMobile ? '100%' : '400px',
          height: isMobile ? '100vh' : 'auto',
          p: isMobile ? '20px' : '40px',
          border: isMobile ? 'none' : '1px solid #ccc',
          borderRadius: isMobile ? '0px' : '8px',
          boxShadow: isMobile ? 'none' : '0 0 20px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
        }}
      >
        {!isMobile && (
          <IconButton 
            href='/' 
            aria-label="close" 
            size="large" 
            sx={{ position: 'absolute', top: '10px', right: '10px' }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        )}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <img src={IconWeb} className={styles.Logo} alt="Khum Muang Logo" style={{ width: isMobile ? '100px' : '120px' }} />
          <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
            เข้าสู่ระบบ Khum Muang
          </Typography>
        </Box>
        <form onSubmit={handleLogin}>
          <TextField
            label="ชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            type="password"
            label="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={handleForgotPasswordClick}
              underline="hover"
            >
              ลืมรหัสผ่าน?
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
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'เข้าสู่ระบบ'}
          </Button>
        </form>
        {errorMessage && (
          <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
            {errorMessage}
          </Typography>
        )}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            ไม่มีบัญชีผู้ใช้? <Link href="/register" underline="hover">ลงทะเบียนที่นี่</Link>
          </Typography>
        </Box>
        {/*<Box sx={{ mt: 3 }}>
          <Button 
            variant="outlined" 
            fullWidth 
            sx={{ 
              height: '48px',
              borderRadius: '24px',
              textTransform: 'none'
            }}
          >
            <img src="logo.png" alt="logo" className={styles.logosup} style={{ marginRight: '8px', height: '24px' }} />
            เข้าสู่ระบบด้วย Sup
          </Button>
        </Box>*/}
      </Box>

      {/* กล่องลืมรหัสผ่าน */}
      <Dialog open={openForgotPassword} onClose={() => setOpenForgotPassword(false)}>
        <DialogTitle>ลืมรหัสผ่าน</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="ที่อยู่อีเมล"
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
          <Button onClick={() => setOpenForgotPassword(false)}>ยกเลิก</Button>
          <Button onClick={handleForgotPassword} disabled={forgotPasswordLoading}>
            {forgotPasswordLoading ? <CircularProgress size={24} /> : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Login;
