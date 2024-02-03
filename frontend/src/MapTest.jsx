import GoogleMapReact from 'google-map-react';
import React from 'react';

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export default function MapTest() {
    const defaultProps = {
        center: {
            lat: 45.501690,
            lng: -73.567253
        },
        zoom: 11
    };

    return (
        // Important! Always set the container height explicitly
        <div style={{ height: '100vh', width: '100%' }}>
            <GoogleMapReact
                bootstrapURLKeys={{ key: apiKey }}
                defaultCenter={defaultProps.center}
                defaultZoom={defaultProps.zoom}
            />
        </div>
    );
}