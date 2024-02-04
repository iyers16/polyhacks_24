// MapPage.jsx
import React, { useState } from 'react';
// import Map from './Map';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Sidebar from '../components/SideBar';

const MapPage = () => {
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    return (
        <div>
            <Sidebar visible={sidebarVisible} toggle={toggleSidebar} />
            <button className="toggle-button" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={faBars} />
            </button>
            {/* <Map /> */}
        </div>
    );
};

export default MapPage;
