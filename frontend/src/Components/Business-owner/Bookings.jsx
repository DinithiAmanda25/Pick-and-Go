// Components/Business-owner/Bookings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import bookingService from '../../Services/bookingService';

const BusinessOwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const { user, getToken } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      
      // Get the token for authentication
      const token = await getToken();
      if (!token) {
        // Continue without token - the API might work with session-based auth
      }
      
      // Fetch all bookings in the system (admin view)
      const response = await bookingService.getAllBookings();
      
      if (response.success) {
        const bookingsData = response.bookings || [];
        setBookings(bookingsData);
        console.log(`✅ Fetched ${bookingsData.length} bookings`);
        console.log('📊 Bookings data:', bookingsData);
        
        // Log each booking for debugging
        bookingsData.forEach((booking, index) => {
          console.log(`📋 Booking ${index + 1}:`, {
            id: booking._id,
            reference: booking.bookingReference,
            status: booking.status,
            client: booking.clientId?.firstName + ' ' + booking.clientId?.lastName,
            vehicle: booking.vehicleId?.make + ' ' + booking.vehicleId?.model,
            amount: booking.pricing?.totalAmount
          });
        });
      } else {
        throw new Error(response.message || 'Failed to fetch bookings');
      }
      
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings. Please try again.');
      
      // For development purposes, show some sample data if API fails
      const sampleBookings = [
        {
          _id: 'sample-1',
          bookingReference: 'PG2401010001',
          status: 'pending',
          clientId: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+94-77-123-4567'
          },
          vehicleId: {
            make: 'Toyota',
            model: 'Camry',
            licensePlate: 'ABC-1234',
            type: 'sedan',
            color: 'Silver'
          },
          rentalPeriod: {
            startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          pricing: {
            totalAmount: 15000
          },
          createdAt: new Date().toISOString()
        },
        {
          _id: 'sample-2',
          bookingReference: 'PG2401010002',
          status: 'confirmed',
          clientId: {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+94-77-234-5678'
          },
          vehicleId: {
            make: 'Honda',
            model: 'Civic',
            licensePlate: 'XYZ-5678',
            type: 'sedan',
            color: 'Blue'
          },
          rentalPeriod: {
            startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          pricing: {
            totalAmount: 12000
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: 'sample-3',
          bookingReference: 'PG2401010003',
          status: 'completed',
          clientId: {
            firstName: 'Michael',
            lastName: 'Johnson',
            email: 'michael.johnson@example.com',
            phone: '+94-77-345-6789'
          },
          vehicleId: {
            make: 'Nissan',
            model: 'Altima',
            licensePlate: 'DEF-9012',
            type: 'sedan',
            color: 'Black'
          },
          vehicleOwnerId: {
            firstName: 'Sarah',
            lastName: 'Wilson',
            email: 'sarah.wilson@example.com'
          },
          rentalPeriod: {
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          },
          pricing: {
            totalAmount: 18000
          },
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setBookings(sampleBookings);
      setError('⚠️ Using sample data - API connection failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };


  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      console.log(`🔄 Updating booking ${bookingId} to status: ${newStatus}`);
      
      // Update booking status via API
      const response = await bookingService.updateBookingStatus(bookingId, newStatus, {
        approvedBy: user?.userId,
        notes: `Status updated by business owner`
      });
      
      if (response.success) {
        // Update local state with the updated booking
        setBookings(bookings.map(booking =>
          booking._id === bookingId ? { ...booking, status: newStatus } : booking
        ));
        
        alert(`✅ Booking ${newStatus} successfully!`);
        console.log(`✅ Booking status updated: ${bookingId} -> ${newStatus}`);
      } else {
        throw new Error(response.message || 'Failed to update booking status');
      }

    } catch (err) {
      console.error('Error updating booking status:', err);
      alert(`❌ Failed to update booking status: ${err.message}`);
    }
  };

  const viewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const downloadPDFReport = () => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Booking Management Report', 14, 22);
      
      // Add report date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Add summary statistics
      const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
      const pendingCount = bookings.filter(b => b.status === 'pending').length;
      const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;
      const completedCount = bookings.filter(b => b.status === 'completed').length;
      const totalRevenue = bookings
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Statistics', 14, 45);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Bookings: ${bookings.length}`, 14, 55);
      doc.text(`Confirmed: ${confirmedCount}`, 14, 62);
      doc.text(`Pending: ${pendingCount}`, 14, 69);
      doc.text(`Cancelled: ${cancelledCount}`, 14, 76);
      doc.text(`Completed: ${completedCount}`, 14, 83);
      doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 14, 90);
      
      // Prepare table data
      const tableData = bookings.map(booking => [
        booking.bookingReference || 'N/A',
        booking.clientId?.firstName ? `${booking.clientId.firstName} ${booking.clientId.lastName || ''}` : 'N/A',
        booking.clientId?.email || 'N/A',
        booking.vehicleId?.make ? `${booking.vehicleId.make} ${booking.vehicleId.model || ''}` : 'N/A',
        booking.vehicleId?.licensePlate || 'N/A',
        booking.vehicleOwnerId?.firstName ? `${booking.vehicleOwnerId.firstName} ${booking.vehicleOwnerId.lastName || ''}` : 'N/A',
        formatDate(booking.rentalPeriod?.startDate),
        formatDate(booking.rentalPeriod?.endDate),
        formatCurrency(booking.pricing?.totalAmount),
        booking.status || 'Unknown',
        formatDate(booking.createdAt)
      ]);
      
      // Add table
      autoTable(doc, {
        head: [['Ref', 'Customer', 'Email', 'Vehicle', 'Plate', 'Owner', 'Start Date', 'End Date', 'Amount', 'Status', 'Booked Date']],
        body: tableData,
        startY: 100,
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
          0: { cellWidth: 18 }, // Ref
          1: { cellWidth: 22 }, // Customer
          2: { cellWidth: 25 }, // Email
          3: { cellWidth: 22 }, // Vehicle
          4: { cellWidth: 18 }, // Plate
          5: { cellWidth: 22 }, // Owner
          6: { cellWidth: 18 }, // Start Date
          7: { cellWidth: 18 }, // End Date
          8: { cellWidth: 18 }, // Amount
          9: { cellWidth: 15 }, // Status
          10: { cellWidth: 18 }, // Booked Date
        },
        margin: { top: 100, left: 14, right: 14 },
        didDrawPage: (data) => {
          // Add page numbers
          const pageCount = doc.internal.getNumberOfPages();
          const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
          doc.setFontSize(8);
          doc.text(`Page ${currentPage} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
        }
      });
      
      // Add footer with business info
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Pick and Go - Booking Management System', 14, pageHeight - 20);
      doc.text('Report generated by Business Owner Dashboard', 14, pageHeight - 15);
      
      // Save the PDF
      const fileName = `Booking_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filterStatus);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p className="text-red-500 font-medium">{error}</p>
          <button 
            onClick={fetchBookings}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">All Bookings - System View</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Total Bookings: {bookings.length}
          </span>
          {process.env.NODE_ENV === 'development' && (
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
              Debug: {bookings.length} bookings loaded
            </span>
          )}
          <button 
            onClick={downloadPDFReport}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center space-x-2"
            title="Download PDF Report"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>Download PDF</span>
          </button>
          <button 
            onClick={fetchBookings}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Debug Information - Development Only */}
      {process.env.NODE_ENV === 'development' && bookings.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Information (All System Bookings):</h3>
          <div className="text-xs text-gray-600">
            <p>Total system bookings: {bookings.length}</p>
            <p>Filtered bookings: {filteredBookings.length}</p>
            <p>Current filter: {filterStatus}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-blue-600">Show raw booking data</summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                {JSON.stringify(bookings, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {['pending', 'confirmed', 'completed', 'cancelled', 'rejected'].map(status => {
          const count = bookings.filter(booking => booking.status === status).length;
          return (
            <div key={status} className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{status}</div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      
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
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle Owner
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
                Booked Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {booking.bookingReference || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {booking.clientId?.firstName ? 
                      `${booking.clientId.firstName} ${booking.clientId.lastName || ''}` : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.clientId?.email || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.clientId?.phone || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.vehicleId?.make ? 
                      `${booking.vehicleId.make} ${booking.vehicleId.model || ''}` : 'N/A'}
                  </div>
                  {booking.vehicleId?.licensePlate && (
                    <div className="text-sm text-gray-500">
                      {booking.vehicleId.licensePlate}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.vehicleOwnerId?.firstName ? 
                      `${booking.vehicleOwnerId.firstName} ${booking.vehicleOwnerId.lastName || ''}` : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.vehicleOwnerId?.email || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(booking.rentalPeriod?.startDate)}
                  </div>
                  <div className="text-sm text-gray-500">
                    to {formatDate(booking.rentalPeriod?.endDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(booking.pricing?.totalAmount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(booking.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                          className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                          title="Approve Booking"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking._id, 'rejected')}
                          className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                          title="Reject Booking"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => viewBookingDetails(booking)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                      title="View Details"
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">
              {filterStatus === 'all' 
                ? 'No bookings have been made yet or there was an error loading the data.'
                : `No ${filterStatus} bookings found.`
              }
            </p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Booking Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Booking Reference</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.bookingReference || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(selectedBooking.status)}`}>
                      {selectedBooking.status || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedBooking.clientId?.firstName ? 
                        `${selectedBooking.clientId.firstName} ${selectedBooking.clientId.lastName || ''}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.clientId?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.clientId?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedBooking.pricing?.totalAmount)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vehicle Owner</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedBooking.vehicleOwnerId?.firstName ? 
                        `${selectedBooking.vehicleOwnerId.firstName} ${selectedBooking.vehicleOwnerId.lastName || ''}` : 'N/A'}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedBooking.vehicleOwnerId?.email || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Vehicle Information */}
                {selectedBooking.vehicleId && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Vehicle Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Make & Model</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedBooking.vehicleId.make ? 
                            `${selectedBooking.vehicleId.make} ${selectedBooking.vehicleId.model || ''}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Plate Number</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedBooking.vehicleId.licensePlate || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <p className="mt-1 text-sm text-gray-900 capitalize">{selectedBooking.vehicleId.type || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Color</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedBooking.vehicleId.color || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rental Period */}
                {selectedBooking.rentalPeriod && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Rental Period</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Start Date</label>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(selectedBooking.rentalPeriod.startDate)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">End Date</label>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(selectedBooking.rentalPeriod.endDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  {selectedBooking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          updateBookingStatus(selectedBooking._id, 'confirmed');
                          setShowDetails(false);
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          updateBookingStatus(selectedBooking._id, 'rejected');
                          setShowDetails(false);
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessOwnerBookings;