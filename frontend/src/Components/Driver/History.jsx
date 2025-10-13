import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import bookingService from '../../Services/bookingService';

function DriverHistory() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { user, getToken } = useAuth();

    useEffect(() => {
        if (user) {
            fetchDriverHistory();
        }
    }, [user]);

    const fetchDriverHistory = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Get driver ID
            const driverId = user?.userId || user?.id || user?.driverId;
            
            if (!driverId) {
                throw new Error('Driver not authenticated - no user ID found');
            }
            
            // Fetch only completed bookings for history
            const response = await bookingService.getDriverBookings(driverId, 'completed');
            
            if (response.success) {
                const bookingsData = response.bookings || [];
                setBookings(bookingsData);
            } else {
                throw new Error(response.message || 'Failed to fetch driver history');
            }
            
        } catch (err) {
            console.error('Error fetching driver history:', err);
            setError(err.message || 'Failed to load driver history');
            
            // Show sample data for development
            const sampleBookings = [
                {
                    _id: 'sample-1',
                    bookingReference: 'PG2401010001',
                    status: 'completed',
                    clientId: {
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@email.com',
                        phone: '+94771234567'
                    },
                    vehicleId: {
                        make: 'Toyota',
                        model: 'Camry',
                        licensePlate: 'ABC-1234'
                    },
                    rentalPeriod: {
                        startDate: '2024-01-15T08:00:00Z',
                        endDate: '2024-01-15T18:00:00Z',
                        totalDays: 1
                    },
                    pricing: {
                        totalAmount: 15000,
                        driverFee: 3000
                    },
                    createdAt: '2024-01-14T10:30:00Z'
                },
                {
                    _id: 'sample-2',
                    bookingReference: 'PG2401010002',
                    status: 'completed',
                    clientId: {
                        firstName: 'Jane',
                        lastName: 'Smith',
                        email: 'jane.smith@email.com',
                        phone: '+94771234568'
                    },
                    vehicleId: {
                        make: 'Honda',
                        model: 'Civic',
                        licensePlate: 'XYZ-5678'
                    },
                    rentalPeriod: {
                        startDate: '2024-01-16T09:00:00Z',
                        endDate: '2024-01-16T17:00:00Z',
                        totalDays: 1
                    },
                    pricing: {
                        totalAmount: 12000,
                        driverFee: 2400
                    },
                    createdAt: '2024-01-15T14:20:00Z'
                }
            ];
            setBookings(sampleBookings);
        } finally {
            setLoading(false);
        }
    };

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

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'LKR'
        }).format(amount);
    };


    // Filter bookings based on search term
    const filteredBookings = bookings.filter(booking => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
            booking.bookingReference?.toLowerCase().includes(searchLower) ||
            `${booking.clientId?.firstName} ${booking.clientId?.lastName}`.toLowerCase().includes(searchLower) ||
            `${booking.vehicleId?.make} ${booking.vehicleId?.model}`.toLowerCase().includes(searchLower) ||
            booking.vehicleId?.licensePlate?.toLowerCase().includes(searchLower) ||
            booking.clientId?.email?.toLowerCase().includes(searchLower)
        );
    });

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
                    <p className="mt-4 text-gray-600">Loading your trip history...</p>
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
                        onClick={fetchDriverHistory}
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
                    <div>
                        <h2 className="text-2xl font-bold text-orange-900">Completed Trip History</h2>
                        <p className="text-sm text-gray-600 mt-1">View your completed trips and earnings</p>
                    </div>
                    <div className="text-sm text-gray-600">
                        Completed Trips: {bookings.length}
                    </div>
                </div>

                {/* Search Filter */}
                <div className="mb-6">
                    <div className="max-w-md">
                        <input
                            type="text"
                            placeholder="Search completed trips by customer, vehicle, or booking reference..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Bookings Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip Period</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver Fee</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Date</th>
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
                                                {formatDate(booking.createdAt)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {booking.clientId?.firstName} {booking.clientId?.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {booking.clientId?.email}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {booking.clientId?.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {booking.vehicleId?.make} {booking.vehicleId?.model}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {booking.vehicleId?.licensePlate}
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(booking.pricing?.driverFee)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(booking.rentalPeriod?.endDate)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredBookings.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <div className="text-gray-500">No completed trips found</div>
                        <div className="text-sm text-gray-400 mt-2">
                            {searchTerm ? 'Try adjusting your search terms' : 'You haven\'t completed any trips yet. Check the Trips page for active bookings.'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DriverHistory
