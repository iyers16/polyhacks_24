import GoogleMapReact from 'google-map-react';
import React, { useState } from 'react';

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export default function MapTest() {
    const [map, setMap] = useState(null);
    const [maps, setMaps] = useState(null);

    const defaultProps = {
        center: {
            lat: 45.501690,
            lng: -73.567253
        },
        zoom: 15
    };

    const placeTypes = ['stadium']; // Add more place types as needed

    const fetchPlaces = (map, maps, type) => {
        const service = new maps.places.PlacesService(map);
        const request = {
            location: new maps.LatLng(defaultProps.center.lat, defaultProps.center.lng),
            radius: '30000', // Adjust based on the desired radius
            type: placeTypes
        };

        service.nearbySearch(request, (results, status) => {
            if (status === maps.places.PlacesServiceStatus.OK) {
                console.log(results);

                console.log(`Found ${results.length} ${type}(s).`);
                createHeatmapLayer(map, maps, results);
            } else {
                console.error(`Failed to fetch ${type} data: ${status}`);
            }
        });
    };

    const createHeatmapLayer = (map, maps, places) => {
        const heatmapData = places.map(place => {
            return {
                location: new maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()),
                weight: 1 // Adjust weight as needed
            };
        });

        new maps.visualization.HeatmapLayer({
            data: heatmapData,
            map: map,
            radius: 25 // Adjust radius as needed
        });
    };

    const handleApiLoaded = (map, maps) => {
        setMap(map);
        setMaps(maps);
        placeTypes.forEach(type => fetchPlaces(map, maps, type));
    };

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <GoogleMapReact
                bootstrapURLKeys={{ key: apiKey, libraries: 'places,visualization' }}
                defaultCenter={defaultProps.center}
                defaultZoom={defaultProps.zoom}
                onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
                yesIWantToUseGoogleMapApiInternals
            />
        </div>
    );
}
