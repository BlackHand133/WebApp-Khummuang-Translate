import React from 'react';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Body from './components/Body/Body';
import Profile from './Pages/Profile';

function App() {
  return (
    <>
      <Navbar />
      {/* ใช้ React Router สำหรับการแสดงผล component ตามเส้นทาง */}
      <Body />
      <Footer />
    </>
  );
}

export default App;
