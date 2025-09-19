import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import ClientMainHeader from '../../Components/Clients/ClientMainHeader';
import { getBookingDetails } from '../../Services/bookingService';

function Invoice() {
    const { id } = useParams();
    const location = useLocation();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                // If we have booking data passed via state, use it
                if (location.state?.booking) {
                    setBooking(location.state.booking);
                    setLoading(false);
                    return;
                }
                
                // Otherwise fetch from API using the ID
                if (id) {
                    const response = await getBookingDetails(id);
                    if (response.success) {
                        setBooking(response.booking);
                    } else {
                        setError(response.message || 'Failed to fetch booking details');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch booking details:', error);
                setError('Failed to load invoice. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetails();
    }, [id, location]);

    const handleDownloadInvoice = () => {
        // Mock download functionality
        alert('Invoice downloaded successfully!');
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading invoice...</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoice not found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The requested invoice could not be loaded.'}</p>
                    <Link to="/client-dashboard" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Calculate rental days
    const startDate = new Date(booking.rentalPeriod.startDate);
    const endDate = new Date(booking.rentalPeriod.endDate);
    const rentalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <ClientMainHeader />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 print:hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg className="w-8 h-8 text-green-500 mr-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 0 00-1.414 1.414l2 2a1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h3 className="text-lg font-semibold text-green-800">Booking Confirmed!</h3>
                                <p className="text-green-700">Your vehicle rental has been successfully booked. Please save this invoice for your records.</p>
                            </div>
                        </div>

                        {/* Print and Download Buttons */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handlePrint}
                                className="text-gray-600 hover:text-blue-600 flex items-center px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print
                            </button>
                            <button
                                onClick={handleDownloadInvoice}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download
                            </button>
                        </div>
                    </div>
                </div>

                {/* Invoice */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-600 mb-2">Pick & Go</h1>
                            <p className="text-gray-600">Vehicle Rental Services</p>
                            <p className="text-gray-600">123 Main Street, City, State 12345</p>
                            <p className="text-gray-600">Phone: (555) 123-4567</p>
                            <p className="text-gray-600">Email: info@pickandgo.com</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h2>
                            <p className="text-gray-600"><strong>Invoice #:</strong> {booking.bookingReference}</p>
                            <p className="text-gray-600"><strong>Date:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                            <p className="text-gray-600"><strong>Status:</strong>
                                <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                                    booking.status === 'confirmed' || booking.status === 'paid' 
                                        ? 'bg-green-100 text-green-800'
                                        : booking.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : booking.status === 'cancelled'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill To:</h3>
                            <p className="text-gray-700"><strong>{booking.clientId?.firstName} {booking.clientId?.lastName}</strong></p>
                            <p className="text-gray-600">{booking.pickupLocation?.address}</p>
                            <p className="text-gray-600">{booking.pickupLocation?.city}</p>
                            <p className="text-gray-600">Email: {booking.clientId?.email}</p>
                            <p className="text-gray-600">Phone: {booking.clientId?.phone}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Period:</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700"><strong>From:</strong> {new Date(booking.rentalPeriod.startDate).toLocaleDateString()}</p>
                                <p className="text-gray-700"><strong>To:</strong> {new Date(booking.rentalPeriod.endDate).toLocaleDateString()}</p>
                                <p className="text-gray-700"><strong>Duration:</strong> {rentalDays} day(s)</p>
                            </div>
                        </div>
                    </div>

                    {/* Rental Details */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Details</h3>

                        {/* Vehicle */}
                        <div className="bg-gray-50 rounded-lg p-6 mb-4">
                            <div className="flex items-start space-x-4">
                                {booking.vehicleId?.images?.[0] ? (
                                    <img
                                        src={booking.vehicleId.images[0]}
                                        alt={booking.vehicleId.make}
                                        className="w-24 h-20 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-24 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-gray-900">{booking.vehicleId?.make} {booking.vehicleId?.model}</h4>
                                    <p className="text-gray-600">{booking.vehicleId?.year} • {booking.vehicleId?.licensePlate}</p>
                                    <div className="mt-2">
                                        <div className="flex flex-wrap gap-2">
                                            {booking.vehicleId?.features?.map((feature, index) => (
                                                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Driver (if applicable) */}
                        {booking.driver?.required && (
                            <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                <div className="flex items-start space-x-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900">Driver Service Included</h4>
                                        <p className="text-gray-600">Professional driver for the rental period</p>
                                        {booking.driver.driverId && (
                                            <p className="text-gray-600">Driver: {booking.driver.driverId?.fullName}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Billing Summary */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Summary</h3>
                        <div className="bg-gray-50 rounded-lg p-6">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 text-gray-700">Description</th>
                                        <th className="text-right py-2 text-gray-700">Quantity</th>
                                        <th className="text-right py-2 text-gray-700">Rate</th>
                                        <th className="text-right py-2 text-gray-700">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 text-gray-900">Vehicle Rental - {booking.vehicleId?.make} {booking.vehicleId?.model}</td>
                                        <td className="text-right py-3 text-gray-600">{rentalDays} day(s)</td>
                                        <td className="text-right py-3 text-gray-600">{booking.pricing?.currency} {booking.pricing?.dailyRate?.toLocaleString()}</td>
                                        <td className="text-right py-3 text-gray-900">{booking.pricing?.currency} {booking.pricing?.subtotal?.toLocaleString()}</td>
                                    </tr>
                                    {booking.driver?.required && (
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 text-gray-900">Driver Service</td>
                                            <td className="text-right py-3 text-gray-600">{rentalDays} day(s)</td>
                                            <td className="text-right py-3 text-gray-600">{booking.pricing?.currency} {booking.driver?.driverFee?.toLocaleString()}</td>
                                            <td className="text-right py-3 text-gray-900">{booking.pricing?.currency} {(booking.driver?.driverFee * rentalDays)?.toLocaleString()}</td>
                                        </tr>
                                    )}
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 text-gray-900">Service Fee</td>
                                        <td className="text-right py-3 text-gray-600">1</td>
                                        <td className="text-right py-3 text-gray-600">{booking.pricing?.currency} {booking.pricing?.serviceFee?.toLocaleString()}</td>
                                        <td className="text-right py-3 text-gray-900">{booking.pricing?.currency} {booking.pricing?.serviceFee?.toLocaleString()}</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 text-gray-900">Taxes</td>
                                        <td className="text-right py-3 text-gray-600">1</td>
                                        <td className="text-right py-3 text-gray-600">{booking.pricing?.currency} {booking.pricing?.taxes?.toLocaleString()}</td>
                                        <td className="text-right py-3 text-gray-900">{booking.pricing?.currency} {booking.pricing?.taxes?.toLocaleString()}</td>
                                    </tr>
                                    <tr className="border-t-2 border-gray-300">
                                        <td className="py-3 text-lg font-semibold text-gray-900" colSpan="3">Total Amount</td>
                                        <td className="text-right py-3 text-lg font-bold text-blue-600">
                                            {booking.pricing?.currency} {booking.pricing?.totalAmount?.toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="border-t border-gray-200 pt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms and Conditions</h3>
                        <div className="text-sm text-gray-600 space-y-2">
                            <p>• Vehicle must be returned in the same condition as received</p>
                            <p>• Late returns may incur additional charges</p>
                            <p>• Customer is responsible for any traffic violations during rental period</p>
                            <p>• Full payment must be settled before vehicle pickup</p>
                            <p>• Cancellations made 24 hours in advance are eligible for full refund</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 pt-8 mt-8 text-center">
                        <p className="text-gray-600">Thank you for choosing Pick & Go!</p>
                        <p className="text-sm text-gray-500 mt-2">
                            For any queries, contact us at support@pickandgo.com or call (555) 123-4567
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4 mt-8 print:hidden">
                    <Link
                        to="/client-dashboard"
                        className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        to="/vehicle-rental"
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Book Another Vehicle
                    </Link>
                </div>
            </div>

            {/* Modern Professional Footer - Same as other pages */}
            <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-blue-800 text-white relative overflow-hidden print:hidden">
                {/* Footer content remains the same as in your original file */}
                {/* ... */}
            </footer>
        </div>
    );
}

export default Invoice;