import React from "react";
import {
    Route,
    BrowserRouter as Router,
    Routes,
} from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/map" element={<MapPage />} />
            </Routes>
        </Router>
    );
}

export default App;