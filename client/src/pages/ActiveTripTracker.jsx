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
  const { socket, axios, user, navigate, token } = useAppContext();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [status, setStatus] = useState('Initializing tracker...');
  const watchIdRef = useRef(null);


  useEffect(() => {
    // Check if user has token in localStorage
    const storedToken = localStorage.getItem('token');
    
    // If NO token, redirect to home
    if (!storedToken) {
      toast.error('Please log in to start tracking.');
      navigate('/');
      return;
    }

    // If we have token, proceed with tracking
    // Don't wait for socket/user to load, they will connect in background
  }, []); // Empty dependency array - run only once on mount


  // Start GPS tracking when socket is ready
  useEffect(() => {
    // Only start if we have socket connection
    if (!socket) {
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

          setCurrentLocation(newLocation);
          setStatus('Live location acquired.');

          // Send location via Socket.io
          socket.emit('update_location', {
            bookingId: bookingId,
            location: newLocation,
          });

          // Also save to database (fallback if owner is offline)
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

    // Cleanup
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [socket, bookingId, axios]);


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