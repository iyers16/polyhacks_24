import GoogleMapReact from 'google-map-react';
import React, { useRef, useState } from 'react';

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export default function MapTest() {
    const [map, setMap] = useState(null);
    const [maps, setMaps] = useState(null);
    const autocompleteInput = useRef(null);

    const defaultProps = {
        center: {
            lat: 45.501690,
            lng: -73.567253
        },
        zoom: 11
    };


    const placeTypes = [
        'atm', 'bank', 'bar',
        'book_store', 'bus_station', 'cafe',
        'clothing_store', 'convenience_store',
        'drugstore',
        'gym',
        'hospital', 'laundry', 'library',
        'lodging', 'park',
        'pharmacy', 'police', 'post_office', 'primary_school',
        'restaurant', 'school', 'secondary_school', 'shopping_mall',
        'stadium', 'store', 'subway_station', 'supermarket', 'train_station', 'transit_station', 'university'
    ];

    const fetchPlaces = (map, maps, type) => {
        return new Promise((resolve, reject) => {
            let allResults = [];
            const service = new maps.places.PlacesService(map);
            const request = {
                location: new maps.LatLng(defaultProps.center.lat, defaultProps.center.lng),
                radius: '10000',
                type: [type]
            };

            const fetch = (request, resolve, reject, count = 0) => {
                service.nearbySearch(request, (results, status, pagination) => {
                    if (status === maps.places.PlacesServiceStatus.OK) {
                        allResults = allResults.concat(results);
                        if (pagination && pagination.hasNextPage && count < 3) { // 3 because we start from 0, so 0-3 equals 4 requests
                            pagination.nextPage();
                            fetch(request, resolve, reject, count + 1);
                        } else {
                            resolve({ type, results: allResults });
                        }
                    } else {
                        reject(`Failed to fetch ${type} data: ${status}`);
                    }
                });
            };

            fetch(request, resolve, reject);
        });
    };

    const handleApiLoaded = (map, maps) => {
        setMap(map);
        setMaps(maps);

        // Initialize the Autocomplete
        const autocomplete = new maps.places.Autocomplete(autocompleteInput.current);
        autocomplete.bindTo('bounds', map);

        // Add listener for the place_changed event on autocomplete
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            const bounds = new maps.LatLngBounds();
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
            map.fitBounds(bounds);
        });

        Promise.all(placeTypes.map(type => fetchPlaces(map, maps, type)))
            .then(results => {
                const placesObject = results.reduce((acc, { type, results }) => {
                    acc[type] = results;
                    results.forEach(place => {
                        if (type === 'drugstore' || type === 'hospital' || type === 'pharmacy') {
                            new maps.Marker({
                                position: place.geometry.location,
                                map,
                                title: place.name,
                                icon: {
                                    url: 'http://maps.gstatic.com/mapfiles/ms2/micons/pink-dot.png'
                                }
                            });
                        }
                        else if (type === 'school' || type === 'primary_school' || type === 'secondary_school' || type === 'university' || type === 'library') {
                            new maps.Marker({
                                position: place.geometry.location,
                                map,
                                title: place.name,
                                icon: {
                                    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                                }
                            });
                        }
                        else if (type === 'clothing_store' || type === 'book_store' || type === 'shopping_mall' || type === 'store' || type === 'supermarket' || type === 'convenience_store') {
                            new maps.Marker({
                                position: place.geometry.location,
                                map,
                                title: place.name,
                                icon: {
                                    url: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png'
                                }
                            });
                        }
                        else if (type === 'atm' || type === 'bank') {
                            new maps.Marker({
                                position: place.geometry.location,
                                map,
                                title: place.name,
                                icon: {
                                    url: 'http://maps.gstatic.com/mapfiles/ms2/micons/lightblue.png'
                                }
                            });
                        }
                        else if (type === 'bus_station' || type === 'subway_station' || type === 'train_station' || type === 'transit_station') {
                            new maps.Marker({
                                position: place.geometry.location,
                                map,
                                title: place.name,
                                icon: {
                                    url: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png'
                                }
                            });
                        }
                        else if (type === 'cafe' || type === 'restaurant' || type === 'bar') {
                            new maps.Marker({
                                position: place.geometry.location,
                                map,
                                title: place.name,
                                icon: {
                                    url: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
                                }
                            });
                        }
                        else if (type === 'park' || type === 'gym' || type === 'laundry' || type === 'lodging' || type === 'police' || type === 'post_office' || type === 'stadium') {
                            new maps.Marker({
                                position: place.geometry.location,
                                map,
                                title: place.name,
                                icon: {
                                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                                }
                            })
                        }
                        else {
                            new maps.Marker({
                                position: place.geometry.location,
                                map,
                                title: place.name
                            });
                        }


                    });
                    return acc;
                }, {});

                console.log(placesObject);
            })
            .catch(error => console.error(error));
    };


    return (
        <div style={{ height: '100vh', width: '100%' }}>
            {/* Enhanced Search Bar */}
            <input
                ref={autocompleteInput}
                type="text"
                placeholder="Enter a location"
                style={{
                    width: '300px',
                    height: '40px',
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: '5',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '20px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    fontSize: '16px',
                    outline: 'none'
                }}
            />

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