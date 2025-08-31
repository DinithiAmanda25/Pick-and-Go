import React from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

function Invoice() {
    const { id } = useParams()
    const location = useLocation()
    const bookingData = location.state

    const handleDownloadInvoice = () => {
        // Mock download functionality
        alert('Invoice downloaded successfully!')
    }

    const handlePrint = () => {
        window.print()
    }

    if (!bookingData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoice not found</h2>
                    <Link to="/client-dashboard" className="text-blue-600 hover:text-blue-800">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm print:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <Link to="/" className="text-2xl font-bold text-blue-600">
                            Pick & Go
                        </Link>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handlePrint}
                                className="text-gray-600 hover:text-blue-600 flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print
                            </button>
                            <button
                                onClick={handleDownloadInvoice}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 print:hidden">
                    <div className="flex items-center">
                        <svg className="w-8 h-8 text-green-500 mr-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h3 className="text-lg font-semibold text-green-800">Booking Confirmed!</h3>
                            <p className="text-green-700">Your vehicle rental has been successfully booked. Please save this invoice for your records.</p>
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
                            <p className="text-gray-600"><strong>Invoice #:</strong> INV-{bookingData.id}</p>
                            <p className="text-gray-600"><strong>Date:</strong> {new Date(bookingData.bookingDate).toLocaleDateString()}</p>
                            <p className="text-gray-600"><strong>Status:</strong>
                                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                                    {bookingData.status}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill To:</h3>
                            <p className="text-gray-700"><strong>{bookingData.customerInfo.firstName} {bookingData.customerInfo.lastName}</strong></p>
                            <p className="text-gray-600">{bookingData.customerInfo.address}</p>
                            <p className="text-gray-600">{bookingData.customerInfo.city}, {bookingData.customerInfo.zipCode}</p>
                            <p className="text-gray-600">Email: {bookingData.customerInfo.email}</p>
                            <p className="text-gray-600">Phone: {bookingData.customerInfo.phone}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method:</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700">Credit Card</p>
                                <p className="text-gray-600">**** **** **** {bookingData.paymentInfo.cardNumber.slice(-4)}</p>
                                <p className="text-gray-600">{bookingData.paymentInfo.nameOnCard}</p>
                            </div>
                        </div>
                    </div>

                    {/* Rental Details */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Details</h3>

                        {/* Vehicle */}
                        <div className="bg-gray-50 rounded-lg p-6 mb-4">
                            <div className="flex items-start space-x-4">
                                <img
                                    src={bookingData.vehicle.image}
                                    alt={bookingData.vehicle.name}
                                    className="w-24 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-gray-900">{bookingData.vehicle.name}</h4>
                                    <div className="flex items-center mt-1">
                                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="text-sm text-gray-600">{bookingData.vehicle.rating}</span>
                                    </div>
                                    <div className="mt-2">
                                        <div className="flex flex-wrap gap-2">
                                            {bookingData.vehicle.features.map((feature, index) => (
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
                        {bookingData.withDriver && bookingData.driver && (
                            <div className="bg-gray-50 rounded-lg p-6 mb-4">
                                <div className="flex items-start space-x-4">
                                    <img
                                        src={bookingData.driver.image}
                                        alt={bookingData.driver.name}
                                        className="w-16 h-16 object-cover rounded-full"
                                    />
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-900">Driver: {bookingData.driver.name}</h4>
                                        <div className="flex items-center mt-1">
                                            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="text-sm text-gray-600">{bookingData.driver.rating}</span>
                                            <span className="text-sm text-gray-600 ml-4">Experience: {bookingData.driver.experience}</span>
                                        </div>
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
                                        <td className="py-3 text-gray-900">Vehicle Rental - {bookingData.vehicle.name}</td>
                                        <td className="text-right py-3 text-gray-600">{bookingData.rentalDays} day(s)</td>
                                        <td className="text-right py-3 text-gray-600">${bookingData.vehicle.pricePerDay}</td>
                                        <td className="text-right py-3 text-gray-900">${bookingData.vehicle.pricePerDay * bookingData.rentalDays}</td>
                                    </tr>
                                    {bookingData.withDriver && bookingData.driver && (
                                        <tr className="border-b border-gray-100">
                                            <td className="py-3 text-gray-900">Driver Service - {bookingData.driver.name}</td>
                                            <td className="text-right py-3 text-gray-600">{bookingData.rentalDays} day(s)</td>
                                            <td className="text-right py-3 text-gray-600">${bookingData.driver.pricePerDay}</td>
                                            <td className="text-right py-3 text-gray-900">${bookingData.driver.pricePerDay * bookingData.rentalDays}</td>
                                        </tr>
                                    )}
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 text-gray-900">Service Fee</td>
                                        <td className="text-right py-3 text-gray-600">1</td>
                                        <td className="text-right py-3 text-gray-600">$5</td>
                                        <td className="text-right py-3 text-gray-900">$5</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-3 text-gray-900">Insurance</td>
                                        <td className="text-right py-3 text-gray-600">1</td>
                                        <td className="text-right py-3 text-gray-600">$10</td>
                                        <td className="text-right py-3 text-gray-900">$10</td>
                                    </tr>
                                    <tr className="border-t-2 border-gray-300">
                                        <td className="py-3 text-lg font-semibold text-gray-900" colSpan="3">Total Amount</td>
                                        <td className="text-right py-3 text-lg font-bold text-blue-600">${bookingData.totalAmount + 15}</td>
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
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition duration-300"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        to="/vehicle-rental"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
                    >
                        Book Another Vehicle
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Invoice
