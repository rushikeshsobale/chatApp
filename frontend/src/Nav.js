import React, { useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import './Chat.css'; // import your custom styles
import AuthForms from './AuthForms';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">GalacticHub</Link>
        </div>
        <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
          <Link to="/">Home</Link>
          <Link to="/AuthForms">SingUp</Link>
          <Link to="/Users">Discover</Link>
          <Link to="/Notifications">Notifications</Link>
        </div>
        <div className="navbar-toggle" onClick={toggleMenu}>
          <div className={`menu-icon ${isOpen ? 'open' : ''}`}>
            <div className="menu-icon-inner"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
