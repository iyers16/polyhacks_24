/* global google */

import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import GoogleMapReact from 'google-map-react';
import Select from 'react-select';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';



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

];
const mockOffers = [
    {
      lat: 45.5017, 
      lng: -73.5673,
      businessName: "PolyHacks Coffee",
      description: "Get a free croissant with any coffee purchase",
      code: "POLY",
    },
    {
      lat: 45.5087, 
      lng: -73.554,
      businessName: "Tea Sip",
      description: "Buy one, get one free on all tea varieties",
      code: "TEASIP",
    },
  ];

  const findNearbyOffers = () => {
  
    return mockOffers;
  };



export default function RoutePlanner() {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const autocompleteRef = useRef(null);
    const [map, setMap] = useState(null);
    const [mapsApi, setMapsApi] = useState(null);
    const [markers, setMarkers] = useState([]); 
    const [directionsRenderer, setDirectionsRenderer] = useState(null); 
    const [travelMode, setTravelMode] = useState('WALKING');
    const [selectedAmenityInfo, setSelectedAmenityInfo] = useState(null);
    const [error, setError] = useState(null);


    const getRatingStars = (rating) => {
        if (!rating || rating < 1) {
          return 'N/A';
        }
      
        const roundedRating = Math.round(rating);
        const starIcons = '★'.repeat(roundedRating);
        const emptyStars = '☆'.repeat(5 - roundedRating);
      
        return `${starIcons}${emptyStars}`;
      };
      

    const fetchAmenityDetails = async (placeId) => {
        if (!mapsApi) return;
      
        const placeService = new mapsApi.places.PlacesService(map);
      
        placeService.getDetails({ placeId, fields: ['name', 'formatted_address', 'rating', 'user_ratings_total', 'formatted_phone_number', 'website'] }, (result, status) => {
          if (status === mapsApi.places.PlacesServiceStatus.OK) {
            setSelectedAmenityInfo(result);
          } else {
            console.error(`Failed to fetch amenity details: ${status}`);
            setSelectedAmenityInfo(null);
          }
        });
      };
      


      

    


    useEffect(() => {
      
        markers.forEach(marker => marker.setMap(null));
        setMarkers([]);
      }, [selectedAmenities]);
    
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
    
      const createMarker = (placeResult, index) => {
        const labelText = `${index + 1}`;
        const marker = new mapsApi.Marker({
          position: placeResult.geometry.location,
          map: map,
          title: placeResult.name,
          label: {
            text: labelText,
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
          },
          icon: {
            path: mapsApi.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: '#4CAF50',
            fillOpacity: 1,
            strokeWeight: 2,
            labelOrigin: new mapsApi.Point(0, -15),
          },
        });
      
        let infoWindowContent = `<div><strong>${placeResult.name}</strong><br>${placeResult.vicinity}<br>Rating: ${getRatingStars(
          placeResult.rating
        )}<br>Open Now: ${placeResult.opening_hours && placeResult.opening_hours.open_now ? 'Yes' : 'No'}<br>`;
      
        if (placeResult.photos && placeResult.photos.length > 0) {
          const photo = placeResult.photos[0];
          const imgUrl = photo.getUrl({ maxWidth: 200, maxHeight: 200 });
          infoWindowContent += `<img src="${imgUrl}" alt="${placeResult.name}" style="max-width: 200px; max-height: 200px;" />`;
        }
      
        infoWindowContent += '</div>';
      
        const infoWindow = new mapsApi.InfoWindow({
          content: infoWindowContent,
        });
      
        marker.addListener('click', () => {
          fetchAmenityDetails(placeResult.place_id);
        });
      
        marker.addListener('mouseover', () => {
          infoWindow.open(map, marker);
        });
      
        marker.addListener('mouseout', () => {
          infoWindow.close();
        });
      
        setMarkers((prevMarkers) => [...prevMarkers, marker]);
      };
      
      
      

      const fetchPlacesAndDrawRoute = async () => {
        if (!mapsApi || !map || !currentLocation || selectedAmenities.length === 0) {
            Swal.fire({
                title: "Oops! You Forgot Something",
                text: "Please ensure you've selected where you want to go and set a current location.",
                icon: <FontAwesomeIcon icon={faExclamationCircle} color="red" />,
              });
            return;
          }
      
       
        if (directionsRenderer) {
          directionsRenderer.setDirections(null);
        }
      
        const service = new mapsApi.places.PlacesService(map);
        const directionsService = new mapsApi.DirectionsService();
        
        const renderer = directionsRenderer || new mapsApi.DirectionsRenderer({
          polylineOptions: {
            strokeColor: 'green',
            strokeOpacity: 0.8,
            strokeWeight: 6
          }
        });
        renderer.setMap(map);
        
        if (!directionsRenderer) {
          setDirectionsRenderer(renderer);
        }
      
        let allPlaces = [];
      
      
        for (const amenity of selectedAmenities) {
          const request = {
            location: currentLocation,
            radius: '1250', // Set the search radius
            type: amenity.value,
          };
      
         
          const results = await new Promise((resolve, reject) => {
            service.nearbySearch(request, (results, status) => {
              if (status === mapsApi.places.PlacesServiceStatus.OK) {
                resolve(results);
            } else {
                Swal.fire({
                  title: "Error",
                  text: "We couldn't calculate the route. There may be no available paths for the selected travel mode.",
                  icon: "error",
                });
              }

            });
          });
      
          allPlaces.push(...results);
        }
      
       
        allPlaces.sort((a, b) => {
          const distA = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(a.geometry.location.lat(), a.geometry.location.lng()),
            currentLocation
          );
          const distB = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(b.geometry.location.lat(), b.geometry.location.lng()),
            currentLocation
          );
          return distA - distB;
        });
      
        
        let waypoints = [];
        let placesDetails = [];
        allPlaces.forEach(place => {
          if (waypoints.length < selectedAmenities.length && !placesDetails.some(p => p.place_id === place.place_id)) {
            waypoints.push({
              location: place.geometry.location,
              stopover: true,
            });
            placesDetails.push(place);
          }
        });
      
        if (waypoints.length > 0) {
          
          const routeRequest = {
            origin: currentLocation,
            destination: waypoints[waypoints.length - 1].location,
            waypoints: waypoints.slice(0, -1),
            optimizeWaypoints: true,
            travelMode: mapsApi.TravelMode[travelMode],
          };
      
          directionsService.route(routeRequest, (result, status) => {
            if (status === 'OK') {
              renderer.setDirections(result);
          
            
              const totalDistance = result.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0) / 1000;
          
             
              const fuelConsumptionRate = 7; 
              const fuelSaved = (totalDistance * fuelConsumptionRate) / 100; 
          
             
              const stepsPerKm = 1250;
              const caloriesPerStep = 0.04; // For a 60kg individual
              const caloriesBurned = totalDistance * stepsPerKm * caloriesPerStep;
          
            
              Swal.fire({
                title: 'Great Job!',
                html: `<b>${totalDistance.toFixed(2)}</b> km covered<br>
                       <b>${fuelSaved.toFixed(2)}</b> liters of fuel saved<br>
                       <b>${caloriesBurned.toFixed(2)}</b> calories burned`,
                icon: 'success',
                confirmButtonText: 'See Offers',
              }).then(() => {
               
                const offers = findNearbyOffers(); 
                const offersHtml = offers.map(offer => `
                  <div><strong>${offer.businessName}</strong>: ${offer.description}
                  <br>Show this code for your discount: <strong>${offer.code}</strong></div>
                `).join('<br>');
          
               
                Swal.fire({
                  title: 'Exclusive Discounts for Sustainable Choices!',
                  html: offersHtml,
                  icon: 'info',
                  confirmButtonText: 'Awesome!',
                });
              });
            } else {
              Swal.fire('Oops...', "We couldn't calculate the route. There may be no available paths for the selected travel mode.", 'error');
            }
    });
    placesDetails.forEach((place, index) => createMarker(place, index));
  } else {
    alert("No places found within the specified radius. Try selecting different amenities or increasing the search radius.");
  }
};
      
      
      


      

      return (
        <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
           
          <div style={{
            position: 'relative',
            top: 0,
            width: '100%',
            padding: '20px',
            zIndex: 5,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <input
              ref={autocompleteRef}
              type="text"
              placeholder="Where Are You Now"
              style={{
                padding: '10px',
                width: '400px',
                margin: '0 10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          <label style={{ display: 'flex', alignItems: 'center', marginRight: '20px', fontSize: '16px' }}>
  <input
    type="radio"
    name="travelMode"
    value="WALKING"
    checked={travelMode === 'WALKING'}
    onChange={() => setTravelMode('WALKING')}
    style={{ display: 'none' }} 
  />
  <span style={{ position: 'relative', marginRight: '8px', width: '16px', height: '16px', border: '2px solid #4CAF50', borderRadius: '50%' }}>
    {travelMode === 'WALKING' && (
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '8px',
          height: '8px',
          backgroundColor: '#4CAF50',
          borderRadius: '50%',
          opacity: 1,
        }}
      ></span>
    )}
  </span>
  Walking
</label>
<label style={{ display: 'flex', alignItems: 'center', fontSize: '16px' }}>
  <input
    type="radio"
    name="travelMode"
    value="BICYCLING"
    checked={travelMode === 'BICYCLING'}
    onChange={() => setTravelMode('BICYCLING')}
    style={{ display: 'none' }} 
  />
  <span style={{ position: 'relative', marginRight: '8px', width: '16px', height: '16px', border: '2px solid #4CAF50', borderRadius: '50%' }}>
    {travelMode === 'BICYCLING' && (
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '8px',
          height: '8px',
          backgroundColor: '#4CAF50',
          borderRadius: '50%',
          opacity: 1,
        }}
      ></span>
    )}
  </span>
  Biking
</label>



            <Select
              isMulti
              options={placeOptions}
              onChange={handleAmenitiesChange}
              placeholder="Where do you need to go ?"
              closeMenuOnSelect={false}
              styles={{
                control: (base) => ({
                  ...base,
                  width: 300,
                  margin: '0 10px',
                }),
                container: (base) => ({
                  ...base,
                  width: '100%'
                })
              }}
            />
            <button onClick={fetchPlacesAndDrawRoute} style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              margin: '0 10px',
              fontSize: '16px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
            }}>
              Let Me Lead You
            </button>
          </div>
          <div style={{ height: '100%', width: '100%' }}>
            <GoogleMapReact
              bootstrapURLKeys={{ key: apiKey, libraries: 'places' }}
              defaultCenter={{ lat: 45.5017, lng: -73.5673 }} 
              defaultZoom={14}
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
