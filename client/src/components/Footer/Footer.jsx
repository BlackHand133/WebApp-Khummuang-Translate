import React from 'react';
import { Box, Container, Typography, useTheme, useMediaQuery } from '@mui/material';
import IconFoot from '../../assets/WIwhite.svg';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import TelegramIcon from '@mui/icons-material/Telegram';
import styles from './Footer.module.css';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <footer className={styles.footer} style={{ backgroundColor: 'black', padding: '20px 0' }}>
      <Container maxWidth="xl" sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 2 : 0 }}>
          <img src={IconFoot} alt="Logo" className={styles.logo} style={{ maxWidth: '100%', height: 'auto' }} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <TelegramIcon sx={{ borderRadius: '50%', backgroundColor: 'white', color: 'blue', padding: '5px', marginRight: '8px', mt: '4px' }} />
            <Typography className={styles.descript} sx={{ color: '#F6EED7' }}>
              มหาวิทยาลัยพะเยา : University of phayao<br />
              19 หมู่ 2 ตำบลแม่กา อำเภอเมือง<br />
              จังหวัดพะเยา<br />
              56000
            </Typography>
          </Box>
        </Box>
      </Container>
    </footer>
  );
};

export default Footer;