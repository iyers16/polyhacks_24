// Sidebar.jsx
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import "./SideBar.css";

const Sidebar = ({ visible, toggle }) => {
    return (
        <div className={`sidebar ${visible ? 'show' : ''}`}>
            <button className="toggle-button" onClick={toggle}>
                <FontAwesomeIcon icon={faBars} />
            </button>
            <div className="sidebar-content">
                Sidebar Content
            </div>
        </div>
    );
};

export default Sidebar;
