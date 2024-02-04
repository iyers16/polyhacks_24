import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from "../components/SearchBar";


const Home = () => {
    const navigate = useNavigate();

    const handlePlaceSelected = (place) => {
        // Logic to handle the selected place
        // For example, you might want to navigate to the MapPage with the selected place's details
        navigate('/map', { state: { selectedPlace: place } });
    };

    return (
        <div>
            <div>
                <h2>Welcome to our Google Maps App</h2>
                {/* Include the SearchBar component and handle the selected place */}
                <SearchBar onPlaceSelected={handlePlaceSelected} />
                <p>Click <Link to="/map">here</Link> to view the map.</p>
            </div>
        </div>
    );
};

export default Home;
