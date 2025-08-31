import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function VehicleRental() {
    const [searchData, setSearchData] = useState({
        pickupLocation: '',
        dropoffLocation: '',
        pickupDate: '',
        pickupTime: '',
        dropoffDate: '',
        dropoffTime: '',
        vehicleType: '',
        withDriver: false
    })

    const [filteredVehicles, setFilteredVehicles] = useState([])
    const [showResults, setShowResults] = useState(false)

    // Mock data for vehicles and drivers
    const mockVehicles = [
        {
            id: 1,
            name: 'Toyota Camry',
            type: 'sedan',
            image: '/api/placeholder/300/200',
            pricePerDay: 50,
            features: ['Air Conditioning', 'GPS', 'Bluetooth'],
            rating: 4.8,
            available: true
        },
        {
            id: 2,
            name: 'Honda CR-V',
            type: 'suv',
            image: '/api/placeholder/300/200',
            pricePerDay: 70,
            features: ['Air Conditioning', 'GPS', 'All-Wheel Drive'],
            rating: 4.7,
            available: true
        },
        {
            id: 3,
            name: 'Ford Transit',
            type: 'van',
            image: '/api/placeholder/300/200',
            pricePerDay: 90,
            features: ['Large Capacity', 'GPS', 'Air Conditioning'],
            rating: 4.6,
            available: true
        }
    ]

    const mockDrivers = [
        {
            id: 1,
            name: 'John Smith',
            rating: 4.9,
            experience: '5 years',
            pricePerDay: 30,
            image: '/api/placeholder/100/100'
        },
        {
            id: 2,
            name: 'Sarah Johnson',
            rating: 4.8,
            experience: '3 years',
            pricePerDay: 25,
            image: '/api/placeholder/100/100'
        }
    ]

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setSearchData({
            ...searchData,
            [name]: type === 'checkbox' ? checked : value
        })
    }

    const handleSearch = (e) => {
        e.preventDefault()
        let filtered = mockVehicles

        if (searchData.vehicleType) {
            filtered = filtered.filter(vehicle => vehicle.type === searchData.vehicleType)
        }

        setFilteredVehicles(filtered)
        setShowResults(true)
    }

    return (
        <div className="min-h-screen bg-gray-50">
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
                            <Link to="/about" className="relative text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 group">
                                <span>About</span>
                                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300"></div>
                            </Link>
                            <Link to="/contact" className="relative text-gray-600 hover:text-blue-600 font-medium transition-all duration-300 group">
                                <span>Contact</span>
                                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:w-full transition-all duration-300"></div>
                            </Link>
                        </nav>

                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="hidden md:block text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-blue-50">
                                Login
                            </Link>
                            <Link to="/register" className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-8 py-3 rounded-2xl font-semibold hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:shadow-blue-500/25">
                                <span className="flex items-center space-x-2">
                                    <span>Get Started</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </Link>

                            {/* Mobile Menu Button */}
                            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Search Section */}
            <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 text-white py-20 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        <circle cx="100" cy="100" r="60" fill="rgba(59, 130, 246, 0.1)" />
                        <circle cx="300" cy="200" r="80" fill="rgba(147, 51, 234, 0.1)" />
                        <circle cx="200" cy="400" r="70" fill="rgba(16, 185, 129, 0.1)" />
                    </svg>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                                Find Your Perfect Vehicle
                            </span>
                        </h1>
                        <p className="text-xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed">
                            Choose from our premium fleet of vehicles with flexible rental options and professional drivers
                        </p>
                    </div>

                    {/* Modern Search Form */}
                    <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Pickup Location */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-white/90">
                                    Pickup Location
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="pickupLocation"
                                        value={searchData.pickupLocation}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60 transition-all duration-300"
                                        placeholder="Enter pickup location"
                                        required
                                    />
                                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Dropoff Location */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-white/90">
                                    Dropoff Location
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="dropoffLocation"
                                        value={searchData.dropoffLocation}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white placeholder-white/60 transition-all duration-300"
                                        placeholder="Enter dropoff location"
                                        required
                                    />
                                    <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Pickup Date */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-white/90">
                                    Pickup Date
                                </label>
                                <input
                                    type="date"
                                    name="pickupDate"
                                    value={searchData.pickupDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white transition-all duration-300"
                                    required
                                />
                            </div>

                            {/* Pickup Time */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-white/90">
                                    Pickup Time
                                </label>
                                <input
                                    type="time"
                                    name="pickupTime"
                                    value={searchData.pickupTime}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white transition-all duration-300"
                                    required
                                />
                            </div>

                            {/* Dropoff Date */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-white/90">
                                    Dropoff Date
                                </label>
                                <input
                                    type="date"
                                    name="dropoffDate"
                                    value={searchData.dropoffDate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white transition-all duration-300"
                                    required
                                />
                            </div>

                            {/* Dropoff Time */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-white/90">
                                    Dropoff Time
                                </label>
                                <input
                                    type="time"
                                    name="dropoffTime"
                                    value={searchData.dropoffTime}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white transition-all duration-300"
                                    required
                                />
                            </div>

                            {/* Vehicle Type */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-white/90">
                                    Vehicle Type
                                </label>
                                <select
                                    name="vehicleType"
                                    value={searchData.vehicleType}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white transition-all duration-300"
                                >
                                    <option value="" className="text-gray-900">All Types</option>
                                    <option value="sedan" className="text-gray-900">Sedan</option>
                                    <option value="suv" className="text-gray-900">SUV</option>
                                    <option value="van" className="text-gray-900">Van</option>
                                    <option value="truck" className="text-gray-900">Truck</option>
                                    <option value="luxury" className="text-gray-900">Luxury</option>
                                </select>
                            </div>

                            {/* Driver Option */}
                            <div className="flex items-center justify-center">
                                <label className="flex items-center bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="withDriver"
                                        checked={searchData.withDriver}
                                        onChange={handleInputChange}
                                        className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-white/30 rounded bg-white/20"
                                    />
                                    <span className="text-white font-semibold">Include Driver</span>
                                </label>
                            </div>
                        </div>

                        <div className="text-center">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-white to-blue-50 text-gray-900 px-12 py-4 rounded-xl font-bold text-lg hover:from-blue-50 hover:to-white transition-all duration-300 shadow-2xl transform hover:scale-105 hover:shadow-white/25"
                            >
                                <span className="flex items-center justify-center space-x-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <span>Search Vehicles</span>
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Modern Results Section */}
            {showResults && (
                <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Available Vehicles</h2>
                            <p className="text-xl text-gray-600">Choose from our premium fleet of vehicles</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredVehicles.map((vehicle) => (
                                <div key={vehicle.id} className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-white/50">
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={vehicle.image}
                                            alt={vehicle.name}
                                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="text-sm font-semibold text-gray-700">{vehicle.rating}</span>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                                                {vehicle.name}
                                            </h3>
                                            <p className="text-gray-600 capitalize font-medium">{vehicle.type}</p>
                                        </div>

                                        <div className="mb-6">
                                            <div className="flex flex-wrap gap-2">
                                                {vehicle.features.map((feature, index) => (
                                                    <span key={index} className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200">
                                                        {feature}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-baseline space-x-1">
                                                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                                                    ${vehicle.pricePerDay}
                                                </span>
                                                <span className="text-gray-600 font-medium">/day</span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-green-600">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm font-medium">Available</span>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/vehicle-details/${vehicle.id}`}
                                            state={{ vehicle, withDriver: searchData.withDriver, drivers: mockDrivers }}
                                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-center block shadow-lg hover:shadow-xl transform hover:scale-105"
                                        >
                                            <span className="flex items-center justify-center space-x-2">
                                                <span>Select Vehicle</span>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredVehicles.length === 0 && (
                            <div className="text-center py-16">
                                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-xl border border-white/50">
                                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.469-.935-6.03-2.461" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">No vehicles found</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Try adjusting your search criteria to find available vehicles that match your needs.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Professional Footer */}
            <footer className="bg-gradient-to-br from-slate-900 via-gray-900 to-blue-900 text-white relative overflow-hidden">
                {/* Background Pattern */}
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
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {/* Company Info */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center space-x-4 mb-8">
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
                            <p className="text-gray-300 leading-relaxed max-w-md mb-8 text-lg">
                                Your trusted partner for premium vehicle rental services. Experience convenience, reliability, and excellence in every journey with our modern fleet and professional service.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all duration-300 hover:scale-110 group">
                                    <svg className="w-5 h-5 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                    </svg>
                                </a>
                                <a href="#" className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all duration-300 hover:scale-110 group">
                                    <svg className="w-5 h-5 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                                    </svg>
                                </a>
                                <a href="#" className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all duration-300 hover:scale-110 group">
                                    <svg className="w-5 h-5 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                                <a href="#" className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all duration-300 hover:scale-110 group">
                                    <svg className="w-5 h-5 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.222.083.343-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-xl font-bold mb-8 text-white">Quick Links</h3>
                            <ul className="space-y-4">
                                <li><a href="/" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                                    <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                                    Home
                                </a></li>
                                <li><a href="/vehicle-rental" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                                    <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                                    Vehicle Fleet
                                </a></li>
                                <li><a href="/about" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                                    <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                                    About Us
                                </a></li>
                                <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                                    <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                                    Contact
                                </a></li>
                                <li><a href="/support" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                                    <span className="w-1 h-1 bg-blue-400 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                                    Support
                                </a></li>
                            </ul>
                        </div>

                        {/* Services */}
                        <div>
                            <h3 className="text-xl font-bold mb-8 text-white">Services</h3>
                            <ul className="space-y-4">
                                <li><a href="/self-drive" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                                    <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                                    Self Drive
                                </a></li>
                                <li><a href="/chauffeur" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                                    <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                                    Chauffeur Service
                                </a></li>
                                <li><a href="/long-term" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                                    <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                                    Long-term Rental
                                </a></li>
                                <li><a href="/corporate" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                                    <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                                    Corporate Plans
                                </a></li>
                                <li><a href="/insurance" className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center group">
                                    <span className="w-1 h-1 bg-green-400 rounded-full mr-3 group-hover:w-2 transition-all duration-300"></span>
                                    Insurance
                                </a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact Info & Newsletter */}
                    <div className="border-t border-white/10 pt-12 mt-12">
                        <div className="grid md:grid-cols-2 gap-12">
                            {/* Contact Info */}
                            <div>
                                <h3 className="text-xl font-bold mb-6 text-white">Contact Information</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center text-gray-300">
                                        <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center mr-4">
                                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold">+94 77 123 4567</p>
                                            <p className="text-sm text-gray-400">24/7 Customer Support</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-gray-300">
                                        <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center mr-4">
                                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold">info@pickandgo.lk</p>
                                            <p className="text-sm text-gray-400">General Inquiries</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start text-gray-300">
                                        <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold">123 Main Street, Colombo 07</p>
                                            <p className="text-sm text-gray-400">Sri Lanka</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Newsletter */}
                            <div>
                                <h3 className="text-xl font-bold mb-6 text-white">Stay Updated</h3>
                                <p className="text-gray-300 mb-6">Subscribe to our newsletter for exclusive offers and updates on new vehicles.</p>
                                <div className="flex space-x-3">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                    />
                                    <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-white/10 pt-8 mt-12">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <p className="text-gray-400 text-center md:text-left">
                                &copy; 2025 Pick & Go. All rights reserved. |
                                <a href="/privacy" className="hover:text-white transition-colors duration-300 ml-1">Privacy Policy</a> |
                                <a href="/terms" className="hover:text-white transition-colors duration-300 ml-1">Terms of Service</a>
                            </p>
                            <div className="flex items-center space-x-6 text-gray-400">
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Secure & Trusted
                                </span>
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    SSL Protected
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default VehicleRental
