import React, { useState } from 'react';
import { Button, Box, Modal, Typography, Checkbox, FormControlLabel, MenuItem, Select, InputLabel, TextField, FormControl, useMediaQuery, useTheme } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import IconWeb from '../assets/IconWeb.svg';
import styles from '../components/RegisterPage/Register.module.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../ContextUser';

function Register() {
  const { register, login } = useUser(); 
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [checked, setChecked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!username || !email || !password || !confirmPassword || !gender || !birthDate) {
      setErrorMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
  
    if (password !== confirmPassword) {
      setErrorMessage('รหัสผ่านไม่ตรงกัน');
      return;
    }
  
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }

    if (!checked) {
      setErrorMessage('กรุณายอมรับข้อตกลงและเงื่อนไข');
      return;
    }
  
    try {
      await register(username, email, password, gender, birthDate);
      await login(username, password);
      alert('สมัครสมาชิกและเข้าสู่ระบบเรียบร้อยแล้ว');
      navigate('/');
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก โปรดลองอีกครั้ง');
    }
  };

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };

  const handleModalOpen = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: isMobile ? 'white' : '#f5f5f5'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: isMobile ? '100%' : '400px',
          p: isMobile ? '20px' : '40px',
          border: isMobile ? 'none' : '1px solid #ccc',
          borderRadius: isMobile ? '0px' : '8px',
          boxShadow: isMobile ? 'none' : '0 0 20px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
        }}
      >
        <IconButton 
          aria-label="close" 
          size="large" 
          sx={{ position: 'absolute', top: '10px', right: '10px' }} 
          href='/login'
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <img src={IconWeb} className={styles.Logo} alt="Khum Muang Logo" style={{ width: isMobile ? '100px' : '120px' }} />
          <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
            ลงทะเบียน
          </Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            id="username"
            label="ชื่อผู้ใช้"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            size="small"
            variant="outlined"
          />
          <TextField
            id="email"
            label="อีเมล"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            size="small"
            variant="outlined"
          />
          <TextField
            id="password"
            label="รหัสผ่าน"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            size="small"
            variant="outlined"
          />
          <TextField
            id="confirmPassword"
            label="ยืนยันรหัสผ่าน"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            margin="normal"
            size="small"
            variant="outlined"
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <FormControl variant="outlined" fullWidth sx={{ mr: 1 }}>
              <InputLabel>เพศ</InputLabel>
              <Select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                label="เพศ"
              >
                <MenuItem value=""><em>กรุณาเลือก</em></MenuItem>
                <MenuItem value="male">ชาย</MenuItem>
                <MenuItem value="female">หญิง</MenuItem>
                <MenuItem value="LGBTQ">LGBTQ</MenuItem>
              </Select>
            </FormControl>
            <TextField
              id="birthDate"
              label="วันเกิด"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <FormControlLabel
            control={<Checkbox checked={checked} onChange={handleChange} />}
            label="ฉันยอมรับ"
            sx={{ mt: 2 }}
          />
          <Typography 
            variant="body2" 
            sx={{ textDecoration: 'underline', cursor: 'pointer', color: 'blue' }} 
            onClick={handleModalOpen}
          >
            ข้อตกลงและเงื่อนไข
          </Typography>
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
          >
            ลงทะเบียน
          </Button>
        </form>
        {errorMessage && (
          <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
            {errorMessage}
          </Typography>
        )}
      </Box>

      {/* ข้อตกลงและเงื่อนไข Modal */}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          width: 300, 
          bgcolor: 'background.paper', 
          boxShadow: 24, 
          p: 4 
        }}>
          <Typography variant="h6" component="h2">ข้อตกลงและเงื่อนไข</Typography>
          <Typography sx={{ mt: 2 }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.
          </Typography>
          <Button onClick={handleModalClose} sx={{ mt: 2 }}>ปิด</Button>
        </Box>
      </Modal>
    </Box>
  );
}

export default Register;
