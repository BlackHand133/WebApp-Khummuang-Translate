import React, { useState } from 'react';
import { Button, Box, Modal, Typography, Checkbox, FormControlLabel, MenuItem, Select, InputLabel, TextField, FormControl } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import IconWeb from '../assets/IconWeb.svg';
import styles from '../components/RegisterPage/Register.module.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../ContextUser';

function Register() {
  const { register, login } = useUser(); // ใช้ฟังก์ชัน register และ login จาก UserContext
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
  
    // ตรวจสอบรูปแบบของอีเมล
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }
  
    try {
      await register(username, email, password, gender, birthDate); // ใช้ฟังก์ชัน register จาก UserContext
      await login(username, password); // ใช้ฟังก์ชัน login จาก UserContext
      alert('สมัครสมาชิกและเข้าสู่ระบบเรียบร้อยแล้ว');
      navigate('/'); // นำทางไปยังหน้าหลัก
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      setErrorMessage('เกิดข้อผิดพลาดในการสมัครสมาชิกหรือเข้าสู่ระบบ โปรดลองอีกครั้ง');
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
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '95vh', marginTop: '50px' }}>
      <Box sx={{ position: 'relative', height: '650px', width: '400px', padding: '70px', border: '1px solid #ccc', borderRadius: '0px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', backgroundColor: 'white' }}>
        <IconButton aria-label="close" size="large" sx={{ position: 'absolute', top: '10px', right: '10px' }} href='/login'>
          <CloseIcon fontSize="inherit"/>
        </IconButton>
        <Typography variant="h6"><img src={IconWeb} className={styles.Logo} alt="" /></Typography>
        <Typography variant="h6">Register</Typography>
        <form onSubmit={handleSubmit}>
          <Box className={styles.form}>
            <TextField
              id="username"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              size="small"
              sx={{ width: '300px' }}
            />
          </Box>
          <Box className={styles.form}>
            <TextField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              size="small"
              sx={{ width: '300px' }}
            />
          </Box>
          <Box className={styles.form}>
            <TextField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              size="small"
              sx={{ width: '300px' }}
            />
          </Box>
          <Box className={styles.form}>
            <TextField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              size="small"
              sx={{ width: '300px' }}
            />
          </Box>
          <Box className={styles.form} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="genderGroup">Gender</InputLabel>
              <Select
                labelId="genderGroup"
                id="genderGroup"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                sx={{ width: '110px' }}
              >
                <MenuItem value="">Please select</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="LGBTQ">LGBTQ</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="standard" sx={{ marginRight: '3em' }}>
              <TextField
                id="birthDate"
                label="Birth Date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ width: '150px' }}
              />
            </FormControl>
          </Box>
          <Box sx={{ marginLeft: '4em', marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={<Checkbox checked={checked} onChange={handleChange} />}
              label="I agree"
            />
            <Typography variant="body1" sx={{ marginLeft: '-10px', cursor: 'pointer', textDecoration: 'underline', color: 'blue' }} onClick={handleModalOpen}>
              Terms
            </Typography>

            <Modal
              open={modalOpen}
              onClose={handleModalClose}
              aria-labelledby="agreement-modal-title"
              aria-describedby="agreement-modal-description"
            >
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, minWidth: '300px' }}>
                <Typography id="agreement-modal-title" variant="h6" component="h2">
                  Terms
                </Typography>
                <Typography id="agreement-modal-description" sx={{ mt: 2 }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.
                </Typography>
                <Button onClick={handleModalClose} sx={{ marginTop: '16px' }}>
                  Close
                </Button>
              </Box>
            </Modal>
          </Box>

          <Button type="submit" variant="outlined" sx={{ borderRadius: '50px', width: '250px', height: '50px', marginLeft: '1.5em' }}>
            Register
          </Button>
          {errorMessage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
              <Typography sx={{ color: 'red', justifyContent: 'center', textAlign: 'center' }}>{errorMessage}</Typography>
            </Box>
          )}
        </form>
      </Box>
    </Box>
  );
}

export default Register;
