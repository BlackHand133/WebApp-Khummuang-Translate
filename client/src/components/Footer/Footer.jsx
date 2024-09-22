import React from 'react';
import { Box, Container, Typography, useTheme, useMediaQuery, Grid } from '@mui/material';
import IconFoot from '../../assets/WIwhite.svg';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import TelegramIcon from '@mui/icons-material/Telegram';
import styles from './Footer.module.css';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <footer className={styles.footer}>
      <Container maxWidth="xl">
        <Grid container spacing={3} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Box sx={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start', mb: isMobile ? 2 : 0 }}>
              <img src={IconFoot} alt="Logo" className={styles.logo} />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={8} lg={9}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                  <LocalPhoneIcon className={styles.icon} />
                  <Typography className={styles.descript}>
                    082-332-1162
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                  <EmailIcon className={styles.icon} />
                  <Typography className={styles.descript}>
                    64020686@up.ac.th
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                  <TelegramIcon className={styles.icon} />
                  <Typography className={styles.descript}>
                    มหาวิทยาลัยพะเยา : University of phayao<br />
                    19 หมู่ 2 ตำบลแม่กา อำเภอเมือง<br />
                    จังหวัดพะเยา 56000
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </footer>
  );
};

export default Footer;