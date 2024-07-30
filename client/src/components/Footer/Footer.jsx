import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import IconFoot from '../../assets/WIwhite.svg';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import TelegramIcon from '@mui/icons-material/Telegram';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer} sx={{ height: '200px', backgroundColor: 'black' }}>
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2,ml:'-50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img src={IconFoot} alt="Logo" className={styles.logo} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalPhoneIcon sx={{ borderRadius: '50%', backgroundColor: 'white', color: 'green', padding: '5px', marginRight: '8px' }} />
          <Typography className={styles.descript} sx={{ color: '#F6EED7' }}>
            082-332-1162
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EmailIcon sx={{ borderRadius: '50%', backgroundColor: 'white', color: 'red', padding: '5px', marginRight: '8px' }} />
          <Typography className={styles.descript} sx={{ color: '#F6EED7' }}>
            64020686@up.ac.th
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TelegramIcon sx={{ borderRadius: '50%', backgroundColor: 'white', color: 'blue', padding: '5px', marginRight: '8px' }} />
          <Typography className={styles.descript} sx={{ color: '#F6EED7' }}>
            มหาวิทยาลัยพะเยา : University of phayao<br />
            19 หมู่ 2 ตำบลแม่กา อำเภอเมือง<br />
            จังหวัดพะเยา<br />
            56000
          </Typography>
        </Box>
      </Container>
    </footer>
  );
};

export default Footer;
