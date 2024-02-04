import GoogleMapReact from 'google-map-react';
import React, { useEffect, useState } from 'react';

const Marker = ({ text }) => (
    <div style={{
        color: '#fff',
        background: '#007bff',
        padding: '5px 10px',
        display: 'inline-flex',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '15px',
        transform: 'translate(-50%, -50%)',
    }}>
        {text}
    </div>
);

const MapComponent = () => {
    const [dataset, setDataset] = useState([]);
    const center = { lat: 45.5017, lng: -73.5673 }; // Montreal
    const zoom = 12;

    useEffect(() => {
        if (!window.google) {
            console.error("Google Maps API is not loaded.");
            return;
        }

        const map = new window.google.maps.Map(document.createElement("div"), {
            center,
            zoom,
        });

        fetchPlacesAndStoreInDataset(map);
    }, []);

    const fetchPlacesAndStoreInDataset = (map) => {
        const service = new window.google.maps.places.PlacesService(map);
        const types = [
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
        let promises = [];

        types.forEach(type => {
            const request = {
                location: center,
                radius: '20000', // 20km radius
                type: type
            };

            const promise = new Promise((resolve, reject) => {
                service.nearbySearch(request, (results, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                        resolve(results.map(place => ({
                            name: place.name,
                            type: type,
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng(),
                        })));
                    } else {
                        reject(status);
                    }
                });
            });

            promises.push(promise);
        });

        Promise.all(promises).then(results => {
            const flattenedResults = results.flat();
            setDataset(flattenedResults);
        }).catch(error => console.error('Error fetching places:', error));
    };

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <GoogleMapReact
                bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }} // Insert your API key here
                defaultCenter={center}
                defaultZoom={zoom}
                yesIWantToUseGoogleMapApiInternals
                onGoogleApiLoaded={({ map, maps }) => {
                    dataset.forEach(place => {
                        new maps.Marker({
                            position: { lat: place.lat, lng: place.lng },
                            map,
                            title: place.name.toUpperCase(),
                        });
                    });
                }}
            >
                {dataset.map((place, index) => (
                    <Marker key={index} lat={place.lat} lng={place.lng} text={place.type[0]} />
                ))}
            </GoogleMapReact>
        </div>
    );
};

export default MapComponent;
