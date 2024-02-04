import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./Home.css"; // Import Home.css here
import SearchBar from "../components/SearchBar";
import NavBar from "../components/NavBar";




const Home = () => {
    const navigate = useNavigate();

    const handlePlaceSelected = (place) => {
        navigate('/map', { state: { selectedPlace: place } });
    };

    return (
        <div className="homepage">
            <NavBar /> {/* NavBar remains untouched */}
            <div className="text">
                <h1>WELCOME TO <br />OUR 15-MINUTE CITY HEATMAP</h1>
                <p>Discover Montreal with our revolutionary 15-minute heatmap.</p>
            </div>
            {/* Container div for SearchBar */}
            <div className="search-container">
                <SearchBar onPlaceSelected={handlePlaceSelected} />
            </div>
        </div>
    );
};



export default Home;
