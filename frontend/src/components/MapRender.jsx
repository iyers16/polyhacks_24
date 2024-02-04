import GoogleMapReact from 'google-map-react';
import React from 'react';

const MapRender = ({ center, zoom, onMapLoaded }) => {
    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <GoogleMapReact
                bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }} // Replace with your actual Google Maps API key
                defaultCenter={center}
                defaultZoom={zoom}
                yesIWantToUseGoogleMapApiInternals={true}
                onGoogleApiLoaded={({ map, maps }) => onMapLoaded({ map, maps })}
            >
                {/* Markers are managed directly in the MapPage component */}
            </GoogleMapReact>
        </div>
    );
};

export default MapRender;
