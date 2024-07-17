import React, { useState } from 'react';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import { Button,Box, Modal, TextField, Typography, Checkbox, FormControlLabel, MenuItem, Select } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import IconWeb from '../assets/IconWeb.svg';
import styles from '../components/RegisterPage/Register.module.css';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Input from '@mui/material/Input';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [checked, setChecked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);


  const handleSubmit = async (event) => {
    event.preventDefault();

    // ตรวจสอบความถูกต้องของข้อมูลก่อนที่จะส่งไปยังเซิร์ฟเวอร์
    if (!username || !email || !password || !gender || !ageGroup) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/register', {
        username,
        email,
        password,
        gender,
        ageGroup // แก้ไขชื่อ property เป็น age_group เพื่อให้ตรงกับฝั่ง Flask
      });

      console.log(response.data);
      // Handle success
      alert('User registered successfully'); // แสดงป๊อปอัพ
      // รีเฟรชหน้าเว็บ
      window.location.href = '/login';
    } catch (error) {
      console.error('Error registering user:', error);
      // Handle error, e.g., display error message to user
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '95vh' }}>
      <div style={{ position: 'relative', height: '565px' ,width: '400px', padding: '70px', border: '1px solid #ccc', borderRadius: '0px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',backgroundColor: 'white' }}>
      <IconButton aria-label="close" size="large" style={{ position: 'absolute', top: '10px', right: '10px' }} href='/login'>
        <CloseIcon fontSize="inherit"/>
      </IconButton>
      <Typography variant="h6"><img src={IconWeb} className={styles.Logo} alt="" /></Typography>
        <Typography variant="h6">Register</Typography>
        <form onSubmit={handleSubmit}>
          <div className={styles.form}>
          <FormControl variant="standard">
            <InputLabel htmlFor="username">Username</InputLabel>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth size="small"
              style={{width:'300px'}} />
            </FormControl>
          </div>  
          <div className={styles.form}>
          <FormControl variant="standard">
            <InputLabel htmlFor="email">Email</InputLabel>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              size="small"
              style={{width:'300px'}}
            />
          </FormControl>
          </div>
          <div className={styles.form}>
          <FormControl variant="standard">
            <InputLabel htmlFor="password">Password</InputLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              size="small"
              style={{width:'300px'}}
            />
          </FormControl>
          </div>
          <div className={styles.form}> 
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="ageGroup">Age</InputLabel>
              <Select
                labelId="ageGroup"
                id="ageGroup"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                style={{width:'135px'}}
              >
                <MenuItem value="">Please select</MenuItem>
                <MenuItem value="1-20">1-20</MenuItem>
                <MenuItem value="21-30">21-30</MenuItem>
                <MenuItem value="31-40">31-40</MenuItem>
                <MenuItem value="41-54">41-54</MenuItem>
                <MenuItem value="55+">55+</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="genderGroup">Gender</InputLabel>
              <Select
                labelId="genderGroup"
                id="genderGroup"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{width:'135px'}}
              >
                <MenuItem value="">Please select</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="LGBTQ">LGBTQ</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div style={{marginLeft:'4em', marginBottom: '10px' ,display: 'flex', alignItems: 'center'}}>
            <FormControlLabel
              control={<Checkbox checked={checked} onChange={handleChange} />}
              label="ฉันยอมรับ"
            />
            <Typography variant="body1" style={{marginLeft:'-10px', cursor: 'pointer', textDecoration: 'underline', color: 'blue' }} onClick={handleModalOpen}>
              ข้อตกลง
            </Typography>

            <Modal
              open={modalOpen}
              onClose={handleModalClose}
              aria-labelledby="agreement-modal-title"
              aria-describedby="agreement-modal-description"
            >
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, minWidth: '300px' }}>
                <Typography id="agreement-modal-title" variant="h6" component="h2">
                  ข้อตกลง
                </Typography>
                <Typography id="agreement-modal-description" sx={{ mt: 2 }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.
                </Typography>
                <Button onClick={handleModalClose} style={{ marginTop: '16px' }}>
                  ปิด
                </Button>
              </Box>
            </Modal>
          </div>

          <Button type="submit" variant="outlined" style={{borderRadius: '50px',width:'250px',height:'50px',marginLeft:'1.5em'}}>Register</Button>
          {errorMessage && <p style={{color:'red'}}>{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
}

export default Register;
