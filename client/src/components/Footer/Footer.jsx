import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import IconFoot from '../../assets/WIwhite.svg';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import TelegramIcon from '@mui/icons-material/Telegram';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer} style={{height:'200px', marginBottom:'-10px'}}>
      <Container maxWidth="xl">
        <Box className={styles.footerContainer}>
          <Box>
            <img src={IconFoot} alt="" className={styles.logo} />
          </Box>
          <Box sx={{display:'flex', alignItems: 'center',mt:'2.5em'}}>
            <LocalPhoneIcon sx={{borderRadius:'20px', backgroundColor:'white',color:'green',padding:'5px'}}/>
            <Typography className={styles.descript} sx={{color:'#F6EED7'}}>082-332-1162</Typography>
          </Box>
          <Box sx={{display:'flex', alignItems: 'center',mt:'2.5em'}}>
            <EmailIcon sx={{borderRadius:'20px', backgroundColor:'white',color:'red',padding:'5px'}}/>
            <Typography className={styles.descript} sx={{color:'#F6EED7'}}>64020686@up.ac.th</Typography>
          </Box>  
          <Box sx={{display:'flex', alignItems: 'center',mt:'2.5em',mr:'3.5em'}}>
            <TelegramIcon sx={{borderRadius:'20px', backgroundColor:'white',color:'blue',padding:'5px',mb:'2.8em'}}/>
            <Typography className={styles.descript} sx={{color:'#F6EED7'}} >มหาวิทยาลัยพะเยา : University of phayao <br/>19 หมู่ 2 ตำบลแม่กา อำเภอเมือง
            <br/>จังหวัดพะเยา<br/>56000</Typography>
            
          </Box>
        </Box>
      </Container>
    </footer>
  );
};

export default Footer;
