import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import bookingService from '../../Services/bookingService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function DriverTrips() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const { user, getToken } = useAuth();

    useEffect(() => {
        // Only fetch if user is available
        if (user) {
            fetchDriverBookings();
        }
    }, [filterStatus, user]);

    const fetchDriverBookings = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Try different possible user ID fields
            const driverId = user?.userId || user?.id || user?.driverId;
            
            if (!driverId) {
                throw new Error('Driver not authenticated - no user ID found');
            }
            
            // Get the token for authentication
            const token = await getToken();
            if (!token) {
                // Continue without token - the API might work with session-based auth
            }
            
            // Fetch bookings assigned to this driver
            const response = await bookingService.getDriverBookings(driverId, filterStatus);
            
            if (response.success) {
                const bookingsData = response.bookings || [];
                setBookings(bookingsData);
            } else {
                throw new Error(response.message || 'Failed to fetch driver bookings');
            }
            
        } catch (err) {
            console.error('Error fetching driver bookings:', err);
            setError(err.message || 'Failed to load driver bookings. Please try again.');
            
            // For development purposes, show some sample data if API fails
            const driverId = user?.userId || user?.id || user?.driverId;
            const sampleBookings = [
                {
                    _id: 'driver-booking-1',
                    bookingReference: 'PG2401010001',
                    status: 'confirmed',
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
                    vehicleOwnerId: {
                        firstName: 'Sarah',
                        lastName: 'Wilson',
                        email: 'sarah.wilson@example.com'
                    },
                    rentalPeriod: {
                        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    pricing: {
                        totalAmount: 15000
                    },
                    driver: {
                        required: true,
                        driverId: driverId,
                        driverFee: 2000
                    },
                    pickupLocation: {
                        address: '123 Main Street, Colombo 03',
                        city: 'Colombo'
                    },
                    dropoffLocation: {
                        address: '456 Galle Road, Mount Lavinia',
                        city: 'Mount Lavinia'
                    },
                    createdAt: new Date().toISOString()
                },
                {
                    _id: 'driver-booking-2',
                    bookingReference: 'PG2401010002',
                    status: 'active',
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
                    vehicleOwnerId: {
                        firstName: 'Michael',
                        lastName: 'Brown',
                        email: 'michael.brown@example.com'
                    },
                    rentalPeriod: {
                        startDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                        endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
                    },
                    pricing: {
                        totalAmount: 12000
                    },
                    driver: {
                        required: true,
                        driverId: driverId,
                        driverFee: 1500
                    },
                    pickupLocation: {
                        address: '789 Kandy Road, Kandy',
                        city: 'Kandy'
                    },
                    dropoffLocation: {
                        address: '321 Temple Street, Kandy',
                        city: 'Kandy'
                    },
                    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                }
            ];
            setBookings(sampleBookings);
            setError('⚠️ Using sample data - API connection failed.');
        } finally {
            setLoading(false);
        }
    };

    const updateBookingStatus = async (bookingId, newStatus) => {
        try {
            // Update booking status via API
            const driverId = user?.userId || user?.id || user?.driverId;
            const response = await bookingService.updateBookingStatus(bookingId, newStatus, {
                approvedBy: driverId,
                notes: `Status updated by driver`
            });
            
            if (response.success) {
                // Update local state with the updated booking
                setBookings(bookings.map(booking =>
                    booking._id === bookingId ? { ...booking, status: newStatus } : booking
                ));
                
                alert(`✅ Booking ${newStatus} successfully!`);
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
            case 'active':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
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
            doc.text('Driver Trip Report', 14, 22);
            
            // Add report date and driver info
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
            doc.text(`Driver: ${user?.firstName || 'Unknown'} ${user?.lastName || ''}`, 14, 37);
            
            // Add summary statistics
            const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
            const activeCount = bookings.filter(b => b.status === 'active').length;
            const completedCount = bookings.filter(b => b.status === 'completed').length;
            const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;
            const totalEarnings = bookings
                .filter(b => b.status === 'completed')
                .reduce((sum, b) => sum + (b.pricing?.driverFee || 0), 0);
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Trip Summary', 14, 52);
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total Trips: ${bookings.length}`, 14, 62);
            doc.text(`Confirmed: ${confirmedCount}`, 14, 69);
            doc.text(`Active: ${activeCount}`, 14, 76);
            doc.text(`Completed: ${completedCount}`, 14, 83);
            doc.text(`Cancelled: ${cancelledCount}`, 14, 90);
            doc.text(`Total Earnings: ${formatCurrency(totalEarnings)}`, 14, 97);
            
            // Prepare table data
            const tableData = bookings.map(booking => [
                booking.bookingReference || 'N/A',
                booking.clientId?.firstName ? `${booking.clientId.firstName} ${booking.clientId.lastName || ''}` : 'N/A',
                booking.clientId?.email || 'N/A',
                booking.vehicleId?.make ? `${booking.vehicleId.make} ${booking.vehicleId.model || ''}` : 'N/A',
                booking.vehicleId?.licensePlate || 'N/A',
                formatDate(booking.rentalPeriod?.startDate),
                formatDate(booking.rentalPeriod?.endDate),
                formatCurrency(booking.pricing?.driverFee),
                booking.status || 'Unknown',
                formatDate(booking.createdAt)
            ]);
            
            // Add table
            autoTable(doc, {
                head: [['Ref', 'Customer', 'Email', 'Vehicle', 'Plate', 'Start Date', 'End Date', 'Driver Fee', 'Status', 'Booked Date']],
                body: tableData,
                startY: 107,
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
                    0: { cellWidth: 20 }, // Ref
                    1: { cellWidth: 25 }, // Customer
                    2: { cellWidth: 30 }, // Email
                    3: { cellWidth: 25 }, // Vehicle
                    4: { cellWidth: 20 }, // Plate
                    5: { cellWidth: 20 }, // Start Date
                    6: { cellWidth: 20 }, // End Date
                    7: { cellWidth: 20 }, // Driver Fee
                    8: { cellWidth: 18 }, // Status
                    9: { cellWidth: 20 }, // Booked Date
                },
                margin: { top: 107, left: 14, right: 14 },
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
            doc.text('Pick and Go - Driver Trip Management', 14, pageHeight - 20);
            doc.text('Report generated by Driver Dashboard', 14, pageHeight - 15);
            
            // Save the PDF
            const fileName = `Driver_Trip_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF report. Please try again.');
        }
    };

    const filteredBookings = filterStatus === 'all' 
        ? bookings 
        : bookings.filter(booking => booking.status === filterStatus);

    // Show loading if user is not available yet
    if (!user) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading driver information...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your trips...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center py-8">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <p className="text-red-500 font-medium">{error}</p>
                    <button 
                        onClick={fetchDriverBookings}
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-orange-900">My Driver Trips</h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                            Total Trips: {bookings.length}
                        </span>
                        <button 
                            onClick={downloadPDFReport}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center space-x-2"
                            title="Download PDF Report"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span>PDF Report</span>
                        </button>
                        <button 
                            onClick={fetchDriverBookings}
                            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>


                {/* Status Summary */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    {['pending', 'confirmed', 'active', 'completed', 'cancelled'].map(status => {
                        const count = bookings.filter(booking => booking.status === status).length;
                        return (
                            <div key={status} className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-gray-800">{count}</div>
                                <div className="text-sm text-gray-600 capitalize">{status}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Filter */}
                <div className="mb-6 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">All Trips</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip Period</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver Fee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">
                                            {booking.clientId?.firstName ? 
                                                `${booking.clientId.firstName} ${booking.clientId.lastName || ''}` : 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {booking.clientId?.phone || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="font-medium">{booking.pickupLocation?.address || 'N/A'}</div>
                                        <div className="text-gray-500">→ {booking.dropoffLocation?.address || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="font-medium">
                                            {booking.vehicleId?.make ? 
                                                `${booking.vehicleId.make} ${booking.vehicleId.model || ''}` : 'N/A'}
                                        </div>
                                        <div className="text-gray-500">
                                            {booking.vehicleId?.licensePlate || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div>{formatDate(booking.rentalPeriod?.startDate)}</div>
                                        <div className="text-gray-500">to {formatDate(booking.rentalPeriod?.endDate)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(booking.driver?.driverFee)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(booking.status)}`}>
                                            {booking.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            {booking.status === 'active' && (
                                                <button
                                                    onClick={() => updateBookingStatus(booking._id, 'completed')}
                                                    className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                                                    title="Complete Trip"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => viewBookingDetails(booking)}
                                                className="bg-orange-500 text-white px-3 py-1 rounded text-xs hover:bg-orange-600 transition-colors"
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
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
                            <p className="text-gray-500">
                                {filterStatus === 'all' 
                                    ? 'No trips have been assigned to you yet.'
                                    : `No ${filterStatus} trips found.`
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Trip Details Modal */}
            {showDetails && selectedBooking && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Trip Details</h3>
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
                                        <label className="block text-sm font-medium text-gray-700">Customer Phone</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedBooking.clientId?.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Driver Fee</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedBooking.driver?.driverFee)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Total Booking Amount</label>
                                        <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedBooking.pricing?.totalAmount)}</p>
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
                                                <label className="block text-sm font-medium text-gray-700">License Plate</label>
                                                <p className="mt-1 text-sm text-gray-900">{selectedBooking.vehicleId.licensePlate || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Trip Route */}
                                <div>
                                    <h4 className="text-md font-medium text-gray-900 mb-2">Trip Route</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                                                <p className="mt-1 text-sm text-gray-900">{selectedBooking.pickupLocation?.address || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">{selectedBooking.pickupLocation?.city || ''}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Dropoff Location</label>
                                                <p className="mt-1 text-sm text-gray-900">{selectedBooking.dropoffLocation?.address || 'N/A'}</p>
                                                <p className="text-xs text-gray-500">{selectedBooking.dropoffLocation?.city || ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    {selectedBooking.status === 'active' && (
                                        <button
                                            onClick={() => {
                                                updateBookingStatus(selectedBooking._id, 'completed');
                                                setShowDetails(false);
                                            }}
                                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                        >
                                            Complete Trip
                                        </button>
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
}

export default DriverTrips;
