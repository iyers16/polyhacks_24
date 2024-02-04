import GoogleMapReact from 'google-map-react';
import React, { useEffect, useState } from 'react';

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const placeOptions = [
    'atm', 'bank', 'bar', 'book_store', 'bus_station', 'cafe',
    'clothing_store', 'convenience_store', 'drugstore', 'gym',
    'hospital', 'laundry', 'library', 'lodging', 'park', 'pharmacy',
    'police', 'post_office', 'primary_school', 'restaurant', 'school',
    'secondary_school', 'shopping_mall', 'stadium', 'store',
    'subway_station', 'supermarket', 'train_station', 'transit_station',
    'university'
].map(type => ({ value: type, label: type.replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }));

export default function MapPage() {
    const [map, setMap] = useState(null);
    const [mapsApi, setMapsApi] = useState(null);
    const [checkedTypes, setCheckedTypes] = useState({});
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        const initialCheckedTypes = placeOptions.reduce((acc, option) => {
            acc[option.value] = false;
            return acc;
        }, {});
        setCheckedTypes(initialCheckedTypes);
    }, []);

    const handleCheckboxChange = (type) => {
        const updatedCheckedTypes = { ...checkedTypes, [type]: !checkedTypes[type] };
        setCheckedTypes(updatedCheckedTypes);

        // Optionally, immediately update marker visibility if markers are already placed
        updateMarkerVisibility(updatedCheckedTypes);
    };

    const updateMarkerVisibility = (updatedCheckedTypes) => {
        markers.forEach(marker => {
            marker.setVisible(updatedCheckedTypes[marker.customType]);
        });
    };

    const fetchPlacesAndPlaceMarkers = (type) => {
        if (!map || !mapsApi || !checkedTypes[type]) return;

        const service = new mapsApi.places.PlacesService(map);
        const request = {
            location: map.getCenter(),
            radius: '5000',
            type: type
        };

        service.nearbySearch(request, (results, status) => {
            if (status === mapsApi.places.PlacesServiceStatus.OK) {
                const newMarkers = results.map(place => {
                    const marker = new mapsApi.Marker({
                        position: place.geometry.location,
                        map,
                        title: place.name,
                        visible: checkedTypes[type], // Use checked state to set visibility
                        customType: type // Custom attribute to manage visibility later
                    });
                    return marker;
                });
                setMarkers(prevMarkers => [...prevMarkers, ...newMarkers]);
            }
        });
    };

    useEffect(() => {
        // Clear previous markers when type selection changes
        markers.forEach(marker => marker.setMap(null));
        setMarkers([]);

        // Fetch and place new markers for each selected type
        Object.keys(checkedTypes).forEach(type => {
            if (checkedTypes[type]) fetchPlacesAndPlaceMarkers(type);
        });

    }, [checkedTypes, map, mapsApi]);

    return (
        <div style={{ height: '100vh', display: 'flex', width: '100%' }}>
            <div style={{ width: '300px', overflowY: 'auto', padding: '20px' }}>
                {placeOptions.map(option => (
                    <div key={option.value}>
                        <input
                            type="checkbox"
                            id={option.value}
                            checked={checkedTypes[option.value] || false}
                            onChange={() => handleCheckboxChange(option.value)}
                        />
                        <label htmlFor={option.value}>{option.label}</label>
                    </div>
                ))}
            </div>
            <div style={{ flex: 1 }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: apiKey, libraries: 'places' }}
                    defaultCenter={{
                        lat: 45.501690,
                        lng: -73.567253
                    }}
                    defaultZoom={11}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={({ map, maps }) => {
                        setMap(map);
                        setMapsApi(maps);
                    }}
                />
            </div>
        </div>
    );
}
