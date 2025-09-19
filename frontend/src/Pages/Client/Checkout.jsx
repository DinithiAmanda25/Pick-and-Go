import React, { useState, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ClientMainHeader from '../../Components/Clients/ClientMainHeader'
import RentalAgreement from '../../Components/Client/RentalAgreement'
import { createBooking } from '../../Services/bookingService'

function Checkout() {
    const location = useLocation()
    const navigate = useNavigate()
    
    const { 
        vehicle, 
        driver, 
        withDriver, 
        totalPrice, 
        startDate: stateStartDate, 
        endDate: stateEndDate, 
        pickupLocation: statePickupLocation, 
        dropoffLocation: stateDropoffLocation,
        pickupDate,
        dropoffDate,
        pickupTime,
        dropoffTime
    } = location.state || {}

    // Use the dates from state, fallback to pickupDate/dropoffDate
    const startDate = stateStartDate || pickupDate
    const endDate = stateEndDate || dropoffDate

    // Validate that we have required data
    if (!vehicle) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking information not found</h2>
                    <Link to="/vehicle-rental" className="text-blue-600 hover:text-blue-800">
                        Back to Vehicle Search
                    </Link>
                </div>
            </div>
        )
    }

    // Validate dates
    if (!startDate || !endDate) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking dates not found</h2>
                    <p className="text-gray-600 mb-4">Please go back and select rental dates.</p>
                    <Link to="/vehicle-rental" className="text-blue-600 hover:text-blue-800">
                        Back to Vehicle Search
                    </Link>
                </div>
            </div>
        )
    }

    const [customerInfo, setCustomerInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        specialRequirements: ''
    })

    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        nameOnCard: ''
    })

    const [isAgreementAccepted, setIsAgreementAccepted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Calculate rental days
    const calculateRentalDays = () => {
        if (!startDate || !endDate) return 1;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays || 1;
    }

    const rentalDays = calculateRentalDays();

    const handleCustomerInfoChange = (e) => {
        setCustomerInfo({
            ...customerInfo,
            [e.target.name]: e.target.value
        })
    }

    const handlePaymentInfoChange = (e) => {
        setPaymentInfo({
            ...paymentInfo,
            [e.target.name]: e.target.value
        })
    }

    const calculateTotal = () => {
        let total = 0;
        
        if (vehicle?.pricePerDay) {
            total += vehicle.pricePerDay * rentalDays;
        }
        
        if (withDriver && driver?.pricePerDay) {
            total += driver.pricePerDay * rentalDays;
        }
        
        // Add service fee and insurance
        total += 15; // $5 service fee + $10 insurance
        
        return total;
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!isAgreementAccepted) {
            setError('Please accept the rental agreement before proceeding.')
            return
        }

        // Validate dates
        if (!startDate || !endDate) {
            setError('Please select valid rental dates')
            return
        }

        // Basic form validation
        if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.phone) {
            setError('Please fill in all required customer information.')
            return
        }

        if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv || !paymentInfo.nameOnCard) {
            setError('Please fill in all payment information.')
            return
        }

        if (!customerInfo.address || !customerInfo.city) {
            setError('Please provide pickup address and city.')
            return
        }

        setLoading(true)
        setError('')

            try {
        // Get current user ID
        const clientId = localStorage.getItem('currentUserId') || localStorage.getItem('userId') || '64f8b2a4e123456789abcdef';
        
        // Prepare booking data according to backend schema
        const bookingData = {
            clientId: clientId,
            vehicleId: vehicle._id || vehicle.id,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            startTime: pickupTime || '09:00',
            endTime: dropoffTime || '17:00',
            pickupLocation: {
                address: statePickupLocation?.address || customerInfo.address,
                city: statePickupLocation?.city || customerInfo.city,
                coordinates: statePickupLocation?.coordinates || {
                    latitude: 0,
                    longitude: 0
                },
                instructions: statePickupLocation?.instructions || ''
            },
            dropoffLocation: {
                address: stateDropoffLocation?.address || statePickupLocation?.address || customerInfo.address,
                city: stateDropoffLocation?.city || statePickupLocation?.city || customerInfo.city,
                coordinates: stateDropoffLocation?.coordinates || statePickupLocation?.coordinates || {
                    latitude: 0,
                    longitude: 0
                },
                instructions: stateDropoffLocation?.instructions || ''
            },
            driverRequired: withDriver || false,
            // Only include driverId if withDriver is true and driver is selected
            ...(withDriver && driver && { driverId: driver._id || driver.id }),
            additionalServices: [],
            specialRequirements: customerInfo.specialRequirements || ''
        };

        console.log('Submitting booking data:', bookingData);

        // Create booking
        const response = await createBooking(bookingData);
        
        if (response.success) {
            // Navigate to invoice page with booking data
            navigate(`/invoice/${response.booking._id}`, { 
                state: { 
                    booking: response.booking,
                    customerInfo,
                    paymentInfo 
                } 
            });
        } else {
            setError(response.message || 'Failed to create booking');
        }
    } catch (error) {
        console.error('Booking error:', error);
        setError(error.message || 'Failed to create booking. Please try again.');
    } finally {
        setLoading(false);
    }
}

    return (
        <div className="min-h-screen bg-white">
            <ClientMainHeader />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 py-20 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="checkoutGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#checkoutGrid)" />
                    </svg>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-white">
                            Complete Your
                            <span className="bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent"> Booking</span>
                        </h1>
                        <p className="text-xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed">
                            Just a few more details and you'll be ready to embark on your premium travel experience
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="relative bg-gradient-to-br from-gray-50 to-blue-50/30 py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Customer Information & Payment */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Error Display */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-red-700">{error}</span>
                                    </div>
                                </div>
                            )}

                            {/* Customer Information Form */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                                <div className="flex items-center space-x-4 mb-8">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl flex items-center justify-center shadow-2xl">
                                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                                            Customer Information
                                        </h2>
                                        <p className="text-gray-600 text-lg">Please provide your contact details</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700/90">
                                                First Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={customerInfo.firstName}
                                                onChange={handleCustomerInfoChange}
                                                required
                                                className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-lg"
                                                placeholder="Enter your first name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700/90">
                                                Last Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={customerInfo.lastName}
                                                onChange={handleCustomerInfoChange}
                                                required
                                                className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-lg"
                                                placeholder="Enter your last name"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700/90">
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={customerInfo.email}
                                                onChange={handleCustomerInfoChange}
                                                required
                                                className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-lg"
                                                placeholder="your.email@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700/90">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={customerInfo.phone}
                                                onChange={handleCustomerInfoChange}
                                                required
                                                className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-lg"
                                                placeholder="+94 77 123 4567"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700/90">
                                            Street Address *
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={customerInfo.address}
                                            onChange={handleCustomerInfoChange}
                                            required
                                            className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-lg"
                                            placeholder="123 Main Street, Colombo"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700/90">
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={customerInfo.city}
                                                onChange={handleCustomerInfoChange}
                                                required
                                                className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-lg"
                                                placeholder="Colombo"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-gray-700/90">
                                                ZIP Code
                                            </label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={customerInfo.zipCode}
                                                onChange={handleCustomerInfoChange}
                                                className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-lg"
                                                placeholder="00100"
                                            />
                                        </div>
                                    </div>

                                    {/* Special Requirements */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700/90">
                                            Special Requirements
                                        </label>
                                        <textarea
                                            name="specialRequirements"
                                            value={customerInfo.specialRequirements || ''}
                                            onChange={handleCustomerInfoChange}
                                            rows="3"
                                            className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-lg"
                                            placeholder="Any special requirements or notes..."
                                        />
                                    </div>

                                    {/* Payment Information */}
                                    <div className="border-t border-gray-200/50 pt-8 mt-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-green-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                                                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
                                                        <path d="M6 8h8v2H6V8z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-green-600 bg-clip-text text-transparent">
                                                        Payment Information
                                                    </h3>
                                                    <p className="text-gray-600 text-lg">Secure payment processing</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                                                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm text-green-700 font-semibold">SSL Secured</span>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700/90">
                                                    Cardholder Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="nameOnCard"
                                                    value={paymentInfo.nameOnCard}
                                                    onChange={handlePaymentInfoChange}
                                                    required
                                                    className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-lg"
                                                    placeholder="John Doe"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700/90">
                                                    Card Number *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cardNumber"
                                                    value={paymentInfo.cardNumber}
                                                    onChange={handlePaymentInfoChange}
                                                    required
                                                    className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-lg"
                                                    placeholder="1234 5678 9012 3456"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-gray-700/90">
                                                        Expiry Date *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="expiryDate"
                                                        value={paymentInfo.expiryDate}
                                                        onChange={handlePaymentInfoChange}
                                                        required
                                                        className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-lg"
                                                        placeholder="MM/YY"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-gray-700/90">
                                                        CVV *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="cvv"
                                                        value={paymentInfo.cvv}
                                                        onChange={handlePaymentInfoChange}
                                                        required
                                                        className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 placeholder-gray-500 transition-all duration-300 shadow-lg"
                                                        placeholder="123"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rental Agreement Section */}
                                    <div className="border-t border-gray-200/50 pt-8 mt-8">
                                        <RentalAgreement
                                            onAccept={setIsAgreementAccepted}
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-8">
                                        <button
                                            type="submit"
                                            disabled={!isAgreementAccepted || loading}
                                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform flex items-center justify-center space-x-3 ${
                                                isAgreementAccepted && !loading
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Processing Booking...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>
                                                        {isAgreementAccepted ? 'Complete Secure Booking' : 'Accept Agreement to Continue'}
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="mt-12 lg:mt-0">
                            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sticky top-8 border border-white/20">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-2">
                                        Booking Summary
                                    </h2>
                                    <p className="text-gray-600 text-lg">Review your selection</p>
                                </div>

                                {/* Vehicle Details */}
                                <div className="mb-8 pb-8 border-b border-gray-200">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6">
                                        <div className="flex items-start space-x-4">
                                            <img
                                                src={vehicle.image || vehicle.images?.[0] || '/api/placeholder/80/64'}
                                                alt={vehicle.name || `${vehicle.make} ${vehicle.model}`}
                                                className="w-20 h-16 object-cover rounded-xl shadow-lg"
                                            />
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {vehicle.name || `${vehicle.make} ${vehicle.model}`}
                                                </h3>
                                                <div className="flex items-center mt-2">
                                                    <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full mr-3">
                                                        <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        <span className="text-sm font-semibold">{vehicle.rating?.average || 0}</span>
                                                    </div>
                                                    <div className="text-green-600 flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-sm font-medium">Available</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xl font-bold text-blue-600">
                                                    ${vehicle.pricePerDay || vehicle.rentalPrice?.dailyRate}
                                                </span>
                                                <p className="text-gray-600 text-sm">/day</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Driver Details */}
                                {withDriver && driver && (
                                    <div className="mb-8 pb-8 border-b border-gray-200">
                                        <div className="bg-gradient-to-r from-green-50 to-blue-100 rounded-2xl p-6">
                                            <div className="flex items-start space-x-4">
                                                <img
                                                    src={driver.image || '/api/placeholder/80/64'}
                                                    alt={driver.name}
                                                    className="w-20 h-16 object-cover rounded-xl shadow-lg"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-900">{driver.name}</h3>
                                                    <div className="flex items-center mt-2">
                                                        <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full mr-3">
                                                            <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                            <span className="text-sm font-semibold">{driver.rating}</span>
                                                        </div>
                                                        <div className="text-blue-600 flex items-center">
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="text-sm font-medium">Professional</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600 text-sm mt-1">{driver.experience}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xl font-bold text-green-600">${driver.pricePerDay}</span>
                                                    <p className="text-gray-600 text-sm">/day</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Rental Period */}
                                <div className="mb-8 pb-8 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Period</h3>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">From:</span>
                                            <span className="font-medium">{new Date(startDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">To:</span>
                                            <span className="font-medium">{new Date(endDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Duration:</span>
                                            <span className="font-medium">{rentalDays} day{rentalDays > 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 mb-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700 font-medium">Vehicle ({rentalDays} day{rentalDays > 1 ? 's' : ''})</span>
                                            <span className="font-bold text-gray-900">
                                                ${(vehicle.pricePerDay || vehicle.rentalPrice?.dailyRate || 0) * rentalDays}
                                            </span>
                                        </div>
                                        {withDriver && driver && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-700 font-medium">Driver ({rentalDays} day{rentalDays > 1 ? 's' : ''})</span>
                                                <span className="font-bold text-gray-900">${driver.pricePerDay * rentalDays}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Service Fee</span>
                                            <span className="text-gray-700">$5</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Insurance</span>
                                            <span className="text-gray-700">$10</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xl font-bold text-gray-900">Total Amount</span>
                                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                    ${calculateTotal()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Features */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                        <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm font-semibold text-green-800">Secure Payment</p>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                                        <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm font-semibold text-blue-800">Data Protected</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer - keeping it simple for brevity */}
            <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-blue-800 text-white py-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <p className="text-gray-300">© 2024 Pick & Go. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Checkout;