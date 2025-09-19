import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Car, User, Phone, Download, Eye, X, Star, MessageCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Import your booking service - you'll need to create this
const bookingService = {
  getClientBookings: async (clientId, status = null) => {
    clientId = '68bb08dc25e12b1c5fbfa835';
    const baseURL = 'http://localhost:9000/api/bookings';
    const url = status ? `${baseURL}/client/${clientId}?status=${status}` : `${baseURL}/client/${clientId}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  updateBookingStatus: async (bookingId, status, data = {}) => {
    const response = await fetch(`http://localhost:9000/api/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...data })
    });
    if (!response.ok) throw new Error('Failed to update booking status');
    return response.json();
  },

  cancelBooking: async (bookingId, reason, cancelledBy) => {
    const response = await fetch(`http://localhost:9000/api/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, cancelledBy })
    });
    if (!response.ok) throw new Error('Failed to cancel booking');
    return response.json();
  },

  addBookingReview: async (bookingId, rating, comment) => {
    const response = await fetch(`http://localhost:9000/api/bookings/${bookingId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewType: 'client', rating, comment })
    });
    if (!response.ok) throw new Error('Failed to add review');
    return response.json();
  }
};

function BookingsEnhanced({ onViewDetails = () => {}, downloadInvoice = () => {} }) {
  const { user, getCurrentUserId } = useAuth();
  const userId = getCurrentUserId();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  // Load bookings when component mounts
  useEffect(() => {
    loadBookings();
  }, [userId, activeTab]);

  const loadBookings = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const status = activeTab === 'all' ? null : activeTab;
      const response = await bookingService.getClientBookings(userId, status);
      
      if (response.success) {
        setBookings(response.bookings || []);
      } else {
        setError(response.message || 'Failed to load bookings');
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      payment_pending: 'bg-orange-100 text-orange-800 border-orange-200',
      paid: 'bg-green-100 text-green-800 border-green-200',
      active: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      rejected: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      pending: 'Pending Approval',
      confirmed: 'Confirmed',
      payment_pending: 'Payment Required',
      paid: 'Payment Complete',
      active: 'Active Rental',
      completed: 'Completed',
      cancelled: 'Cancelled',
      rejected: 'Rejected'
    };
    return statusTexts[status] || status;
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancelReason.trim()) return;

    try {
      const response = await bookingService.cancelBooking(
        selectedBooking._id, 
        cancelReason, 
        'client'
      );
      
      if (response.success) {
        setShowCancelModal(false);
        setCancelReason('');
        setSelectedBooking(null);
        loadBookings(); // Refresh the list
        alert('Booking cancelled successfully');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking');
    }
  };

  const handleAddReview = async () => {
    if (!selectedBooking || !reviewData.rating) return;

    try {
      const response = await bookingService.addBookingReview(
        selectedBooking._id,
        reviewData.rating,
        reviewData.comment
      );
      
      if (response.success) {
        setShowReviewModal(false);
        setReviewData({ rating: 5, comment: '' });
        setSelectedBooking(null);
        loadBookings(); // Refresh the list
        alert('Review submitted successfully');
      }
    } catch (err) {
      console.error('Error adding review:', err);
      alert('Failed to submit review');
    }
  };

  const canCancelBooking = (booking) => {
    const now = new Date();
    const startDate = new Date(booking.rentalPeriod.startDate);
    return startDate > now && !['cancelled', 'completed', 'rejected'].includes(booking.status);
  };

  const canReviewBooking = (booking) => {
    return booking.status === 'completed' && !booking.review?.clientReview?.rating;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `LKR ${amount?.toLocaleString() || '0'}`;
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadBookings}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        <button 
          onClick={loadBookings}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'all', label: 'All Bookings', count: bookings.length },
            { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
            { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
            { key: 'active', label: 'Active', count: bookings.filter(b => b.status === 'active').length },
            { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} {tab.count > 0 && <span className="ml-1">({tab.count})</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <Car className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'all' ? 'You haven\'t made any bookings yet.' : `No ${activeTab} bookings found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Booking Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.vehicleId?.make} {booking.vehicleId?.model} {booking.vehicleId?.year}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Booking #{booking.bookingReference}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          License Plate: {booking.vehicleId?.licensePlate}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(booking.pricing?.totalAmount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.pricing?.totalDays} day{booking.pricing?.totalDays !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Pickup Date</p>
                          <p className="text-sm font-medium">{formatDate(booking.rentalPeriod.startDate)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Return Date</p>
                          <p className="text-sm font-medium">{formatDate(booking.rentalPeriod.endDate)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Time</p>
                          <p className="text-sm font-medium">{booking.rentalPeriod.startTime} - {booking.rentalPeriod.endTime}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Pickup Location</p>
                          <p className="text-sm font-medium">{booking.pickupLocation?.city}</p>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Owner Info */}
                    {booking.vehicleOwnerId && (
                      <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Vehicle Owner</p>
                          <p className="text-sm font-medium">
                            {booking.vehicleOwnerId.firstName} {booking.vehicleOwnerId.lastName}
                          </p>
                        </div>
                        {booking.vehicleOwnerId.phone && (
                          <div className="ml-auto">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 ml-1">{booking.vehicleOwnerId.phone}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetails(true);
                        }}
                        className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>

                      {booking.status === 'completed' && (
                        <button
                          onClick={() => downloadInvoice(booking._id)}
                          className="flex items-center space-x-1 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download Invoice</span>
                        </button>
                      )}

                      {canCancelBooking(booking) && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowCancelModal(true);
                          }}
                          className="flex items-center space-x-1 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                      )}

                      {canReviewBooking(booking) && (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowReviewModal(true);
                          }}
                          className="flex items-center space-x-1 px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                        >
                          <Star className="h-4 w-4" />
                          <span>Add Review</span>
                        </button>
                      )}

                      {['confirmed', 'paid', 'active'].includes(booking.status) && (
                        <button
                          onClick={() => {/* Handle message */}}
                          className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span>Message Owner</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Booking Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <h4 className="font-semibold mb-2">Vehicle Information</h4>
                <p><strong>Vehicle:</strong> {selectedBooking.vehicleId?.make} {selectedBooking.vehicleId?.model} {selectedBooking.vehicleId?.year}</p>
                <p><strong>License Plate:</strong> {selectedBooking.vehicleId?.licensePlate}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Rental Period</h4>
                <p><strong>Start:</strong> {formatDate(selectedBooking.rentalPeriod.startDate)} at {selectedBooking.rentalPeriod.startTime}</p>
                <p><strong>End:</strong> {formatDate(selectedBooking.rentalPeriod.endDate)} at {selectedBooking.rentalPeriod.endTime}</p>
                <p><strong>Duration:</strong> {selectedBooking.pricing?.totalDays} day(s)</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Location Details</h4>
                <p><strong>Pickup:</strong> {selectedBooking.pickupLocation?.address}, {selectedBooking.pickupLocation?.city}</p>
                <p><strong>Dropoff:</strong> {selectedBooking.dropoffLocation?.address}, {selectedBooking.dropoffLocation?.city}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Pricing Breakdown</h4>
                <p><strong>Daily Rate:</strong> {formatCurrency(selectedBooking.pricing?.dailyRate)}</p>
                <p><strong>Subtotal:</strong> {formatCurrency(selectedBooking.pricing?.subtotal)}</p>
                <p><strong>Service Fee:</strong> {formatCurrency(selectedBooking.pricing?.serviceFee)}</p>
                <p><strong>Taxes:</strong> {formatCurrency(selectedBooking.pricing?.taxes)}</p>
                <p><strong>Security Deposit:</strong> {formatCurrency(selectedBooking.pricing?.securityDeposit)}</p>
                <p className="text-lg font-bold"><strong>Total:</strong> {formatCurrency(selectedBooking.pricing?.totalAmount)}</p>
              </div>

              {selectedBooking.specialRequirements && (
                <div>
                  <h4 className="font-semibold mb-2">Special Requirements</h4>
                  <p>{selectedBooking.specialRequirements}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-red-600">Cancel Booking</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <p className="mb-4 text-gray-600">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="3"
                placeholder="Please provide a reason for cancellation..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={!cancelReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewData({...reviewData, rating: star})}
                    className={`p-1 ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Share your experience with this vehicle and owner..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddReview}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default BookingsEnhanced;
