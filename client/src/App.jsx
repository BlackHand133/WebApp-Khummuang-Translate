import { useState } from 'react';
import axios from 'axios';
import Navbar from './components/Narbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar';
import Footer from './components/Footer/Footer';
import { CssBaseline, Container, Box, Typography } from '@mui/material';
import Body from './components/Body/Body';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  

  const handleLogin = (username) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setIsLoggedIn(true);
    setCurrentUser(username);
  };

  const handleFileChange = (event) => {
    setAudioFile(event.target.files[0]);
  };

  


  return (
    <>
    <Navbar isLoggedIn={isLoggedIn} username={username} onLogout={handleLogout} />
    <Body/>
    <Sidebar />
    <Footer />
      
      
    </>
  );
}

export default App;
