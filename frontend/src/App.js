import React from 'react';
import Sidebar from './Components/Sidebar';
import Map from './Map';
import './App.css';

function App() {
  return (
    <div className="App">
     
      <div className="sidebar-container">
        <Sidebar />
      </div>
      <div className="map-container">
        <Map />
      </div>
    </div>
  );
}

export default App;
