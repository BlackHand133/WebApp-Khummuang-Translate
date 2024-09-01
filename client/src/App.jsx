import React, { useContext } from 'react';
import Navbar from './components/Navbar/Navbar';  // Fixed typo: 'Narbar' to 'Navbar'
import Footer from './components/Footer/Footer';
import Body from './components/Body/Body';

function App() {

  return (
    <>
      <Navbar />
      <Body />
      <Footer />
    </>
  );
}

export default App;
