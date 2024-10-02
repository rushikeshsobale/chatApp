import React, { useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import './Nav.css'; // import your custom styles
import AuthForms from './AuthForms';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar" style={{ zIndex: 1 }}>
    <div className="navbar-container ">
      <div className={`navbar-menu ${isOpen ? 'active' : ''} m-auto`}>
        <Link to="/" className="nav-item">Home</Link>
        <Link to="/AuthForms" className="nav-item">Sign Up</Link>
        <Link to="/Users" className="nav-item">Discover</Link>
        <Link to="/ProfilePage" className="nav-item">Profile</Link>
      </div>
      <div className="navbar-toggle" onClick={toggleMenu}>
        <div className={`menu-icon ${isOpen ? 'open' : ''}`}>
          <div className="menu-icon-inner"></div>
          <div className="menu-icon-inner"></div>
          <div className="menu-icon-inner"></div>
        </div>
      </div>
    </div>
  </nav>
  

  );
};

export default Navbar;
