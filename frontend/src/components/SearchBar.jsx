import React, { useRef, useEffect, useState } from 'react';

function SearchBar({ onPlaceSelected }) {
  const [autocomplete, setAutocomplete] = useState(null);
  const autocompleteInput = useRef(null);

  useEffect(() => {
    const loadGoogleMapsScript = (callback) => {
      if (window.google) {
        callback();
        return;
      }
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      document.head.append(script);
      script.onload = () => {
        callback();
      };
    };

    loadGoogleMapsScript(() => {
      setAutocomplete(new window.google.maps.places.Autocomplete(autocompleteInput.current));
    });
  }, []);

  useEffect(() => {
    if (!autocomplete) return;

    const placeChangedListener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        onPlaceSelected(place);
      } else {
        console.log("Returned place contains no geometry");
      }
    });

    return () => {
      window.google.maps.event.removeListener(placeChangedListener);
    };
  }, [autocomplete, onPlaceSelected]);

  return (
    <input
      ref={autocompleteInput}
      type="text"
      placeholder="Enter a location"
      style={{
        width: '500px',
        height: '40px',

        zIndex: '5',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '20px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        fontSize: '16px',
        outline: 'none',
      }}
    />
  );
}

export default SearchBar;
