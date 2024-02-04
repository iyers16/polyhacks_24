import GoogleMapReact from 'google-map-react';
import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import "./Map.css";

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const categories = {
    Healthcare: ['hospital', 'pharmacy', 'clinic'],
    Education: ['primary_school', 'school', 'university', 'library'],
    Food: ['restaurant', 'cafe', 'bakery', 'bar'],
    Shopping: ['clothing_store', 'convenience_store', 'book_store', 'shopping_mall', 'store', 'supermarket'],
    Transportation: ['bus_station', 'subway_station', 'train_station'],
    Finance: ['atm', 'bank'],
    Openair: ['park', 'stadium'],
    Other: ['gym', 'laundry', 'lodging', 'police', 'post_office']
};

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
    const [openDropdown, setOpenDropdown] = useState(null);
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [autocomplete, setAutocomplete] = useState(null);
    const autocompleteInput = useRef(null);

    // Function to initialize the Autocomplete
    useEffect(() => {
        if (mapsApi && !autocomplete) {
            setAutocomplete(
                new mapsApi.places.Autocomplete(autocompleteInput.current)
            );
        }
    }, [mapsApi, autocomplete]);

    // Add a listener to the Autocomplete component
    useEffect(() => {
        if (autocomplete) {
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.geometry) {
                    map.setCenter(place.geometry.location);
                    map.setZoom(17); // Zoom in to the location

                    // Send the POST request to the API
                    // const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
                    const url = 'https://airquality.googleapis.com/v1/currentConditions:lookup';

                    // Define the request body
                    const requestBody = {
                        location: {
                            latitude: place.geometry.location.lat(),
                            longitude: place.geometry.location.lng(),
                        },
                    };

                    // Make the POST request
                    fetch(`${url}?key=${apiKey}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody),
                    })
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then((data) => {
                            // Handle the response data here
                            console.log('Response data:', data);

                            // Display the response data in the Swal component
                            Swal.fire({
                                icon: 'success',
                                title: 'Here are some analytics about your location...',
                                // text: `You have been moved to ${place.name}`,
                                html: `
                                    AQI: ${data["indexes"][0]["aqi"]}
                                    <br>
                                    Quality: ${data["indexes"][0]["category"]}


                                    `, // Display response data in the Swal modal
                            });
                        })
                        .catch((error) => {
                            // Handle any errors that occurred during the fetch
                            console.error('Fetch error:', error);
                        });
                }

            });
        }
    }, [autocomplete, map]);

    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    const toggleDropdown = (category) => {
        setOpenDropdown(openDropdown === category ? '' : category);
    }

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
            radius: '10000',
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
            <button className="hamburger" onClick={toggleSidebar}>
                &#9776; {/* Unicode for hamburger icon */}
            </button>
            <div className={`sidebar ${sidebarVisible ? '' : 'hidden'}`}>
                {Object.keys(categories).map(category => (
                    <div key={category}>
                        <div className="category-header" onClick={() => toggleDropdown(category)}>
                            {category}
                        </div>
                        <div className={`dropdown-content ${openDropdown === category ? 'show' : ''}`}>
                            {categories[category].map(type => {
                                const option = placeOptions.find(o => o.value === type);
                                return option ? (
                                    <div key={option.value} className="filter-option">
                                        <input
                                            type="checkbox"
                                            id={option.value}
                                            checked={checkedTypes[option.value]}
                                            onChange={() => handleCheckboxChange(option.value)}
                                        />
                                        <label htmlFor={option.value}>{option.label}</label>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ flex: 1 }}>
                <input
                    ref={autocompleteInput}
                    type="text"
                    placeholder="Search for location"
                    style={{
                        position: 'absolute',
                        width: '400px',
                        top: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: '5',
                        padding: '12px', 
                        borderRadius: '20px', 
                        border: '2px solid #4CAF50', 
                        fontSize: '18px', 
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)' 
                      }}
                />
                <GoogleMapReact
                    bootstrapURLKeys={{ key: apiKey, libraries: 'places' }}
                    defaultCenter={{
                        lat: 45.501690,
                        lng: -73.567253
                    }}
                    defaultZoom={12}
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
