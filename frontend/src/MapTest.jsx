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
        zoom: 11
    };

    function dumpArrayToJSON(array, filename) {
        const json = JSON.stringify(array, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

    const placeTypes = ['park']; // Specify the types of places you're interested in

    const fetchPlaces = (map, maps, type, nextPageToken = null, pagesLeft = 4) => {
        const service = new maps.places.PlacesService(map);
        const request = nextPageToken ? 
            { pagetoken: nextPageToken } : 
            {
                location: new maps.LatLng(defaultProps.center.lat, defaultProps.center.lng),
                radius: '10000',
                type: [type]
            };
    
        service.nearbySearch(request, (results, status, pagination) => {
            if (status === maps.places.PlacesServiceStatus.OK) {
                createHeatmapLayer(map, maps, results, true); // Append new results

                if (pagination && pagination.hasNextPage && pagesLeft > 0) {
                    // Decrement the pagesLeft counter
                    pagesLeft--;
    
                    // Wait a short time before making the next paginated request to avoid hitting query limits
                    setTimeout(() => fetchPlaces(map, maps, type, pagination.nextPage(), pagesLeft), 2000);
                }
            } else {
                console.error(`Failed to fetch ${type} data: ${status}`);
            }
            dumpArrayToJSON(results, "data.json")
           
           
        });
    };

   
    

    const createHeatmapLayer = (map, maps, places) => {
        const heatmapData = places.map(place => ({
            location: new maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()),
            weight: 1 // Adjust weight as needed
        }));

        new maps.visualization.HeatmapLayer({
            data: heatmapData,
            map: map,
            radius: 30, // Adjust based on zoom level or screen size
            opacity: 0.6, // Adjust for visual clarity
        });
    };

    const handleApiLoaded = (map, maps) => {
        setMap(map);
        setMaps(maps);
        placeTypes.forEach(type => fetchPlaces(map, maps, type)); // Fetch places once when the API is loaded
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
