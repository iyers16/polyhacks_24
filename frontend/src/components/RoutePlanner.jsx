import React, { useState, useEffect, useRef } from 'react';
import GoogleMapReact from 'google-map-react';
import Select from 'react-select';

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const placeOptions = [
    { value: 'atm', label: 'ATM' },
    { value: 'bank', label: 'Bank' },
    { value: 'bar', label: 'Bar' },
    { value: 'book_store', label: 'Book Store' },
    { value: 'bus_station', label: 'Bus Station' },
    { value: 'cafe', label: 'Cafe' },
    { value: 'clothing_store', label: 'Clothing Store' },
    { value: 'convenience_store', label: 'Convenience Store' },
    { value: 'drugstore', label: 'Drugstore' },
    { value: 'gym', label: 'Gym' },
    { value: 'hospital', label: 'Hospital' },
    { value: 'laundry', label: 'Laundry' },
    { value: 'library', label: 'Library' },
    { value: 'lodging', label: 'Lodging' },
    { value: 'park', label: 'Park' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'police', label: 'Police' },
    { value: 'post_office', label: 'Post Office' },
    { value: 'primary_school', label: 'Primary School' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'school', label: 'School' },
    { value: 'secondary_school', label: 'Secondary School' },
    { value: 'shopping_mall', label: 'Shopping Mall' },
    { value: 'stadium', label: 'Stadium' },
    { value: 'store', label: 'Store' },
    { value: 'subway_station', label: 'Subway Station' },
    { value: 'supermarket', label: 'Supermarket' },
    { value: 'train_station', label: 'Train Station' },
    { value: 'transit_station', label: 'Transit Station' },
    { value: 'university', label: 'University' }
    // Add other places as needed
];


export default function RoutePlanner() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const autocompleteRef = useRef(null);
  const [map, setMap] = useState(null);
  const [mapsApi, setMapsApi] = useState(null);

  useEffect(() => {
    if (mapsApi && map) {
      const autocomplete = new mapsApi.places.Autocomplete(autocompleteRef.current, { types: ['geocode'] });
      autocomplete.bindTo('bounds', map);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          setCurrentLocation(place.geometry.location);
          map.setCenter(place.geometry.location);
        }
      });
    }
  }, [mapsApi, map]);

  const handleAmenitiesChange = selectedOptions => {
    setSelectedAmenities(selectedOptions || []);
  };

  const fetchPlacesAndDrawRoute = async () => {
    if (!mapsApi || !map || !currentLocation || selectedAmenities.length === 0) return;

    const service = new mapsApi.places.PlacesService(map);
    const directionsService = new mapsApi.DirectionsService();
    const directionsRenderer = new mapsApi.DirectionsRenderer();
    directionsRenderer.setMap(map);

    let waypoints = [];
    let lastLocation = currentLocation;

    for (const [index, amenity] of selectedAmenities.entries()) {
      const results = await new Promise((resolve, reject) => {
        service.nearbySearch(
          {
            location: lastLocation,
            radius: 1000, // Adjust based on your criteria
            type: [amenity.value],
          },
          (results, status) => {
            if (status === mapsApi.places.PlacesServiceStatus.OK && results[0]) {
              resolve(results);
            } else {
              reject(status);
            }
          }
        );
      });

      if (results[0]) {
        const destination = results[0].geometry.location;

        // Add to waypoints if not the last item, otherwise set as destination
        if (index < selectedAmenities.length - 1) {
          waypoints.push({
            location: destination,
            stopover: true,
          });
        }

        lastLocation = destination; // Update lastLocation to the current destination
      }
    }

    // Calculate and draw the route
    directionsService.route(
      {
        origin: currentLocation,
        destination: lastLocation,
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: mapsApi.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      }
    );
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <input
        ref={autocompleteRef}
        type="text"
        placeholder="Enter your current location"
        style={{ width: '300px', height: '40px', marginBottom: '10px' }}
      />
      <Select
        isMulti
        options={placeOptions}
        onChange={handleAmenitiesChange}
        placeholder="Select Amenities"
        closeMenuOnSelect={false}
      />
      <button onClick={fetchPlacesAndDrawRoute} style={{ marginTop: '10px' }}>
        Calculate Walking Route
      </button>
      <div style={{ height: '90%', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: apiKey, libraries: 'places' }}
          defaultCenter={{ lat: 40.748817, lng: -73.985428 }} // Default to NYC, adjust as needed
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
