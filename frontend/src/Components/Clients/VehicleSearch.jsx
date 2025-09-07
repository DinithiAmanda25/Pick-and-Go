import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function VehicleSearch({ onBookVehicle }) {
    const [searchCriteria, setSearchCriteria] = useState({
        pickupLocation: '',
        dropoffLocation: '',
        pickupDate: '',
        pickupTime: '',
        dropoffDate: '',
        dropoffTime: '',
        vehicleType: '',
        withDriver: false,
        priceRange: [0, 500],
        features: []
    })

    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [selectedVehicle, setSelectedVehicle] = useState(null)

    // Mock vehicle data
    const mockVehicles = [
        {
            id: 1,
            name: 'Toyota Camry 2023',
            type: 'Sedan',
            image: '/api/placeholder/400/250',
            pricePerDay: 75,
            rating: 4.8,
            reviews: 124,
            features: ['AC', 'GPS', 'Bluetooth', 'Automatic'],
            fuel: 'Petrol',
            seats: 5,
            transmission: 'Automatic',
            owner: 'Premium Rentals',
            availability: 'Available',
            location: 'Downtown',
            driverAvailable: true
        },
        {
            id: 2,
            name: 'Honda CR-V 2022',
            type: 'SUV',
            image: '/api/placeholder/400/250',
            pricePerDay: 95,
            rating: 4.6,
            reviews: 89,
            features: ['AC', 'GPS', 'AWD', 'Backup Camera'],
            fuel: 'Petrol',
            seats: 7,
            transmission: 'Automatic',
            owner: 'City Cars',
            availability: 'Available',
            location: 'Airport',
            driverAvailable: true
        },
        {
            id: 3,
            name: 'BMW X3 2023',
            type: 'Luxury SUV',
            image: '/api/placeholder/400/250',
            pricePerDay: 150,
            rating: 4.9,
            reviews: 67,
            features: ['AC', 'GPS', 'Leather Seats', 'Premium Audio'],
            fuel: 'Petrol',
            seats: 5,
            transmission: 'Automatic',
            owner: 'Luxury Fleet',
            availability: 'Available',
            location: 'City Center',
            driverAvailable: true
        }
    ]

    const vehicleTypes = ['All Types', 'Sedan', 'SUV', 'Hatchback', 'Luxury', 'Van', 'Truck']
    const availableFeatures = ['AC', 'GPS', 'Bluetooth', 'Automatic', 'AWD', 'Backup Camera', 'Leather Seats', 'Premium Audio']

    const handleSearch = () => {
        setIsSearching(true)
        // Simulate API call
        setTimeout(() => {
            let filtered = mockVehicles

            if (searchCriteria.vehicleType && searchCriteria.vehicleType !== 'All Types') {
                filtered = filtered.filter(vehicle =>
                    vehicle.type.toLowerCase().includes(searchCriteria.vehicleType.toLowerCase())
                )
            }

            if (searchCriteria.withDriver) {
                filtered = filtered.filter(vehicle => vehicle.driverAvailable)
            }

            filtered = filtered.filter(vehicle =>
                vehicle.pricePerDay >= searchCriteria.priceRange[0] &&
                vehicle.pricePerDay <= searchCriteria.priceRange[1]
            )

            if (searchCriteria.features.length > 0) {
                filtered = filtered.filter(vehicle =>
                    searchCriteria.features.every(feature => vehicle.features.includes(feature))
                )
            }

            setSearchResults(filtered)
            setIsSearching(false)
        }, 1000)
    }

    const handleInputChange = (field, value) => {
        setSearchCriteria(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleFeatureToggle = (feature) => {
        setSearchCriteria(prev => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter(f => f !== feature)
                : [...prev.features, feature]
        }))
    }

    const renderStars = (rating) => {
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
                <span className="ml-1 text-sm text-gray-600">({rating})</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-2">Find Your Perfect Vehicle</h2>
                <p className="text-blue-100">Search and compare vehicles from trusted owners</p>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
                        <input
                            type="text"
                            value={searchCriteria.pickupLocation}
                            onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter pickup location"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
                        <input
                            type="date"
                            value={searchCriteria.pickupDate}
                            onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
                        <input
                            type="time"
                            value={searchCriteria.pickupTime}
                            onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                        <select
                            value={searchCriteria.vehicleType}
                            onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {vehicleTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dropoff Location</label>
                        <input
                            type="text"
                            value={searchCriteria.dropoffLocation}
                            onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter dropoff location"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dropoff Date</label>
                        <input
                            type="date"
                            value={searchCriteria.dropoffDate}
                            onChange={(e) => handleInputChange('dropoffDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dropoff Time</label>
                        <input
                            type="time"
                            value={searchCriteria.dropoffTime}
                            onChange={(e) => handleInputChange('dropoffTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="withDriver"
                            checked={searchCriteria.withDriver}
                            onChange={(e) => handleInputChange('withDriver', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="withDriver" className="ml-2 block text-sm text-gray-900">
                            Include Driver
                        </label>
                    </div>
                </div>

                {/* Advanced Filters */}
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        {showFilters ? 'Hide' : 'Show'} Advanced Filters
                    </button>

                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {isSearching ? 'Searching...' : 'Search Vehicles'}
                    </button>
                </div>

                {showFilters && (
                    <div className="border-t pt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price Range: ${searchCriteria.priceRange[0]} - ${searchCriteria.priceRange[1]}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="500"
                                value={searchCriteria.priceRange[1]}
                                onChange={(e) => handleInputChange('priceRange', [0, parseInt(e.target.value)])}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                            <div className="flex flex-wrap gap-2">
                                {availableFeatures.map(feature => (
                                    <button
                                        key={feature}
                                        onClick={() => handleFeatureToggle(feature)}
                                        className={`px-3 py-1 rounded-full text-sm ${searchCriteria.features.includes(feature)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {feature}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Found {searchResults.length} vehicle(s)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map(vehicle => (
                            <motion.div
                                key={vehicle.id}
                                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="relative">
                                    <img
                                        src={vehicle.image}
                                        alt={vehicle.name}
                                        className="w-full h-48 object-cover rounded-t-lg"
                                    />
                                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-semibold text-green-600">
                                        ${vehicle.pricePerDay}/day
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h4 className="font-semibold text-lg text-gray-900 mb-1">{vehicle.name}</h4>
                                    <p className="text-gray-600 text-sm mb-2">{vehicle.type} • {vehicle.seats} seats</p>

                                    {renderStars(vehicle.rating)}
                                    <p className="text-xs text-gray-500 mt-1">{vehicle.reviews} reviews</p>

                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {vehicle.features.slice(0, 3).map(feature => (
                                            <span key={feature} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                                {feature}
                                            </span>
                                        ))}
                                        {vehicle.features.length > 3 && (
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                                +{vehicle.features.length - 3} more
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-600">by {vehicle.owner}</p>
                                            <p className="text-xs text-green-600">{vehicle.availability}</p>
                                        </div>

                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setSelectedVehicle(vehicle)}
                                                className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => onBookVehicle && onBookVehicle(vehicle)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {searchResults.length === 0 && !isSearching && (
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-600">Start your search to find available vehicles</p>
                </div>
            )}

            {/* Vehicle Details Modal */}
            {selectedVehicle && (
                <div className="fixed inset-0 bg-gradient-to-br from-gray-900/60 via-slate-900/60 to-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-100">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-bold">{selectedVehicle.name}</h2>
                                    <div className="flex items-center mt-2">
                                        <div className="flex items-center mr-4">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-5 h-5 ${i < Math.floor(selectedVehicle.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                            <span className="text-blue-100 ml-2">{selectedVehicle.rating} ({selectedVehicle.reviews} reviews)</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedVehicle(null)}
                                    className="text-white hover:text-blue-200 transition-colors"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Price Badge */}
                            <div className="mt-4">
                                <span className="bg-white text-blue-700 px-6 py-3 rounded-full text-xl font-bold shadow-md">
                                    ${selectedVehicle.pricePerDay}/day
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto max-h-[75vh]">
                            {/* Vehicle Image */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="relative">
                                    <img
                                        src={selectedVehicle.image}
                                        alt={selectedVehicle.name}
                                        className="w-full h-80 object-cover rounded-xl shadow-lg"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            {selectedVehicle.availability}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Specifications */}
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Vehicle Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                                        <div className="flex items-center mb-3">
                                            <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                            <h4 className="font-semibold text-blue-900">Basic Info</h4>
                                        </div>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Type:</span>
                                                <span className="font-medium text-blue-900">{selectedVehicle.type}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Seating:</span>
                                                <span className="font-medium text-blue-900">{selectedVehicle.seats} passengers</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Fuel Type:</span>
                                                <span className="font-medium text-blue-900">{selectedVehicle.fuel}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Transmission:</span>
                                                <span className="font-medium text-blue-900">{selectedVehicle.transmission}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                                        <div className="flex items-center mb-3">
                                            <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <h4 className="font-semibold text-green-900">Location & Owner</h4>
                                        </div>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-green-700">Location:</span>
                                                <span className="font-medium text-green-900">{selectedVehicle.location}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-700">Owner:</span>
                                                <span className="font-medium text-green-900">{selectedVehicle.owner}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-700">Driver Available:</span>
                                                <span className="font-medium text-green-900">
                                                    {selectedVehicle.driverAvailable ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-green-700">Status:</span>
                                                <span className="font-medium text-green-900">{selectedVehicle.availability}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                                        <div className="flex items-center mb-3">
                                            <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                            <h4 className="font-semibold text-purple-900">Pricing</h4>
                                        </div>
                                        <div className="space-y-3 text-sm">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-purple-900">${selectedVehicle.pricePerDay}</div>
                                                <div className="text-purple-700 font-medium">Per Day</div>
                                            </div>
                                            <div className="border-t border-purple-200 pt-3">
                                                <div className="flex justify-between">
                                                    <span className="text-purple-700">Weekly Rate:</span>
                                                    <span className="font-medium text-purple-900">${selectedVehicle.pricePerDay * 6.5}/week</span>
                                                </div>
                                                <div className="flex justify-between mt-1">
                                                    <span className="text-purple-700">Monthly Rate:</span>
                                                    <span className="font-medium text-purple-900">${selectedVehicle.pricePerDay * 25}/month</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Features & Equipment */}
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Features & Equipment</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {selectedVehicle.features.map((feature, index) => (
                                        <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-900">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rental Terms */}
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Rental Terms</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Included</h4>
                                            <ul className="space-y-1 text-gray-700">
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Basic insurance coverage
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    24/7 roadside assistance
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Free cancellation (24h notice)
                                                </li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                                            <ul className="space-y-1 text-gray-700">
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                                    </svg>
                                                    Valid driver's license
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                                    </svg>
                                                    Minimum age 21 years
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                                    </svg>
                                                    Security deposit required
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-gray-50 p-6 border-t flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">${selectedVehicle.pricePerDay}</div>
                                    <div className="text-sm text-gray-600">per day</div>
                                </div>
                                {selectedVehicle.driverAvailable && (
                                    <div className="text-center border-l border-gray-300 pl-4">
                                        <div className="text-lg font-semibold text-green-600">+$25</div>
                                        <div className="text-sm text-gray-600">with driver</div>
                                    </div>
                                )}
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setSelectedVehicle(null)}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        onBookVehicle && onBookVehicle(selectedVehicle);
                                        setSelectedVehicle(null);
                                    }}
                                    className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Book This Vehicle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
