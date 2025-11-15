import React, { useEffect, useState } from 'react';
import './Loader.css'; // Create this file or use a CSS module
import { assets } from '../assets/assets';

const Loader = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    
    const timer = setTimeout(() => setShow(false), 2600);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="loader-overlay">
      <div className="logo-anim">
      <img src={assets.logo} alt="Rentro Logo" style={{ height: '70px' }} />
      </div>
    </div>
  );
};

export default Loader;
