import React, { useEffect, useState } from 'react';
import Title from '../../components/owner/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // --- NEW IMPORT ---

const ManageBooking = () => {
  const { currency, axios } = useAppContext();
  const navigate = useNavigate(); // --- NEW: Get navigate function ---

  const [bookings, setBookings] = useState([]);

  const fetchOwnerBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings/owner');
      data.success ? setBookings(data.bookings) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changeBookingStatus = async (bookingId, status) => {
    try {
      const { data } = await axios.post('/api/bookings/change-status', {
        bookingId,
        status,
      });
      if (data.success) {
        toast.success(data.message);
        fetchOwnerBookings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  return (
    <div className='px-4 pt-10 md:px-10 w-full'>
      <Title
        title='Manage Bookings'
        SubTitle='Track all customer bookings, approve or cancel requests, and manage booking status'
      />

      <div className='max-w-4xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>
        <table className='w-full border-collapse text-left text-sm text-gray-600'>
          <thead className='text-gray-500'>
            <tr>
              <th className='p-3 font-medium'>Car</th>
              <th className='p-3 font-medium max-md:hidden'>Date Range</th>
              <th className='p-3 font-medium'>Total</th>
              <th className='p-3 font-medium'>Status</th> {/* <-- FIXED: Added '=' after className */}
              <th className='p-3 font-medium'>Tracking</th> {/* --- NEW COLUMN --- */}
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr
                key={index}
                className='border-t border-borderColor text-gray-500'
              >
                <td className='p-3 flex items-center gap-3'>
                  <img
                    src={booking.car.image}
                    alt=''
                    className='h-12 w-12 aspect-square rounded-md object-cover'
                  />
                  <p className='font-medium max-md:hidden'>
                    {booking.car.brand} {booking.car.model}
                  </p>
                </td>
                <td className='p-3 max-md:hidden'>
                  {booking.pickupDate.split('T')[0]} to{' '}
                  {booking.returnDate.split('T')[0]}
                </td>
                <td className='p-3'>
                  {currency}
                  {booking.price}
                </td>
                <td className='p-3'>
                  {booking.status === 'pending' ? (
                    <select
                      onChange={(e) =>
                        changeBookingStatus(booking._id, e.target.value)
                      }
                      value={booking.status}
                      className='px-2 py-1.5 mt-1 text-gray-500 border border-borderColor rounded-md outline-none'
                    >
                      <option value='pending'>Pending</option>
                      <option value='cancelled'>Cancelled</option>
                      <option value='confirmed'>Confirmed</option>
                    </select>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-500'
                          : 'bg-red-100 text-red-500'
                      }`}
                    >
                      {booking.status}
                    </span>
                  )}
                </td>
                {/* --- NEW TRACKING CELL --- */}
                <td className='p-3'>
                  {booking.status === 'confirmed' ? (
                    <button
                      onClick={() => navigate(`/track/view/${booking._id}`)}
                      className='px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200'
                    >
                      View Live Map
                    </button>
                  ) : (
                    <span className='text-xs text-gray-400'>N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBooking;