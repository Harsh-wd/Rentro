import React from 'react';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import { Route, Routes, useLocation } from 'react-router-dom';
import CarDetails from './pages/CarDetails';
import Cars from './pages/Cars';
import MyBookings from './pages/MyBookings';
import Home from './pages/Home';
import Footer from './components/Footer';
import Layout from './pages/owner/Layout';
import Dashboard from './pages/owner/Dashboard';
import AddCar from './pages/owner/AddCar';
import ManageCars from './pages/owner/ManageCars';
import ManageBooking from './pages/owner/ManageBooking';
import Login from './components/Login';
import { Toaster } from 'react-hot-toast';
import { useAppContext } from './context/AppContext';

// --- NEW IMPORTS ---
import ActiveTripTracker from './pages/ActiveTripTracker'; // The renter's tracking page
import BookingMapViewer from './pages/BookingMapViewer'; // The owner's viewing page
// -------------------

const App = () => {
  const { showLogin } = useAppContext();
  const isOwnerPath = useLocation().pathname.startsWith('/owner');
  const isTrackingPath = useLocation().pathname.startsWith('/track'); // New check for tracking pages

  return (
    <>
      <Loader />
      <Toaster />
      {showLogin && <Login />}

      {/* Hide Navbar and Footer on owner AND tracking pages */}
      {!isOwnerPath && !isTrackingPath && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/car-details/:id' element={<CarDetails />} />
        <Route path='/cars' element={<Cars />} />
        <Route path='/my-bookings' element={<MyBookings />} />

        {/* Owner Routes */}
        <Route path='/owner' element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path='add-car' element={<AddCar />} />
          <Route path='manage-cars' element={<ManageCars />} />
          <Route path='manage-bookings' element={<ManageBooking />} />
        </Route>

        {/* --- NEW TRACKING ROUTES --- */}
        {/* Page for the RENTER to share their location */}
        <Route
          path='/track/trip/:bookingId'
          element={<ActiveTripTracker />}
        />
        {/* Page for the OWNER (or Renter) to watch the location */}
        <Route
          path='/track/view/:bookingId'
          element={<BookingMapViewer />}
        />
        {/* ------------------------- */}
      </Routes>

      {!isOwnerPath && !isTrackingPath && <Footer />}
    </>
  );
};

export default App;