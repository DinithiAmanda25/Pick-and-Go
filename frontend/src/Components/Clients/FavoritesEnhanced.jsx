import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function FavoritesEnhanced() {
    const [favorites, setFavorites] = useState([
        {
            id: 101,
            name: 'Toyota Camry 2023',
            image: '/api/placeholder/400/200',
            type: 'Sedan',
            pricePerDay: 75,
            rating: 4.8,
            reviews: 124,
            features: ['AC', 'GPS', 'Bluetooth', 'Automatic'],
            owner: 'Premium Rentals',
            location: 'Downtown',
            availability: 'Available',
            addedDate: '2024-01-10'
        },
        {
            id: 102,
            name: 'Honda CR-V 2022',
            image: '/api/placeholder/400/200',
            type: 'SUV',
            pricePerDay: 95,
            rating: 4.6,
            reviews: 89,
            features: ['AC', 'GPS', 'AWD', 'Backup Camera'],
            owner: 'City Cars',
            location: 'Airport',
            availability: 'Available',
            addedDate: '2024-01-15'
        },
        {
            id: 103,
            name: 'BMW X3 2023',
            image: '/api/placeholder/400/200',
            type: 'Luxury SUV',
            pricePerDay: 150,
            rating: 4.9,
            reviews: 67,
            features: ['AC', 'GPS', 'Leather Seats', 'Premium Audio'],
            owner: 'Luxury Fleet',
            location: 'City Center',
            availability: 'Booked',
            addedDate: '2024-01-20'
        }
    ])

    const [sortBy, setSortBy] = useState('recent')
    const [filterBy, setFilterBy] = useState('all')

    const handleRemoveFavorite = (id) => {
        if (window.confirm('Remove this vehicle from your favorites?')) {
            setFavorites(prev => prev.filter(fav => fav.id !== id))
        }
    }

    const handleBookNow = (vehicle) => {
        if (vehicle.availability === 'Available') {
            alert(`Booking ${vehicle.name} - Redirecting to checkout...`)
            // In a real app, this would navigate to booking page
        } else {
            alert('This vehicle is currently not available for booking.')
        }
    }

    const handleViewDetails = (vehicle) => {
        alert(`Viewing details for ${vehicle.name}`)
        // In a real app, this would navigate to vehicle details page
    }

    const filteredFavorites = favorites.filter(vehicle => {
        if (filterBy === 'all') return true
        if (filterBy === 'available') return vehicle.availability === 'Available'
        if (filterBy === 'sedan') return vehicle.type.toLowerCase().includes('sedan')
        if (filterBy === 'suv') return vehicle.type.toLowerCase().includes('suv')
        if (filterBy === 'luxury') return vehicle.type.toLowerCase().includes('luxury')
        return true
    })

    const sortedFavorites = [...filteredFavorites].sort((a, b) => {
        switch (sortBy) {
            case 'recent':
                return new Date(b.addedDate) - new Date(a.addedDate)
            case 'price-low':
                return a.pricePerDay - b.pricePerDay
            case 'price-high':
                return b.pricePerDay - a.pricePerDay
            case 'rating':
                return b.rating - a.rating
            case 'name':
                return a.name.localeCompare(b.name)
            default:
                return 0
        }
    })

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
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-2">My Favorite Vehicles</h2>
                <p className="text-pink-100">Keep track of vehicles you love and book them quickly</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="bg-pink-400 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                        Total Favorites: {favorites.length}
                    </span>
                    <span className="bg-pink-400 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                        Available: {favorites.filter(v => v.availability === 'Available').length}
                    </span>
                </div>
            </div>

            {/* Filters and Sorting */}
            <div className="bg-white rounded-lg p-4 shadow-md">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by</label>
                            <select
                                value={filterBy}
                                onChange={(e) => setFilterBy(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            >
                                <option value="all">All Vehicles</option>
                                <option value="available">Available Only</option>
                                <option value="sedan">Sedans</option>
                                <option value="suv">SUVs</option>
                                <option value="luxury">Luxury</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            >
                                <option value="recent">Recently Added</option>
                                <option value="name">Name (A-Z)</option>
                                <option value="price-low">Price (Low to High)</option>
                                <option value="price-high">Price (High to Low)</option>
                                <option value="rating">Highest Rated</option>
                            </select>
                        </div>
                    </div>

                    <div className="text-sm text-gray-600">
                        Showing {sortedFavorites.length} of {favorites.length} favorites
                    </div>
                </div>
            </div>

            {/* Favorites Grid */}
            {sortedFavorites.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites found</h3>
                    <p className="text-gray-600 mb-4">
                        {filterBy === 'all' ? "You haven't added any vehicles to your favorites yet." : "No favorites match your current filter."}
                    </p>
                    <button
                        onClick={() => setFilterBy('all')}
                        className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
                    >
                        {filterBy === 'all' ? 'Browse Vehicles' : 'Clear Filters'}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedFavorites.map((vehicle, index) => (
                        <motion.div
                            key={vehicle.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="relative">
                                <img
                                    src={vehicle.image}
                                    alt={vehicle.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${vehicle.availability === 'Available'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {vehicle.availability}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveFavorite(vehicle.id)}
                                        className="bg-white bg-opacity-90 p-1 rounded-full text-red-500 hover:text-red-700 hover:bg-white transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded-full text-sm font-semibold text-pink-600">
                                    ${vehicle.pricePerDay}/day
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="font-semibold text-lg text-gray-900 mb-1">{vehicle.name}</h3>
                                <p className="text-gray-600 text-sm mb-2">{vehicle.type} • by {vehicle.owner}</p>
                                <p className="text-gray-600 text-sm mb-3">{vehicle.location}</p>

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

                                <p className="text-xs text-gray-500 mt-2">
                                    Added {new Date(vehicle.addedDate).toLocaleDateString()}
                                </p>

                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => handleViewDetails(vehicle)}
                                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => handleBookNow(vehicle)}
                                        disabled={vehicle.availability !== 'Available'}
                                        className={`flex-1 px-3 py-2 rounded-md focus:outline-none focus:ring-2 text-sm ${vehicle.availability === 'Available'
                                                ? 'bg-pink-600 text-white hover:bg-pink-700 focus:ring-pink-500'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {vehicle.availability === 'Available' ? 'Book Now' : 'Not Available'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="bg-pink-50 border border-pink-200 text-pink-700 px-4 py-3 rounded-lg hover:bg-pink-100 transition-colors">
                        <div className="text-center">
                            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <p className="font-medium">Search More Vehicles</p>
                        </div>
                    </button>

                    <button className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors">
                        <div className="text-center">
                            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="font-medium">View My Bookings</p>
                        </div>
                    </button>

                    <button className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg hover:bg-green-100 transition-colors">
                        <div className="text-center">
                            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="font-medium">Get Recommendations</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}
