import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';


// Fix for Leaflet's default icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;
// End of icon fix


const ActiveTripTracker = () => {
  const { bookingId } = useParams();
  const { socket, axios, user, navigate, token, fetchUser } = useAppContext();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [status, setStatus] = useState('Initializing tracker...');
  const [isInitialized, setIsInitialized] = useState(false); // --- NEW: Track if we've checked auth ---
  const watchIdRef = useRef(null);


  // --- NEW: Check authentication on mount ---
  useEffect(() => {
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem('token');
    
    if (!storedToken) {
      // User is NOT logged in
      toast.error('Please log in to start tracking.');
      navigate('/');
      return;
    }

    // If user data hasn't been fetched yet, fetch it
    if (!user && storedToken) {
      fetchUser();
    }

    // Mark as initialized so we don't redirect again
    setIsInitialized(true);
  }, []);


  // --- MAIN: Start tracking only after auth is confirmed ---
  useEffect(() => {
    // Don't start tracking until:
    // 1. Auth is confirmed (isInitialized = true)
    // 2. Socket is connected
    // 3. User data is loaded
    if (!isInitialized || !socket || !user) {
      return;
    }

    // 1. Connect to the WebSocket room for this booking
    socket.emit('join_booking_room', bookingId);
    setStatus('Joined tracking room...');

    // 2. Start watching the user's GPS position
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };

          // Update this component's local map
          setCurrentLocation(newLocation);
          setStatus('Live location acquired.');

          // 3. Send the new location to the server via WebSocket
          socket.emit('update_location', {
            bookingId: bookingId,
            location: newLocation,
          });

          // 4. Also save the location to the database (in case owner is not online)
          axios.post('/api/bookings/location', {
            bookingId: bookingId,
            latitude: latitude,
            longitude: longitude,
          }).catch(err => {
            console.error('Failed to save location:', err);
          });
        },
        (error) => {
          console.error('GPS Error:', error);
          setStatus(`GPS Error: ${error.message}`);
          toast.error(`GPS Error: ${error.message}`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setStatus('Geolocation is not supported by this device.');
      toast.error('Geolocation is not supported by this device.');
    }

    // Cleanup: Stop watching GPS when component closes
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isInitialized, socket, user, bookingId, axios]);


  // --- NEW: Show loading state while checking authentication ---
  if (!isInitialized) {
    return (
      <div style={{ padding: '1rem', maxWidth: '800px', margin: 'auto', textAlign: 'center', marginTop: '2rem' }}>
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Live Trip Tracker</h2>
      <p style={{ textAlign: 'center', color: '#555' }}>
        You are sharing your location for Booking ID: <strong>{bookingId}</strong>
      </p>
      <p style={{ textAlign: 'center', fontWeight: 'bold', color: '#007bff' }}>
        Status: {status}
      </p>
      <div style={{ 
        border: '2px solid #ddd', 
        borderRadius: '8px', 
        overflow: 'hidden', 
        height: '60vh', 
        minHeight: '400px',
        backgroundColor: '#f9f9f9' 
      }}>
        {currentLocation ? (
          <MapContainer
            center={currentLocation}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={currentLocation}>
              <Popup>Your Current Location</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#777' }}>
            <p>Acquiring GPS signal... Please ensure location is enabled.</p>
          </div>
        )}
      </div>
      <button
        onClick={() => navigate('/my-bookings')}
        style={{
          width: '100%',
          padding: '12px',
          marginTop: '1rem',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        Stop Tracking & Go to My Bookings
      </button>
    </div>
  );
};


export default ActiveTripTracker;