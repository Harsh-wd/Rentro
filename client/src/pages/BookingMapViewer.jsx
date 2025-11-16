import React, { useEffect, useState, useRef } from 'react';
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


const BookingMapViewer = () => {
  const { bookingId } = useParams();
  const { socket, axios, user, navigate } = useAppContext();
  const [vehicleLocation, setVehicleLocation] = useState(null);
  const [status, setStatus] = useState('Connecting...');
  const mapRef = useRef(null);


  // Check authentication on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    if (!storedToken) {
      toast.error('Please log in to view the map.');
      navigate('/');
      return;
    }

    // If we have token, proceed - don't wait for socket/user
  }, []); // Run only once on mount


  // Fetch last location and listen for updates
  useEffect(() => {
    // Only proceed if socket is ready
    if (!socket) {
      return;
    }

    // --- Part 1: Get Last Known Location ---
    const fetchLastLocation = async () => {
      try {
        const { data } = await axios.get(`/api/bookings/location/${bookingId}`);
        if (data.success) {
          const newLoc = {
            lat: data.location.latitude,
            lng: data.location.longitude,
          };
          setVehicleLocation(newLoc);
          setStatus('Last known location acquired.');
          if (mapRef.current) {
            mapRef.current.flyTo(newLoc, 16);
          }
        } else {
          setStatus('No location history found.');
        }
      } catch (err) {
        setStatus('Could not fetch location history.');
        console.error('Error fetching location:', err);
      }
    };
    
    fetchLastLocation();

    // --- Part 2: Listen for LIVE Updates ---
    socket.emit('join_booking_room', bookingId);
    setStatus('Connected to live tracking service.');

    socket.on('location_update', (location) => {
      setStatus('Live location received!');
      setVehicleLocation(location);
      if (mapRef.current) {
        mapRef.current.flyTo(location, mapRef.current.getZoom());
      }
    });

    // Cleanup
    return () => {
      if (socket) {
        socket.off('location_update');
      }
    };
  }, [socket, bookingId, axios]);


  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Live Vehicle Map</h2>
      <p style={{ textAlign: 'center', color: '#555' }}>
        Viewing live location for Booking ID: <strong>{bookingId}</strong>
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
        <MapContainer
          center={[26.9124, 75.7873]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {vehicleLocation ? (
            <Marker position={vehicleLocation}>
              <Popup>Vehicle's Live Location</Popup>
            </Marker>
          ) : (
            <></>
          )}
        </MapContainer>
      </div>
      <button
        onClick={() => navigate(-1)}
        style={{
          width: '100%',
          padding: '12px',
          marginTop: '1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        Go Back
      </button>
    </div>
  );
};


export default BookingMapViewer;