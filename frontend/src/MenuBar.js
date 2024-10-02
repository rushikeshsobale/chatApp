// MenuBar.js
import React from 'react';
import './MenuBar.css';

const MenuBar = () => {
    const handleMenuClick = (option) => {
        alert(`You clicked on ${option}`);
        // Add additional actions here, e.g., navigation
    };

    return (
        <div className="menu-bar">
            <div className="menu-item" onClick={() => handleMenuClick('Home')}>Home</div>
            <div className="menu-item" onClick={() => handleMenuClick('About')}>About</div>
            <div className="menu-item" onClick={() => handleMenuClick('Services')}>Services</div>
            <div className="menu-item" onClick={() => handleMenuClick('Portfolio')}>Portfolio</div>
            <div className="menu-item" onClick={() => handleMenuClick('Contact')}>Contact</div>
        </div>
    );
};

export default MenuBar;
