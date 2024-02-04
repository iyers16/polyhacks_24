import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./Home.css";

import NavBar from "../components/NavBar"; 
import Map from "../components/Map"; 

const Home = () => {
    const navigate = useNavigate();
    const goToMap = () => {
        navigate('/map'); // Navigate to the Map component
    };
    

   
    return (
        <div className="homepage">
            <NavBar />
            <div className="text">
                <h1>WELCOME TO OUR WALKABLE 15-MINUTE CITY </h1>
                <p>Discover Montreal with our revolutionary 15-minute all inclusive map.</p>
            </div>
            <div className="search-container">
            <button onClick={goToMap} className="go-to-map-btn">Go to Map</button>
            </div>
        </div>
    );
};

export default Home;
