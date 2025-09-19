import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ClientMainHeader from '../../Components/Clients/ClientMainHeader'

function VehicleDetails() {
    const location = useLocation()
    const navigate = useNavigate()
    const { vehicle, withDriver, drivers } = location.state || {}
    const [selectedDriver, setSelectedDriver] = useState(null)
    const [showAgreement, setShowAgreement] = useState(false)
    const [agreementAccepted, setAgreementAccepted] = useState(false)

    const mockAgreement = `
    VEHICLE RENTAL AGREEMENT

    This Vehicle Rental Agreement ("Agreement") is entered into between Pick & Go ("Company") and the renter ("Customer").

    1. RENTAL TERMS
    - The rental period begins on the pickup date and time specified by the Customer.
    - The Customer agrees to return the vehicle in the same condition as received.
    - Late returns may incur additional charges.

    2. DRIVER REQUIREMENTS
    - Customer must possess a valid driver's license.
    - Minimum age requirement: 21 years.
    - Additional drivers must be registered and approved.

    3. INSURANCE AND LIABILITY
    - Basic insurance coverage is included in the rental fee.
    - Customer is responsible for damages not covered by insurance.
    - Theft, vandalism, or accidents must be reported immediately.

    4. PROHIBITED USES
    - Subletting or unauthorized use is strictly prohibited.
    - Vehicle cannot be used for illegal activities.
    - Smoking is not permitted in any vehicle.

    5. PAYMENT TERMS
    - Full payment is required before vehicle pickup.
    - Additional charges may apply for extra services.
    - Security deposit may be required.

    6. CANCELLATION POLICY
    - Cancellations made 24 hours in advance are fully refundable.
    - Late cancellations may incur charges.

    By accepting this agreement, the Customer acknowledges reading and understanding all terms and conditions.
  `

    const handleDriverSelect = (driver) => {
        setSelectedDriver(driver)
    }

    const handleProceedToCheckout = () => {
       /* if (withDriver && !selectedDriver) {
            alert('Please select a driver')
            return
        } */

        setShowAgreement(true)
    }

const handleAgreementAccept = () => {
    if (!agreementAccepted) {
        alert('Please accept the agreement to proceed')
        return
    }

    // Get dates from the location state (passed from VehicleRental page)
    const { pickupDate, dropoffDate, pickupTime, dropoffTime } = location.state || {}

    const bookingData = {
        vehicle,
        driver: withDriver ? selectedDriver : null, // Only include driver if withDriver is true
        withDriver,
        totalPrice: calculateTotalPrice(),
        // Add dates to the booking data
        startDate: pickupDate,
        endDate: dropoffDate,
        pickupTime: pickupTime,
        dropoffTime: dropoffTime,
        // Also include location data if available
        pickupLocation: location.state?.pickupLocation,
        dropoffLocation: location.state?.dropoffLocation
    }

    navigate('/checkout', { state: bookingData })
}
    const calculateTotalPrice = () => {
        let total = vehicle?.pricePerDay || 0
        if (withDriver && selectedDriver) {
            total += selectedDriver.pricePerDay
        }
        return total
    }

    if (!vehicle) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Vehicle not found</h2>
                    <Link to="/vehicle-rental" className="text-blue-600 hover:text-blue-800">
                        Back to Vehicle Search
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Use Consistent Header */}
            <ClientMainHeader />

            {/* Hero Section with Same Design as Checkout */}
            <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 py-20 overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="vehicleGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#vehicleGrid)" />
                    </svg>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-white">
                            Vehicle
                            <span className="bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent"> Details</span>
                        </h1>
                        <p className="text-xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed">
                            Discover premium features and specifications of your selected vehicle
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="relative bg-gradient-to-br from-gray-50 to-blue-50/30 py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    {!showAgreement ? (
                        <>
                            {/* Enhanced Vehicle Details */}
                            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden mb-12 border border-white/20">
                                <div className="lg:flex">
                                    <div className="lg:w-1/2 relative">
                                        <img
                                            src={vehicle.image}
                                            alt={vehicle.name}
                                            className="w-full h-80 lg:h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center space-x-2">
                                            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="text-lg font-bold text-gray-800">{vehicle.rating?.average || 0}</span>
                                        </div>
                                    </div>
                                    <div className="lg:w-1/2 p-10">
                                        <div className="mb-8">
                                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-3">
                                                {vehicle.name}
                                            </h1>
                                            <p className="text-gray-600 text-lg capitalize font-medium">{vehicle.type} Vehicle</p>
                                        </div>

                                        <div className="mb-8">
                                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                                <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Premium Features
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                {vehicle.features.map((feature, index) => (
                                                    <div key={index} className="flex items-center bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-100/50">
                                                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-gray-800 font-medium text-lg">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border border-blue-200/50">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-sm text-gray-600 font-medium">Starting from</span>
                                                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                                        ${vehicle.pricePerDay}
                                                    </div>
                                                    <span className="text-gray-600 font-medium">per day</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center text-green-600 mb-2">
                                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="font-semibold">Available Now</span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm">All-inclusive pricing</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Driver Selection */}
                            {withDriver && (
                                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-12 border border-white/20">
                                    <div className="text-center mb-10">
                                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-4">
                                            Choose Your Professional Driver
                                        </h2>
                                        <p className="text-gray-600 text-lg">Select from our experienced and certified drivers</p>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {drivers?.map((driver) => (
                                            <div
                                                key={driver.id}
                                                className={`group relative overflow-hidden rounded-2xl p-8 cursor-pointer transition-all duration-500 transform hover:scale-105 ${selectedDriver?.id === driver.id
                                                    ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-500 shadow-2xl shadow-blue-500/25'
                                                    : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl'
                                                    }`}
                                                onClick={() => handleDriverSelect(driver)}
                                            >
                                                <div className="flex items-center mb-6">
                                                    <div className="relative">
                                                        <img
                                                            src={driver.image}
                                                            alt={driver.name}
                                                            className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                                                        />
                                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="ml-6">
                                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{driver.name}</h3>
                                                        <div className="flex items-center mb-2">
                                                            <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                                                                <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
                                                                <span className="text-sm font-semibold text-gray-700">{driver.rating}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-600 font-medium">Experience: {driver.experience}</p>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex items-center text-blue-600">
                                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="text-sm font-medium">Verified Professional</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                                            ${driver.pricePerDay}
                                                        </span>
                                                        <p className="text-gray-600 text-sm font-medium">/day</p>
                                                    </div>
                                                </div>

                                                {selectedDriver?.id === driver.id && (
                                                    <div className="absolute top-4 right-4">
                                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Premium Pricing Summary */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 mb-12 border border-white/50">
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-4">
                                        Pricing Summary
                                    </h2>
                                    <p className="text-gray-600 text-lg">Transparent pricing with no hidden fees</p>
                                </div>

                                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8">
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <span className="text-gray-800 font-semibold text-lg">Vehicle Rental</span>
                                                    <p className="text-gray-600 text-sm">{vehicle.name}</p>
                                                </div>
                                            </div>
                                            <span className="text-xl font-bold text-gray-900">${vehicle.pricePerDay}/day</span>
                                        </div>

                                        {withDriver && selectedDriver && (
                                            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                                <div className="flex items-center">
                                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-800 font-semibold text-lg">Professional Driver</span>
                                                        <p className="text-gray-600 text-sm">{selectedDriver.name}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xl font-bold text-gray-900">${selectedDriver.pricePerDay}/day</span>
                                            </div>
                                        )}

                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="text-blue-100 text-sm font-medium">Total Daily Rate</span>
                                                    <div className="text-3xl font-bold">${calculateTotalPrice()}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                                                        <span className="text-sm font-medium">All-inclusive</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 pt-4">
                                            <div className="text-center">
                                                <div className="text-green-600 mb-2">
                                                    <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-medium text-gray-600">Insurance Included</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-blue-600 mb-2">
                                                    <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-medium text-gray-600">Secure Payment</p>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-purple-600 mb-2">
                                                    <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-medium text-gray-600">24/7 Support</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Premium Proceed Button */}
                            <div className="text-center">
                                <button
                                    onClick={handleProceedToCheckout}
                                    className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-12 py-4 rounded-2xl font-bold text-xl hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105"
                                >
                                    <span className="flex items-center justify-center space-x-3">
                                        <span>Review Agreement</span>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m-6 8h6m-3-16v16" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Modern E-Agreement Section */
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                            {/* Agreement Header */}
                            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-10 text-white">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6-4h6m-6 8h6m-3-16v16" />
                                        </svg>
                                    </div>
                                    <h2 className="text-4xl font-bold mb-4">Vehicle Rental Agreement</h2>
                                    <p className="text-blue-100 text-lg">Please review and accept our terms and conditions</p>
                                </div>
                            </div>

                            <div className="p-10">
                                {/* Agreement Content */}
                                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 mb-8 max-h-96 overflow-y-auto border border-gray-200/50">
                                    <div className="prose prose-lg max-w-none">
                                        <div className="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                                            {mockAgreement.split('\n').map((line, index) => {
                                                if (line.trim().startsWith('VEHICLE RENTAL AGREEMENT')) {
                                                    return <h1 key={index} className="text-2xl font-bold text-gray-900 mb-6 text-center">{line.trim()}</h1>
                                                }
                                                if (line.trim() && /^\d+\./.test(line.trim())) {
                                                    return <h3 key={index} className="text-lg font-bold text-blue-600 mt-6 mb-3">{line.trim()}</h3>
                                                }
                                                if (line.trim().startsWith('-')) {
                                                    return <li key={index} className="ml-4 mb-2 text-gray-700">{line.trim().substring(1)}</li>
                                                }
                                                if (line.trim()) {
                                                    return <p key={index} className="mb-3 text-gray-700">{line.trim()}</p>
                                                }
                                                return <br key={index} />
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Digital Signature Section */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl p-8 mb-8 border border-blue-200/50">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                        <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Digital Acceptance
                                    </h3>
                                    <div className="flex items-center bg-white rounded-xl p-6 shadow-lg">
                                        <input
                                            type="checkbox"
                                            id="agreement"
                                            checked={agreementAccepted}
                                            onChange={(e) => setAgreementAccepted(e.target.checked)}
                                            className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                                        />
                                        <label htmlFor="agreement" className="text-gray-800 font-medium text-lg flex-1">
                                            I have read, understood, and agree to all the terms and conditions of this vehicle rental agreement.
                                            I acknowledge that this digital signature has the same legal effect as a handwritten signature.
                                        </label>
                                    </div>

                                    {agreementAccepted && (
                                        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
                                            <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-green-800 font-semibold">Agreement accepted digitally on {new Date().toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => setShowAgreement(false)}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-8 rounded-2xl font-semibold transition-all duration-300 border border-gray-300"
                                    >
                                        <span className="flex items-center justify-center space-x-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            <span>Back to Details</span>
                                        </span>
                                    </button>
                                    <button
                                        onClick={handleAgreementAccept}
                                        className={`flex-1 py-4 px-8 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${agreementAccepted
                                            ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-2xl hover:shadow-green-500/25'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        disabled={!agreementAccepted}
                                    >
                                        <span className="flex items-center justify-center space-x-2">
                                            <span>Accept & Continue to Checkout</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modern Professional Footer - Same as Checkout */}
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
    )
}

export default VehicleDetails
