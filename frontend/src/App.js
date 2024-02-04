import React from "react";
import {
    Route,
    BrowserRouter as Router,
    Routes,
} from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Map from "./components/Map";
import RoutePlanner from "./components/RoutePlanner";
import { useNavigate } from 'react-router-dom';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/map" element={<Map />} />
                <Route path="/HeatMap" element={<RoutePlanner />} />
            </Routes>
        </Router>
    );
}

export default App;