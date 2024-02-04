// Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <div>
                <h2>Welcome to our Google Maps App</h2>
                <p>Click <Link to="/map">here</Link> to view the map.</p>
            </div>
        </div>
    );
};

export default Home;
