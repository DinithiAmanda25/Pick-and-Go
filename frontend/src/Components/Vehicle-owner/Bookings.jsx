import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import bookingService from '../../Services/bookingService';

const VehicleOwnerBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchVehicleOwnerBookings();
  }, [user, statusFilter, retryCount]);

  const fetchVehicleOwnerBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const ownerId = user._id || user.id;
      
      if (!ownerId) {
        setError('User ID not found');
        setLoading(false);
        return;
      }
      
      console.log('Fetching bookings for owner:', ownerId, 'with status:', statusFilter);
      
      // Use the booking service to fetch bookings for this vehicle owner
      const response = await bookingService.getVehicleOwnerBookings(
        ownerId, 
        statusFilter !== 'all' ? statusFilter : null
      );
      
      // Handle different response formats
      const bookingsData = response.bookings || response || [];
      setBookings(bookingsData);
      
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings. Please check your connection and try again.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Simplified component for testing - remove complex functionality until API works
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-500">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Vehicle Bookings</h2>
        
        {/* Status Filter */}
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-gray-600">Filter by status:</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="payment_pending">Payment Pending</option>
            <option value="paid">Paid</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={handleRetry}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
          >
            Retry
          </button>
        </div>
      )}

      {bookings.length === 0 && !error ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No bookings found for your vehicles.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {booking.vehicleId?.make} {booking.vehicleId?.model} ({booking.vehicleId?.year})
                  </h3>
                  <p className="text-gray-600">License Plate: {booking.vehicleId?.licensePlate}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Booking Reference</h4>
                  <p className="text-gray-800">{booking.bookingReference}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Client</h4>
                  <p className="text-gray-800">
                    {booking.clientId?.firstName} {booking.clientId?.lastName}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Rental Period</h4>
                  <p className="text-gray-800">
                    {new Date(booking.rentalPeriod.startDate).toLocaleDateString()} to {new Date(booking.rentalPeriod.endDate).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total Amount</h4>
                  <p className="text-gray-800">LKR {booking.pricing?.totalAmount?.toLocaleString()}</p>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                API is working! Found {bookings.length} booking(s)
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleOwnerBookings;