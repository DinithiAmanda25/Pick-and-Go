import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit3, Calendar, User, Car, MapPin, DollarSign, Clock, Phone, Mail, X, AlertCircle, CheckCircle, Download, FileText, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx'; // You'll need to install this: npm install xlsx
import { saveAs } from 'file-saver'; // You'll need to install this: npm install file-saver

// Fixed BookingService class
class BookingService {
  constructor() {
    this.API_BASE_URL = 'http://localhost:9000/api/bookings';
  }

  // Get all bookings for admin
  async getAllBookings(status = null, page = 1, limit = 50) {
    try {
      let url = `${this.API_BASE_URL}/admin/all?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bookings');
      }

      return data;
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      throw error;
    }
  }

  // FIXED: Update booking status method
  async updateBookingStatus(bookingId, newStatus, requestData) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update booking status');
      }

      return data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  // Get single booking details
  async getBookingDetails(bookingId) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${bookingId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch booking details');
      }

      return data;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw error;
    }
  }

  // Generate report
  async generateReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      
      const response = await fetch(`http://localhost:9000/api/admin-reports/generate?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate report');
      }

      return data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }
}

const AdminBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    status: 'all',
    startDate: '',
    endDate: '',
    format: 'csv'
  });
  const bookingsPerPage = 10;

  const bookingService = new BookingService();

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    payment_pending: 'bg-orange-100 text-orange-800',
    paid: 'bg-green-100 text-green-800',
    active: 'bg-purple-100 text-purple-800',
    completed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-red-100 text-red-800',
    rejected: 'bg-gray-100 text-gray-800',
    refunded: 'bg-pink-100 text-pink-800'
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'payment_pending', label: 'Payment Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'refunded', label: 'Refunded' }
  ];

  // Clear messages after timeout
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError('');
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bookingService.getAllBookings(
        statusFilter === 'all' ? null : statusFilter,
        currentPage,
        bookingsPerPage
      );
      setBookings(response.bookings || []);
      setTotalBookings(response.total || 0);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, statusFilter]);

  // Filter bookings based on search term
  const filteredBookings = bookings.filter(booking => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.bookingReference?.toLowerCase().includes(searchLower) ||
      `${booking.clientId?.firstName} ${booking.clientId?.lastName}`.toLowerCase().includes(searchLower) ||
      `${booking.vehicleId?.make} ${booking.vehicleId?.model}`.toLowerCase().includes(searchLower) ||
      booking.vehicleId?.licensePlate?.toLowerCase().includes(searchLower) ||
      booking.clientId?.email?.toLowerCase().includes(searchLower) ||
      booking.clientId?.phone?.includes(searchTerm)
    );
  });

  const totalPages = Math.ceil(totalBookings / bookingsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount, currency = 'LKR') => {
    if (!amount) return `${currency} 0`;
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleViewBooking = async (booking) => {
    try {
      const response = await bookingService.getBookingDetails(booking._id);
      setSelectedBooking(response.booking);
      setIsModalOpen(true);
    } catch (error) {
      setError('Failed to fetch booking details');
    }
  };

  const handleStatusUpdate = (booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setStatusReason('');
    setIsStatusModalOpen(true);
  };

  // FIXED: Submit status update function
  const submitStatusUpdate = async () => {
    if (!selectedBooking || !newStatus) {
      setError('Please select a status');
      return;
    }

    // Don't update if status is the same
    if (newStatus === selectedBooking.status) {
      setError('Please select a different status');
      return;
    }

    try {
      setUpdateLoading(true);
      setError('');
      
      // Prepare the request data
      const requestData = {
        status: newStatus,
        reason: statusReason || '',
        notes: statusReason || ''
      };

      // Add specific fields for certain status changes
      if (newStatus === 'confirmed') {
        requestData.approvedBy = 'admin';
      } else if (newStatus === 'cancelled') {
        requestData.cancelledBy = 'admin';
      }

      console.log('Updating booking status:', {
        bookingId: selectedBooking._id,
        newStatus,
        requestData
      });

      // Call the API
      const response = await bookingService.updateBookingStatus(
        selectedBooking._id,
        newStatus,
        requestData
      );

      console.log('Status update response:', response);

      // Update the booking in the local state
      setBookings(prev => prev.map(booking => 
        booking._id === selectedBooking._id 
          ? { ...booking, status: newStatus }
          : booking
      ));

      // Close modal and show success
      setIsStatusModalOpen(false);
      setStatusReason('');
      setSelectedBooking(null);
      setSuccessMessage(`Booking status updated to ${newStatus} successfully!`);
      
      // Refresh the bookings list to get latest data
      await fetchBookings();

    } catch (error) {
      console.error('Status update error:', error);
      setError(`Failed to update booking status: ${error.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  // FIXED: Get valid status options function
  const getValidStatusOptions = (currentStatus) => {
    const validTransitions = {
      pending: ['confirmed', 'rejected', 'cancelled'],
      confirmed: ['payment_pending', 'paid', 'cancelled'],
      payment_pending: ['paid', 'cancelled'],
      paid: ['active', 'cancelled'],
      active: ['completed', 'cancelled'],
      completed: ['refunded'],
      cancelled: ['refunded'],
      rejected: [],
      refunded: []
    };

    return statusOptions.filter(option => 
      validTransitions[currentStatus]?.includes(option.value)
    );
  };

  // Generate and download report
  const generateReport = async () => {
    try {
      setReportLoading(true);
      setError('');
      
      // Get all bookings for the report (not just the current page)
      const response = await bookingService.generateReport({
        status: reportFilters.status === 'all' ? null : reportFilters.status,
        startDate: reportFilters.startDate,
        endDate: reportFilters.endDate
      });
      
      const reportData = response.bookings || [];
      
      if (reportData.length === 0) {
        setError('No data available for the selected filters');
        return;
      }
      
      // Prepare data for export
      const exportData = reportData.map(booking => ({
        'Booking Reference': booking.bookingReference,
        'Client Name': `${booking.clientId?.firstName || ''} ${booking.clientId?.lastName || ''}`,
        'Client Email': booking.clientId?.email || '',
        'Client Phone': booking.clientId?.phone || '',
        'Vehicle': `${booking.vehicleId?.make || ''} ${booking.vehicleId?.model || ''}`,
        'License Plate': booking.vehicleId?.licensePlate || '',
        'Start Date': formatDate(booking.rentalPeriod?.startDate),
        'End Date': formatDate(booking.rentalPeriod?.endDate),
        'Duration (Days)': booking.rentalPeriod?.totalDays || 0,
        'Daily Rate': booking.pricing?.dailyRate || 0,
        'Subtotal': booking.pricing?.subtotal || 0,
        'Service Fee': booking.pricing?.serviceFee || 0,
        'Taxes': booking.pricing?.taxes || 0,
        'Security Deposit': booking.pricing?.securityDeposit || 0,
        'Total Amount': booking.pricing?.totalAmount || 0,
        'Status': booking.status || '',
        'Created At': formatDate(booking.createdAt),
        'Pickup Location': booking.pickupLocation?.address || '',
        'Dropoff Location': booking.dropoffLocation?.address || '',
        'Special Requirements': booking.specialRequirements || ''
      }));
      
      // Generate file based on selected format
      if (reportFilters.format === 'csv') {
        generateCSV(exportData);
      } else if (reportFilters.format === 'excel') {
        generateExcel(exportData);
      } else if (reportFilters.format === 'json') {
        generateJSON(exportData);
      }
      
      setIsReportModalOpen(false);
      setSuccessMessage('Report generated successfully!');
      
    } catch (error) {
      setError(`Failed to generate report: ${error.message}`);
    } finally {
      setReportLoading(false);
    }
  };

  // Generate CSV file
  const generateCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');
    const csvContent = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${csvContent}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `bookings-report-${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Generate Excel file
  const generateExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
    XLSX.writeFile(workbook, `bookings-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Generate JSON file
  const generateJSON = (data) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, `bookings-report-${new Date().toISOString().split('T')[0]}.json`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <span className="ml-3 text-lg">Loading bookings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Total: {totalBookings} bookings
          </div>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reference, client name, vehicle, license plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
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
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.bookingReference}
                      </div>
                      <div className="text-xs text-gray-500">
                        Created: {formatDate(booking.createdAt)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.clientId?.firstName} {booking.clientId?.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.clientId?.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.clientId?.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.vehicleId?.make} {booking.vehicleId?.model}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.vehicleId?.year} • {booking.vehicleId?.licensePlate}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {formatDate(booking.rentalPeriod?.startDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        to {formatDate(booking.rentalPeriod?.endDate)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.rentalPeriod?.totalDays} days
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(booking.pricing?.totalAmount, booking.pricing?.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                      {booking.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewBooking(booking)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Update Status"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">No bookings found</div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * bookingsPerPage) + 1} to {Math.min(currentPage * bookingsPerPage, totalBookings)} of {totalBookings} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-1 border rounded-md ${
                    currentPage === pageNumber
                      ? 'bg-red-600 text-white border-red-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Booking Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Client Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedBooking.clientId?.firstName} {selectedBooking.clientId?.lastName}</p>
                    <p><strong>Email:</strong> {selectedBooking.clientId?.email}</p>
                    <p><strong>Phone:</strong> {selectedBooking.clientId?.phone}</p>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Car className="h-4 w-4 mr-2" />
                    Vehicle Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Vehicle:</strong> {selectedBooking.vehicleId?.make} {selectedBooking.vehicleId?.model}</p>
                    <p><strong>Year:</strong> {selectedBooking.vehicleId?.year}</p>
                    <p><strong>License Plate:</strong> {selectedBooking.vehicleId?.licensePlate}</p>
                  </div>
                </div>

                {/* Rental Period */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Rental Period
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Start:</strong> {formatDate(selectedBooking.rentalPeriod?.startDate)}</p>
                    <p><strong>End:</strong> {formatDate(selectedBooking.rentalPeriod?.endDate)}</p>
                    <p><strong>Duration:</strong> {selectedBooking.rentalPeriod?.totalDays} days</p>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Pricing Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Daily Rate:</strong> {formatCurrency(selectedBooking.pricing?.dailyRate)}</p>
                    <p><strong>Subtotal:</strong> {formatCurrency(selectedBooking.pricing?.subtotal)}</p>
                    <p><strong>Service Fee:</strong> {formatCurrency(selectedBooking.pricing?.serviceFee)}</p>
                    <p><strong>Taxes:</strong> {formatCurrency(selectedBooking.pricing?.taxes)}</p>
                    <p><strong>Security Deposit:</strong> {formatCurrency(selectedBooking.pricing?.securityDeposit)}</p>
                    <p className="font-semibold"><strong>Total:</strong> {formatCurrency(selectedBooking.pricing?.totalAmount)}</p>
                  </div>
                </div>

                {/* Locations */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Pickup Location
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>{selectedBooking.pickupLocation?.address}</p>
                    <p>{selectedBooking.pickupLocation?.city}</p>
                    {selectedBooking.pickupLocation?.instructions && (
                      <p><strong>Instructions:</strong> {selectedBooking.pickupLocation.instructions}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Dropoff Location
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>{selectedBooking.dropoffLocation?.address}</p>
                    <p>{selectedBooking.dropoffLocation?.city}</p>
                    {selectedBooking.dropoffLocation?.instructions && (
                      <p><strong>Instructions:</strong> {selectedBooking.dropoffLocation.instructions}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Special Requirements */}
              {selectedBooking.specialRequirements && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Special Requirements</h4>
                  <p className="text-sm">{selectedBooking.specialRequirements}</p>
                </div>
              )}

              {/* Status and Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Current Status:</span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[selectedBooking.status]}`}>
                    {selectedBooking.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    handleStatusUpdate(selectedBooking);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {isStatusModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Update Booking Status</h3>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Reference
                </label>
                <p className="text-sm text-gray-600">{selectedBooking.bookingReference}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedBooking.status]}`}>
                  {selectedBooking.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value={selectedBooking.status}>
                    {selectedBooking.status?.replace('_', ' ').toUpperCase()} (Current)
                  </option>
                  {getValidStatusOptions(selectedBooking.status).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason/Notes {(newStatus === 'rejected' || newStatus === 'cancelled') && 
                    <span className="text-red-500">*</span>
                  }
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder={
                    newStatus === 'rejected' ? "Please provide reason for rejection..." :
                    newStatus === 'cancelled' ? "Please provide reason for cancellation..." :
                    "Enter reason or notes (optional)..."
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="3"
                />
                {(newStatus === 'rejected' || newStatus === 'cancelled') && !statusReason.trim() && (
                  <p className="text-xs text-red-500 mt-1">Reason is required for {newStatus} status</p>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => {
                    setIsStatusModalOpen(false);
                    setStatusReason('');
                    setNewStatus('');
                  }}
                  disabled={updateLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitStatusUpdate}
                  disabled={
                    !newStatus || 
                    newStatus === selectedBooking.status ||
                    updateLoading ||
                    ((newStatus === 'rejected' || newStatus === 'cancelled') && !statusReason.trim())
                  }
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {updateLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Update Status
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Generate Bookings Report</h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Filter
                </label>
                <select
                  value={reportFilters.status}
                  onChange={(e) => setReportFilters({...reportFilters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={reportFilters.startDate}
                    onChange={(e) => setReportFilters({...reportFilters, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={reportFilters.endDate}
                    onChange={(e) => setReportFilters({...reportFilters, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Format
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="csv"
                      checked={reportFilters.format === 'csv'}
                      onChange={() => setReportFilters({...reportFilters, format: 'csv'})}
                      className="mr-2"
                    />
                    <FileText className="h-4 w-4 mr-1" />
                    CSV
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="excel"
                      checked={reportFilters.format === 'excel'}
                      onChange={() => setReportFilters({...reportFilters, format: 'excel'})}
                      className="mr-2"
                    />
                    <FileSpreadsheet className="h-4 w-4 mr-1" />
                    Excel
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="json"
                      checked={reportFilters.format === 'json'}
                      onChange={() => setReportFilters({...reportFilters, format: 'json'})}
                      className="mr-2"
                    />
                    JSON
                  </label>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  disabled={reportLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={generateReport}
                  disabled={reportLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {reportLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingManagement;