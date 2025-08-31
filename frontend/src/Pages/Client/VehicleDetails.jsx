import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

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
        if (withDriver && !selectedDriver) {
            alert('Please select a driver')
            return
        }

        setShowAgreement(true)
    }

    const handleAgreementAccept = () => {
        if (!agreementAccepted) {
            alert('Please accept the agreement to proceed')
            return
        }

        const bookingData = {
            vehicle,
            driver: selectedDriver,
            withDriver,
            totalPrice: calculateTotalPrice()
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            {/* Professional Header */}
            <header className="bg-white/95 backdrop-blur-md shadow-2xl border-b border-gray-100/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5">
                    <div className="flex justify-between items-center">
                        <Link to="/" className="flex items-center space-x-4 group">
                            <div className="relative">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Pick & Go
                                </span>
                                <span className="text-xs text-gray-500 font-medium">Premium Vehicle Rental</span>
                            </div>
                        </Link>

                        <nav className="hidden lg:flex items-center space-x-10">
                            <Link to="/" className="relative text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 group">
                                <span>Home</span>
                                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300"></div>
                            </Link>
                            <Link to="/vehicle-rental" className="relative text-blue-600 font-semibold group">
                                <span>Vehicles</span>
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                            </Link>
                        </nav>

                        <div className="flex items-center space-x-4">
                            <Link to="/vehicle-rental" className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-blue-50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>Back to Search</span>
                            </Link>
                            <Link to="/login" className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-8 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:shadow-blue-500/25">
                                <span className="flex items-center space-x-2">
                                    <span>Login</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                {!showAgreement ? (
                    <>
                        {/* Modern Vehicle Details */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden mb-12 border border-white/50">
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
                                        <span className="text-lg font-bold text-gray-800">{vehicle.rating}</span>
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

                        {/* Premium Driver Selection */}
                        {withDriver && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 mb-12 border border-white/50">
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

            {/* Professional Footer */}
            <footer className="bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 text-white relative overflow-hidden mt-20">
                <div className="absolute inset-0 opacity-5">
                    <svg className="w-full h-full" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="footerGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#footerGrid)" />
                    </svg>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-4 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl flex items-center justify-center shadow-2xl">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <span className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">Pick & Go</span>
                                <p className="text-blue-200 text-sm font-medium">Premium Vehicle Rental</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 mb-12">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <p className="text-white font-semibold">+94 77 123 4567</p>
                                <p className="text-gray-400 text-sm">24/7 Customer Support</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-white font-semibold">info@pickandgo.lk</p>
                                <p className="text-gray-400 text-sm">General Inquiries</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                </div>
                                <p className="text-white font-semibold">Colombo 07, Sri Lanka</p>
                                <p className="text-gray-400 text-sm">Main Office Location</p>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-8">
                            <p className="text-gray-400 text-center">
                                &copy; 2025 Pick & Go. All rights reserved. |
                                <a href="/privacy" className="hover:text-white transition-colors duration-300 ml-1">Privacy Policy</a> |
                                <a href="/terms" className="hover:text-white transition-colors duration-300 ml-1">Terms of Service</a>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default VehicleDetails
