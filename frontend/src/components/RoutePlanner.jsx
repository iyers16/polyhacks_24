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

];


export default function RoutePlanner() {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const autocompleteRef = useRef(null);
    const [map, setMap] = useState(null);
    const [mapsApi, setMapsApi] = useState(null);
    const [markers, setMarkers] = useState([]); 
    const [directionsRenderer, setDirectionsRenderer] = useState(null); 
    const [travelMode, setTravelMode] = useState('WALKING');


    useEffect(() => {
        // Clear previous markers from the map
        markers.forEach(marker => marker.setMap(null));
        setMarkers([]);
      }, [selectedAmenities]); // Dependency array includes selectedAmenities to clear markers when selection changes
    
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
        const labelText = `${index + 1}`; // Assuming index is the order number of your place
      
        const marker = new mapsApi.Marker({
          position: placeResult.geometry.location,
          map: map,
          title: placeResult.name,
          label: {
            text: labelText,
            color: 'white', // Text color
            fontSize: '14px', // Text size
            fontWeight: 'bold' // Text weight
          },
          icon: {
            // Custom styling for marker if needed
            path: mapsApi.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 5, // Size of the marker
            fillColor: '#4CAF50', // Marker color
            fillOpacity: 1,
            strokeWeight: 2,
            labelOrigin: new mapsApi.Point(0, -15) // Position the label above the marker
          }
        });
      
        const infoWindow = new mapsApi.InfoWindow({
          content: `<div><strong>${placeResult.name}</strong><br>${placeResult.vicinity}</div>`,
        });
      
        marker.addListener('mouseover', () => {
          infoWindow.open(map, marker);
        });
      
        marker.addListener('mouseout', () => {
          infoWindow.close();
        });
      
        setMarkers(prevMarkers => [...prevMarkers, marker]);
      };
      



      const fetchPlacesAndDrawRoute = async () => {
        if (!mapsApi || !map || !currentLocation || selectedAmenities.length === 0) {
          alert("Please ensure you've selected amenities and set a current location.");
          return;
        }
      
        // Clear previous directions if they exist
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
      
        let waypoints = [];
        let placesDetails = []; // To store details of fetched places
      
        for (const amenity of selectedAmenities) {
          const request = {
            location: currentLocation,
            radius: '1250', // Set the search radius
            type: amenity.value,
          };
      
          // Search for places
          const results = await new Promise((resolve, reject) => {
            service.nearbySearch(request, (results, status) => {
              if (status === mapsApi.places.PlacesServiceStatus.OK) {
                resolve(results);
              } else {
                reject(new Error(`Failed to fetch places due to: ${status}`));
              }
            });
          });
      
          // Assuming you take the first result as the desired place
          if (results.length > 0) {
            const placeResult = results[0];
            placesDetails.push(placeResult);
            waypoints.push({
              location: placeResult.geometry.location,
              stopover: true,
            });
          }
        }
      
        if (waypoints.length > 0) {
          // Calculate the route through the waypoints
          const routeRequest = {
            origin: currentLocation,
            destination: waypoints[waypoints.length - 1].location,
            waypoints: waypoints.slice(0, -1),
            optimizeWaypoints: true,
            travelMode: mapsApi.TravelMode[travelMode],
          };
      
          directionsService.route(routeRequest, (result, status) => {
            if (status === 'OK') {
              const totalDuration = result.routes[0].legs.reduce((sum, leg) => sum + leg.duration.value, 0);
              if (totalDuration <= 1000) { 
                renderer.setDirections(result);
              } else {
                const proceed = window.confirm("The total travel time for the selected route exceeds 15 minutes. Would you like to proceed anyway?");
                if (proceed) {
                  renderer.setDirections(result);
                } else {
                  // Handle the case where the user chooses not to proceed
                }
              }
            } else {
              alert("We couldn't calculate the route. There may be no available paths for the selected travel mode.");
            }
          });
      
          // Create markers for each place
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
             <label>
    <input
      type="radio"
      name="travelMode"
      value="WALKING"
      checked={travelMode === 'WALKING'}
      onChange={() => setTravelMode('WALKING')}
    />
    Walking
  </label>
  <label>
    <input
      type="radio"
      name="travelMode"
      value="BICYCLING"
      checked={travelMode === 'BICYCLING'}
      onChange={() => setTravelMode('BICYCLING')}
    />
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
              defaultCenter={{ lat: 45.5017, lng: -73.5673 }} // Montreal's coordinates
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
