// Frontend service for booking operations
import axios from 'axios';

const API_BASE_URL =  'http://localhost:9000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token if needed
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class BookingService {
  // Create a new booking
  async createBooking(bookingData) {
    try {
      console.log('Creating booking with data:', bookingData);
      
      const response = await axios.post('http://localhost:9000/api/bookings/create', bookingData);
      
      console.log('Booking created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data.message || 'Failed to create booking');
      } else if (error.request) {
        // Request made but no response
        throw new Error('Network error. Please check your connection.');
      } else {
        // Request setup error
        throw new Error('Failed to create booking request.');
      }
    }
  }

  // Get bookings for a client
  async getClientBookings(clientId, status = null) {
    try {
      const url = status ? 
        `/bookings/client/${clientId}?status=${status}` : 
        `/bookings/client/${clientId}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching client bookings:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }

  // Get bookings for a vehicle owner
  async getVehicleOwnerBookings(ownerId, status = null) {
    try {
      const url = status ? 
        `/bookings/owner/${ownerId}?status=${status}` : 
        `/bookings/owner/${ownerId}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle owner bookings:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
  }

  // Get single booking details
  async getBookingDetails(bookingId) {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch booking details');
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId, status, additionalData = {}) {
    try {
      const response = await api.put(`/bookings/${bookingId}/status`, {
        status,
        ...additionalData
      });
      return response.data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update booking status');
    }
  }

  // Cancel booking
  async cancelBooking(bookingId, reason, cancelledBy = 'client') {
    try {
      const response = await api.put(`/bookings/${bookingId}/cancel`, {
        reason,
        cancelledBy
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel booking');
    }
  }

  // Add message to booking
  async addBookingMessage(bookingId, message, from, fromId) {
    try {
      const response = await api.post(`/bookings/${bookingId}/messages`, {
        message,
        from,
        fromId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding booking message:', error);
      throw new Error(error.response?.data?.message || 'Failed to add message');
    }
  }

  // Add review to booking
  async addBookingReview(bookingId, rating, comment, reviewType = 'client') {
    try {
      const response = await api.post(`/bookings/${bookingId}/review`, {
        reviewType,
        rating,
        comment
      });
      return response.data;
    } catch (error) {
      console.error('Error adding booking review:', error);
      throw new Error(error.response?.data?.message || 'Failed to add review');
    }
  }

  // Get booking analytics for client
  async getBookingAnalytics(clientId) {
    try {
      const response = await api.get(`/bookings/analytics/${clientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }

  // Check vehicle availability
  async checkVehicleAvailability(vehicleId, startDate, endDate) {
    try {
      const response = await api.get(
        `/bookings/availability/${vehicleId}?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error) {
      console.error('Error checking vehicle availability:', error);
      throw new Error(error.response?.data?.message || 'Failed to check availability');
    }
  }

  // Helper methods
  formatCurrency(amount, currency = 'LKR') {
    return `${currency} ${amount?.toLocaleString() || '0'}`;
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusColor(status) {
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
  }

  getStatusText(status) {
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
  }

  canCancelBooking(booking) {
    const now = new Date();
    const startDate = new Date(booking.rentalPeriod.startDate);
    return startDate > now && !['cancelled', 'completed', 'rejected'].includes(booking.status);
  }

  canReviewBooking(booking) {
    return booking.status === 'completed' && !booking.review?.clientReview?.rating;
  }
}

// Create singleton instance
const bookingService = new BookingService();

// Export individual functions for backward compatibility
export const createBooking = (bookingData) => bookingService.createBooking(bookingData);
export const getBookingDetails = (bookingId) => bookingService.getBookingDetails(bookingId);
export const getClientBookings = (clientId, status) => bookingService.getClientBookings(clientId, status);
export const updateBookingStatus = (bookingId, status, additionalData) => 
  bookingService.updateBookingStatus(bookingId, status, additionalData);
export const cancelBooking = (bookingId, reason, cancelledBy) => 
  bookingService.cancelBooking(bookingId, reason, cancelledBy);

export default bookingService;