import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit3, Calendar, User, Car, MapPin, DollarSign, X, AlertCircle, CheckCircle, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// BookingService class
class BookingService {
  constructor() {
    this.API_BASE_URL = 'http://localhost:9000/api/bookings';
  }

  async getAllBookings(status = null, page = 1, limit = 50) {
    try {
      // Temporary mock data while backend issues are being resolved
      const mockBookings = [
        {
          _id: '1',
          bookingNumber: 'BK001',
          clientId: { firstName: 'John', lastName: 'Doe', phone: '+1234567890', email: 'john@example.com' },
          vehicleId: { make: 'Toyota', model: 'Camry', year: 2023, licensePlate: 'ABC-123', images: [] },
          vehicleOwnerId: { firstName: 'Mike', lastName: 'Smith', phone: '+0987654321', email: 'mike@example.com' },
          startDate: '2024-01-15',
          endDate: '2024-01-17',
          totalAmount: 150,
          status: 'confirmed',
          createdAt: '2024-01-10',
          driver: { driverId: { fullName: 'David Wilson', phone: '+1122334455', rating: 4.5 } }
        },
        {
          _id: '2',
          bookingNumber: 'BK002',
          clientId: { firstName: 'Jane', lastName: 'Smith', phone: '+1234567891', email: 'jane@example.com' },
          vehicleId: { make: 'Honda', model: 'Civic', year: 2022, licensePlate: 'XYZ-789', images: [] },
          vehicleOwnerId: { firstName: 'Sarah', lastName: 'Johnson', phone: '+0987654322', email: 'sarah@example.com' },
          startDate: '2024-01-20',
          endDate: '2024-01-22',
          totalAmount: 200,
          status: 'pending',
          createdAt: '2024-01-18',
          driver: { driverId: null }
        },
        {
          _id: '3',
          bookingNumber: 'BK003',
          clientId: { firstName: 'Bob', lastName: 'Brown', phone: '+1234567892', email: 'bob@example.com' },
          vehicleId: { make: 'Nissan', model: 'Altima', year: 2021, licensePlate: 'DEF-456', images: [] },
          vehicleOwnerId: { firstName: 'Tom', lastName: 'Davis', phone: '+0987654323', email: 'tom@example.com' },
          startDate: '2024-01-25',
          endDate: '2024-01-27',
          totalAmount: 180,
          status: 'completed',
          createdAt: '2024-01-23',
          driver: { driverId: { fullName: 'Mark Taylor', phone: '+1122334456', rating: 4.8 } }
        }
      ];

      // Filter by status if provided
      let filteredBookings = mockBookings;
      if (status && status !== 'all') {
        filteredBookings = mockBookings.filter(booking => booking.status === status);
      }

      return {
        success: true,
        bookings: filteredBookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: 1,
          totalBookings: filteredBookings.length,
          hasNextPage: false,
          hasPrevPage: false
        },
        total: filteredBookings.length
      };
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      throw error;
    }
  }

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

  async generateReport(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Only add status filter if it's explicitly provided and not 'all'
      if (filters.status && filters.status !== 'all' && filters.status !== '') {
        params.append('status', filters.status);
      }
      
      // If no filters are provided, fetch all bookings
      const url = Object.keys(filters).length === 0 
        ? `${this.API_BASE_URL}/admin/all?limit=1000` 
        : `http://localhost:9000/api/admin-reports/generate?${params.toString()}`;
      
      const response = await fetch(url);
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
  const [newStatus, setNewStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
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

  // Filter bookings - apply search filter only (status filtering is done server-side)
  const filteredBookings = bookings.filter(booking => {
    // Apply search filter
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

  const submitStatusUpdate = async () => {
    if (!selectedBooking || !newStatus) {
      setError('Please select a status');
      return;
    }

    if (newStatus === selectedBooking.status) {
      setError('Please select a different status');
      return;
    }

    try {
      setUpdateLoading(true);
      setError('');
      
      const requestData = {
        status: newStatus,
        reason: statusReason || '',
        notes: statusReason || ''
      };

      if (newStatus === 'confirmed') {
        requestData.approvedBy = 'admin';
      } else if (newStatus === 'cancelled') {
        requestData.cancelledBy = 'admin';
      }

      const response = await bookingService.updateBookingStatus(
        selectedBooking._id,
        newStatus,
        requestData
      );

      setBookings(prev => prev.map(booking => 
        booking._id === selectedBooking._id 
          ? { ...booking, status: newStatus }
          : booking
      ));

      setIsStatusModalOpen(false);
      setStatusReason('');
      setSelectedBooking(null);
      setSuccessMessage(`Booking status updated to ${newStatus} successfully!`);
      
      await fetchBookings();

    } catch (error) {
      console.error('Status update error:', error);
      setError(`Failed to update booking status: ${error.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

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

  // Generate PDF report
  const generatePDF = async (data) => {
    if (!data || data.length === 0) {
      setError('No data available to generate PDF');
      return;
    }
    
    try {
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
      
      // Add logo
      const logoImg = new Image();
      logoImg.src = '/src/Assets/logo.jpg'; // Path to the logo
      
      // Wait for logo to load
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve; // Continue even if logo fails to load
      });
      
      // Add logo to PDF (top right corner)
      if (logoImg.complete && logoImg.naturalWidth > 0) {
        const logoWidth = 30;
        const logoHeight = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.addImage(logoImg, 'JPEG', pageWidth - logoWidth - 14, 10, logoWidth, logoHeight);
      }
      
      // Add company header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Pick and Go', 14, 20);
      
      // Add report title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('Booking Management Report', 14, 30);
      
      // Add generation date and admin info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);
      doc.text(`Generated by: Admin Dashboard`, 14, 47);
      
      // Add summary statistics
      const totalBookings = data.length;
      const confirmedCount = data.filter(b => b.status === 'confirmed').length;
      const pendingCount = data.filter(b => b.status === 'pending').length;
      const cancelledCount = data.filter(b => b.status === 'cancelled').length;
      const completedCount = data.filter(b => b.status === 'completed').length;
      const totalRevenue = data
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Statistics', 14, 60);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Bookings: ${totalBookings}`, 14, 70);
      doc.text(`Confirmed: ${confirmedCount}`, 14, 77);
      doc.text(`Pending: ${pendingCount}`, 14, 84);
      doc.text(`Cancelled: ${cancelledCount}`, 14, 91);
      doc.text(`Completed: ${completedCount}`, 14, 98);
      doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 14, 105);
      
      // Prepare table data
      const tableColumns = [
        'Reference', 'Client', 'Email', 'Vehicle', 'License Plate', 'Start Date', 'End Date', 
        'Days', 'Amount', 'Status', 'Booked Date'
      ];
      
      const tableRows = data.map(booking => [
        booking.bookingReference || 'N/A',
        `${booking.clientId?.firstName || ''} ${booking.clientId?.lastName || ''}`,
        booking.clientId?.email || 'N/A',
        `${booking.vehicleId?.make || ''} ${booking.vehicleId?.model || ''}`,
        booking.vehicleId?.licensePlate || 'N/A',
        formatDate(booking.rentalPeriod?.startDate),
        formatDate(booking.rentalPeriod?.endDate),
        booking.rentalPeriod?.totalDays || 0,
        formatCurrency(booking.pricing?.totalAmount),
        booking.status?.replace('_', ' ').toUpperCase() || 'N/A',
        formatDate(booking.createdAt)
      ]);
      
      // Add table
      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: 115,
        styles: { 
          fontSize: 7,
          cellPadding: 2,
        },
        headStyles: { 
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 20 }, // Reference
          1: { cellWidth: 25 }, // Client
          2: { cellWidth: 30 }, // Email
          3: { cellWidth: 25 }, // Vehicle
          4: { cellWidth: 20 }, // License Plate
          5: { cellWidth: 20 }, // Start Date
          6: { cellWidth: 20 }, // End Date
          7: { cellWidth: 15 }, // Days
          8: { cellWidth: 20 }, // Amount
          9: { cellWidth: 18 }, // Status
          10: { cellWidth: 20 }, // Booked Date
        },
        margin: { top: 115, left: 14, right: 14 },
        didDrawPage: (data) => {
          // Add page numbers
          const pageCount = doc.internal.getNumberOfPages();
          const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
          doc.setFontSize(8);
          doc.text(`Page ${currentPage} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
        }
      });
      
      // Add footer with company info
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Pick and Go - Vehicle Rental Management System', 14, pageHeight - 20);
      doc.text('Admin Dashboard Report', 14, pageHeight - 15);
      
      // Save the PDF
      const fileName = `Admin_Booking_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report. Please try again.');
    }
  };

  // Generate and download report
  const generateReport = async () => {
    try {
      setReportLoading(true);
      setError('');
      
      // Fetch all bookings without any status filtering
      const response = await bookingService.generateReport({});
      
      const reportData = response.bookings || [];
      
      if (reportData.length === 0) {
        setError('No booking data available to generate report');
        return;
      }
      
      // Generate PDF with all booking data
      await generatePDF(reportData);
      
      setSuccessMessage('Report generated successfully with all booking data!');
      
    } catch (error) {
      setError(`Failed to generate report: ${error.message}`);
    } finally {
      setReportLoading(false);
    }
  };

  // Download PDF with current filter
  const downloadFilteredPDF = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use current bookings data (already filtered by status)
      const reportData = bookings;
      
      if (reportData.length === 0) {
        setError('No bookings found with current filter to generate PDF');
        return;
      }
      
      // Generate PDF with filtered data
      await generatePDF(reportData);
      setSuccessMessage(`PDF generated successfully with ${reportData.length} filtered bookings!`);
      
    } catch (error) {
      setError(`Failed to generate filtered PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Download PDF with all bookings
  const downloadAllPDF = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all bookings without any filter
      const response = await bookingService.generateReport({});
      const reportData = response.bookings || [];
      
      if (reportData.length === 0) {
        setError('No booking data available to generate PDF');
        return;
      }
      
      // Generate PDF with all data
      await generatePDF(reportData);
      setSuccessMessage(`PDF generated successfully with all ${reportData.length} bookings!`);
      
    } catch (error) {
      setError(`Failed to generate all bookings PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
              onClick={downloadFilteredPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              title="Download PDF with current filter"
            >
              <Download className="h-4 w-4" />
              <span>PDF (Filtered)</span>
            </button>
            <button
              onClick={downloadAllPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
              title="Download PDF with all bookings"
            >
              <FileText className="h-4 w-4" />
              <span>PDF (All)</span>
            </button>
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
                  disabled={updateLoading || ((newStatus === 'rejected' || newStatus === 'cancelled') && !statusReason.trim())}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {updateLoading ? 'Updating...' : 'Update Status'}
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