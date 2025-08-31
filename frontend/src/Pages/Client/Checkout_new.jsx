import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function Checkout() {
    const location = useLocation()
    const navigate = useNavigate()
    const { vehicle, driver, withDriver, totalPrice } = location.state || {}

    const [customerInfo, setCustomerInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: ''
    })

    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        nameOnCard: ''
    })

    const [rentalDays, setRentalDays] = useState(1)

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
        return totalPrice * rentalDays
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // Create booking data
        const bookingData = {
            id: Math.random().toString(36).substr(2, 9),
            vehicle,
            driver: withDriver ? driver : null,
            customerInfo,
            paymentInfo,
            rentalDays,
            totalAmount: calculateTotal() + 15, // Including fees
            bookingDate: new Date().toISOString(),
            status: 'confirmed'
        }

        // Navigate to invoice
        navigate(`/invoice/${bookingData.id}`, { state: bookingData })
    }

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            {/* Modern Header - Consistent with Home page */}
            <header className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0l-2 4h2v4h4V6h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0L4 4h2v4h4V6H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                </div>

                <div className="relative z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-20">
                            {/* Logo */}
                            <Link to="/" className="flex items-center space-x-3 group">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-blue-500/25">
                                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8 16.5a1.5 1.5 0 01-3 0V14h.5a.5.5 0 01.5.5v1.5zM15 16.5a1.5 1.5 0 01-3 0V14h.5a.5.5 0 01.5.5v1.5z" />
                                        <path fillRule="evenodd" d="M2 12a5 5 0 015-5h6a5 5 0 110 10H7a5 5 0 01-5-5zm5-3a3 3 0 100 6h6a3 3 0 100-6H7z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                                        Pick & Go
                                    </h1>
                                    <p className="text-xs text-blue-200 opacity-90">Premium Rentals</p>
                                </div>
                            </Link>

                            {/* Navigation */}
                            <nav className="hidden md:flex items-center space-x-8">
                                <Link to="/" className="text-white/90 hover:text-white transition-colors relative group">
                                    Home
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                                <Link to="/vehicle-rental" className="text-white/90 hover:text-white transition-colors relative group">
                                    Vehicles
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                                <Link to="/about" className="text-white/90 hover:text-white transition-colors relative group">
                                    About
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                                <Link to="/contact" className="text-white/90 hover:text-white transition-colors relative group">
                                    Contact
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                            </nav>

                            {/* CTA Buttons */}
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-white/90 hover:text-white transition-colors">
                                    Login
                                </Link>
                                <Link to="/registration" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                                    Sign Up
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Page Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-4">
                            Complete Your Booking
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Just a few more details and you'll be ready to go on your adventure
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Customer Information & Payment */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Modern Customer Information Form */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/50">
                                <div className="flex items-center space-x-3 mb-8">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Customer Information</h2>
                                        <p className="text-gray-600">Please provide your contact details</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={customerInfo.firstName}
                                                onChange={handleCustomerInfoChange}
                                                required
                                                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                placeholder="Enter your first name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={customerInfo.lastName}
                                                onChange={handleCustomerInfoChange}
                                                required
                                                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                placeholder="Enter your last name"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={customerInfo.email}
                                                onChange={handleCustomerInfoChange}
                                                required
                                                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                placeholder="your.email@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={customerInfo.phone}
                                                onChange={handleCustomerInfoChange}
                                                required
                                                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Street Address
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={customerInfo.address}
                                            onChange={handleCustomerInfoChange}
                                            required
                                            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                            placeholder="123 Main Street"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={customerInfo.city}
                                                onChange={handleCustomerInfoChange}
                                                required
                                                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                placeholder="New York"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                ZIP Code
                                            </label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={customerInfo.zipCode}
                                                onChange={handleCustomerInfoChange}
                                                required
                                                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                placeholder="10001"
                                            />
                                        </div>
                                    </div>

                                    {/* Modern Payment Information */}
                                    <div className="border-t border-gray-200 pt-8 mt-8">
                                        <div className="flex items-center space-x-3 mb-8">
                                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
                                                    <path d="M6 8h8v2H6V8z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900">Payment Information</h3>
                                                <p className="text-gray-600">Secure payment processing</p>
                                            </div>
                                            <div className="flex-1 flex justify-end">
                                                <div className="flex items-center space-x-2">
                                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="text-sm text-green-600 font-medium">SSL Secured</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                    Cardholder Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="nameOnCard"
                                                    value={paymentInfo.nameOnCard}
                                                    onChange={handlePaymentInfoChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                    placeholder="John Doe"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                    Card Number
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cardNumber"
                                                    value={paymentInfo.cardNumber}
                                                    onChange={handlePaymentInfoChange}
                                                    required
                                                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                    placeholder="1234 5678 9012 3456"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                        Expiry Date
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="expiryDate"
                                                        value={paymentInfo.expiryDate}
                                                        onChange={handlePaymentInfoChange}
                                                        required
                                                        className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                        placeholder="MM/YY"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                        CVV
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="cvv"
                                                        value={paymentInfo.cvv}
                                                        onChange={handlePaymentInfoChange}
                                                        required
                                                        className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                                        placeholder="123"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modern Submit Button */}
                                    <div className="pt-8">
                                        <button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
                                        >
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                            <span>Complete Secure Booking</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Modern Order Summary */}
                        <div className="mt-12 lg:mt-0">
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 sticky top-8 border border-white/50">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-2">
                                        Booking Summary
                                    </h2>
                                    <p className="text-gray-600">Review your selection</p>
                                </div>

                                {/* Vehicle Details */}
                                <div className="mb-8 pb-8 border-b border-gray-200">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-6">
                                        <div className="flex items-start space-x-4">
                                            <img
                                                src={vehicle.image}
                                                alt={vehicle.name}
                                                className="w-20 h-16 object-cover rounded-xl shadow-lg"
                                            />
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900">{vehicle.name}</h3>
                                                <div className="flex items-center mt-2">
                                                    <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full mr-3">
                                                        <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        <span className="text-sm font-semibold">{vehicle.rating}</span>
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
                                                <span className="text-xl font-bold text-blue-600">${vehicle.pricePerDay}</span>
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
                                                    src={driver.image}
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

                                {/* Rental Duration */}
                                <div className="mb-8">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Rental Duration (Days)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={rentalDays}
                                        onChange={(e) => setRentalDays(parseInt(e.target.value) || 1)}
                                        className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                    />
                                </div>

                                {/* Modern Price Breakdown */}
                                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 mb-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700 font-medium">Vehicle ({rentalDays} day{rentalDays > 1 ? 's' : ''})</span>
                                            <span className="font-bold text-gray-900">${vehicle.pricePerDay * rentalDays}</span>
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
                                                    ${calculateTotal() + 15}
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

            {/* Modern Professional Footer */}
            <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-blue-800 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                </div>

                <div className="relative">
                    {/* Main Footer Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* Company Info */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8 16.5a1.5 1.5 0 01-3 0V14h.5a.5.5 0 01.5.5v1.5zM15 16.5a1.5 1.5 0 01-3 0V14h.5a.5.5 0 01.5.5v1.5z" />
                                            <path fillRule="evenodd" d="M2 12a5 5 0 015-5h6a5 5 0 110 10H7a5 5 0 01-5-5zm5-3a3 3 0 100 6h6a3 3 0 100-6H7z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                        Pick & Go
                                    </h3>
                                </div>
                                <p className="text-gray-300 leading-relaxed">
                                    Your trusted partner for premium vehicle rentals. Experience comfort, reliability, and exceptional service with every journey.
                                </p>
                                <div className="flex space-x-4">
                                    <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 group">
                                        <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                        </svg>
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 group">
                                        <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                                        </svg>
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 group">
                                        <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                    </a>
                                    <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 group">
                                        <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold">Quick Links</h4>
                                <ul className="space-y-3">
                                    <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        About Us
                                    </Link></li>
                                    <li><Link to="/vehicle-rental" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Our Fleet
                                    </Link></li>
                                    <li><Link to="/pricing" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Pricing
                                    </Link></li>
                                    <li><Link to="/locations" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Locations
                                    </Link></li>
                                    <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Contact Us
                                    </Link></li>
                                </ul>
                            </div>

                            {/* Services */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold">Services</h4>
                                <ul className="space-y-3">
                                    <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Car Rental
                                    </a></li>
                                    <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Driver Service
                                    </a></li>
                                    <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Business Rentals
                                    </a></li>
                                    <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Airport Transfer
                                    </a></li>
                                    <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3 group-hover:scale-150 transition-transform"></span>
                                        Event Services
                                    </a></li>
                                </ul>
                            </div>

                            {/* Newsletter */}
                            <div className="space-y-6">
                                <h4 className="text-lg font-semibold">Stay Updated</h4>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Subscribe to our newsletter for exclusive deals and latest updates.
                                </p>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                                        />
                                    </div>
                                    <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-white/10">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                                <div className="text-gray-300 text-sm">
                                    © 2024 Pick & Go. All rights reserved. | Designed with ❤️ for better mobility
                                </div>
                                <div className="flex space-x-6 text-sm">
                                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Privacy Policy</a>
                                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Terms of Service</a>
                                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Cookie Policy</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Checkout;
