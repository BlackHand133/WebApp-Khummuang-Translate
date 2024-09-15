import React from 'react';
import Navbar from './components/Navbar/Navbar';
import Body from './components/Body/Body';

function App() {
  return (
    <>
      <Navbar />
      {/* ใช้ React Router สำหรับการแสดงผล component ตามเส้นทาง */}
      <Body />
    </>
  );
}

export default App;
