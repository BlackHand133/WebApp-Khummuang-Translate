import React from 'react';
import { List, ListItemIcon, ListItemText } from '@mui/material';
import { Person, Lock, AccountCircle } from '@mui/icons-material';
import { RoundedMenuItem } from './StyledComponents';

function SideMenu({ activeSection, setActiveSection }) {
  return (
    <List>
      <RoundedMenuItem 
        button 
        selected={activeSection === 'profile'} 
        onClick={() => setActiveSection('profile')}
      >
        <ListItemIcon><Person /></ListItemIcon>
        <ListItemText primary="Profile" />
      </RoundedMenuItem>
      <RoundedMenuItem 
        button 
        selected={activeSection === 'password'} 
        onClick={() => setActiveSection('password')}
      >
        <ListItemIcon><Lock /></ListItemIcon>
        <ListItemText primary="Change Password" />
      </RoundedMenuItem>
      <RoundedMenuItem 
        button 
        selected={activeSection === 'account'} 
        onClick={() => setActiveSection('account')}
      >
        <ListItemIcon><AccountCircle /></ListItemIcon>
        <ListItemText primary="Account" />
      </RoundedMenuItem>
    </List>
  );
}

export default SideMenu;