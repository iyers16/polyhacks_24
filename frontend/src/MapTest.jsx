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

    const placeTypes = [
        'accounting', 'airport', 'amusement_park', 'aquarium', 'art_gallery', 'atm', 'bakery', 'bank', 'bar', 'beauty_salon',
        'bicycle_store', 'book_store', 'bowling_alley', 'bus_station', 'cafe', 'campground', 'car_dealer', 'car_rental',
        'car_repair', 'car_wash', 'casino', 'cemetery', 'church', 'city_hall', 'clothing_store', 'convenience_store',
        'courthouse', 'dentist', 'department_store', 'doctor', 'drugstore', 'electrician', 'electronics_store', 'embassy',
        'fire_station', 'florist', 'funeral_home', 'furniture_store', 'gas_station', 'gym', 'hair_care', 'hardware_store',
        'hindu_temple', 'home_goods_store', 'hospital', 'insurance_agency', 'jewelry_store', 'laundry', 'lawyer', 'library',
        'light_rail_station', 'liquor_store', 'local_government_office', 'locksmith', 'lodging', 'meal_delivery', 'meal_takeaway',
        'mosque', 'movie_rental', 'movie_theater', 'moving_company', 'museum', 'night_club', 'painter', 'park', 'parking',
        'pet_store', 'pharmacy', 'physiotherapist', 'plumber', 'police', 'post_office', 'primary_school', 'real_estate_agency',
        'restaurant', 'roofing_contractor', 'rv_park', 'school', 'secondary_school', 'shoe_store', 'shopping_mall', 'spa',
        'stadium', 'storage', 'store', 'subway_station', 'supermarket', 'synagogue', 'taxi_stand', 'tourist_attraction',
        'train_station', 'transit_station', 'travel_agency', 'university', 'veterinary_care', 'zoo'
    ];

    // Fetch places for each place type and generate a JSON file for each type
    placeTypes.forEach(placeType => {
        fetchPlaces(map, maps, placeType);
    });

    

    const fetchPlaces = (map, maps, type, nextPageToken = null, pagesLeft = 4, allResults = []) => {
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
                allResults.push(...results); // Append new results to the existing array

                if (pagination && pagination.hasNextPage && pagesLeft > 0) {
                    // Decrement the pagesLeft counter
                    pagesLeft--;

                    // Wait a short time before making the next paginated request to avoid hitting query limits
                    setTimeout(() => fetchPlaces(map, maps, type, pagination.nextPage(), pagesLeft, allResults), 2000);
                } else {
                    // Dump the entire results array to a JSON file when pagination is done
                    dumpArrayToJSON(allResults, `${type}.json`);
                }
            } else {
                console.error(`Failed to fetch ${type} data: ${status}`);
            }
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
