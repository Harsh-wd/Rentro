import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom'; // --- NEW IMPORT ---

const MyBookings = () => {
  // --- ADDED 'navigate' ---
  const { axios, user, currency, navigate } = useAppContext();
  const [bookings, setBookings] = useState([]);

  const fetchMyBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings/user');
      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyBookings();
    }
  }, [user]);

  // --- NEW: Ask for location permission on page load ---
  useEffect(() => {
    // This will trigger the browser's "Allow/Block" location pop-up
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // We don't need to do anything with the position,
          // just successfully get permission.
          console.log('Location permission granted.');
        },
        (error) => {
          // User denied permission. They will be asked again
          // when they click "Start Trip".
          console.warn('Location permission denied on load:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []); // Empty array ensures this runs only ONCE

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} // Fixed typo: intitial -> initial
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-7xl mb-12'
    >
      <Title
        title='My Bookings'
        SubTitle='View and manage your all car bookings'
        align='left'
      />

      <div>
        {bookings.length > 0 ? (
          bookings.map((booking, index) => {
            // --- NEW: Logic to check if a trip is active ---
            const now = new Date();
            const pickup = new Date(booking.pickupDate);
            const returnDate = new Date(booking.returnDate);
            // Trip is active if status is 'confirmed' AND current time is between pickup/return
            const isTripActive =
              booking.status === 'confirmed' &&
              now >= pickup &&
              now <= returnDate;
            // ----------------------------------------------

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }} // Fixed typo: intitial -> initial
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                key={booking._id}
                className='grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12'
              >
                {/* car image + info */}
                <div className='md:col-span-1'>
                  <div className='rounded-md overflow-hidden mb-3'>
                    <img
                      src={booking.car.image}
                      alt=''
                      className='w-full h-auto aspect-video object-cover'
                    />
                  </div>
                  <p className='text-lg font-medium mt-2'>
                    {booking.car.brand} {booking.car.model}
                  </p>
                  <p className='text-gray-500'>
                    {booking.car.year}.{booking.car.category}.
                    {booking.car.location}
                  </p>
                </div>

                {/* booking info */}
                <div className='md:col-span-2'>
                  <div className='flex items-center gap-2'>
                    <p className='px-3 py-1.5 bg-light rounded'>
                      {' '}
                      Booking #{index + 1}{' '}
                    </p>
                    <p
                      className={`px-3 py-1 text-xs rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-green-400/15 text-green-600'
                          : 'bg-red-400/15 text-red-600'
                      }`}
                    >
                      {' '}
                      {booking.status}
                    </p>
                  </div>

                  <div className='flex items-start gap-2 mt-3'>
                    <img
                      src={assets.location_icon_colored}
                      alt=''
                      className='w-4 h-4 mt-1'
                    />
                    <div>
                      <p className='text-gray-500'>Pick-up Location</p>
                      <p>{booking.car.location} </p>
                    </div>
                  </div>
                </div>

                {/* Price & --- NEW ACTIONS --- */}
                <div className='md:col-span-1 flex flex-col justify-between gap-6'>
                  <div className='text-sm text-gray-500 text-right'>
                    <p> Total Price</p>
                    <h1 className='text-2xl font-semibold text-primary'>
                      {currency}
                      {booking.price}
                    </h1>
                    <p>Booked on {booking.createdAt.split('T')[0]}</p>
                  </div>

                  {/* --- NEW BUTTONS --- */}
                  <div className='flex flex-col gap-2'>
                    {/* "Start Trip" button shows ONLY if trip is active */}
                    {isTripActive && (
                      <button
                        onClick={() =>
                          navigate(`/track/trip/${booking._id}`)
                        }
                        className='w-full text-center p-2 rounded-md font-semibold text-sm bg-green-500 text-white hover:bg-green-600'
                      >
                        Start Trip & Share Location
                      </button>
                    )}

                    {/* "View Map" button shows on all confirmed bookings */}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() =>
                          navigate(`/track/view/${booking._id}`)
                        }
                        className='w-full text-center p-2 rounded-md font-semibold text-sm bg-gray-200 text-gray-800 hover:bg-gray-300'
                      >
                        View Live Map
                      </button>
                    )}
                  </div>
                  {/* ----------------- */}
                </div>
              </motion.div>
            );
          })
        ) : (
          <p className='text-center text-gray-500 mt-12'>
            You have no bookings.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default MyBookings;
