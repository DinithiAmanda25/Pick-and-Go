// Components/Business-owner/Bookings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const BusinessOwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, getToken } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`/api/bookings/owner/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setBookings(response.data.bookings);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Error loading bookings data');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = getToken();
      const response = await axios.put(`/api/bookings/${bookingId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Update local state
        setBookings(bookings.map(booking => 
          booking._id === bookingId ? response.data.booking : booking
        ));
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Failed to update booking status');
    }
  };

  if (loading) return <div className="text-center py-8">Loading bookings...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Booking Management</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking Reference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rental Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {booking.bookingReference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {booking.clientId?.firstName} {booking.clientId?.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {booking.vehicleId?.make} {booking.vehicleId?.model}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(booking.rentalPeriod.startDate).toLocaleDateString()} - 
                  {new Date(booking.rentalPeriod.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${booking.pricing?.totalAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                        className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'rejected')}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button className="bg-blue-500 text-white px-3 py-1 rounded ml-2">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {bookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No bookings found
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessOwnerBookings;