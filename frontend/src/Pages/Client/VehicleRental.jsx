import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ClientMainHeader from '../../Components/Clients/ClientMainHeader'

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
}

const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
}

const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
}

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
}

const slideInScale = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
}

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
            {/* Use Consistent Header */}
            <ClientMainHeader />

            {/* Hero Search Section */}
            <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 text-white py-20 relative overflow-hidden">
                {/* Animated Background Pattern */}
                <motion.div
                    className="absolute inset-0 opacity-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ duration: 1 }}
                >
                    <svg className="w-full h-full" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        <motion.circle
                            cx="100" cy="100" r="60" fill="rgba(59, 130, 246, 0.1)"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.circle
                            cx="300" cy="200" r="80" fill="rgba(147, 51, 234, 0.1)"
                            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.12, 0.1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        />
                        <motion.circle
                            cx="200" cy="400" r="70" fill="rgba(16, 185, 129, 0.1)"
                            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.13, 0.1] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        />
                    </svg>
                </motion.div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <motion.h1
                            className="text-5xl lg:text-6xl font-bold mb-6"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                                Find Your Perfect Vehicle
                            </span>
                        </motion.h1>
                        <motion.p
                            className="text-xl text-blue-100/80 max-w-3xl mx-auto leading-relaxed"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            Choose from our premium fleet of vehicles with flexible rental options and professional drivers
                        </motion.p>
                    </motion.div>

                    {/* Modern Search Form */}
                    <motion.form
                        onSubmit={handleSearch}
                        className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
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
                        </motion.div>

                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                        >
                            <motion.button
                                type="submit"
                                className="bg-gradient-to-r from-white to-blue-50 text-gray-900 px-12 py-4 rounded-xl font-bold text-lg hover:from-blue-50 hover:to-white transition-all duration-300 shadow-2xl transform hover:scale-105 hover:shadow-white/25"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="flex items-center justify-center space-x-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <span>Search Vehicles</span>
                                </span>
                            </motion.button>
                        </motion.div>
                    </motion.form>
                </div>
            </section>

            {/* Modern Results Section */}
            {showResults && (
                <motion.section
                    className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <motion.h2
                                className="text-4xl font-bold text-gray-900 mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                Available Vehicles
                            </motion.h2>
                            <motion.p
                                className="text-xl text-gray-600"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                Choose from our premium fleet of vehicles
                            </motion.p>
                        </motion.div>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="show"
                        >
                            {filteredVehicles.map((vehicle, index) => (
                                <motion.div
                                    key={vehicle.id}
                                    className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/50"
                                    variants={fadeInUp}
                                    whileHover={{
                                        scale: 1.05,
                                        y: -10,
                                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="relative overflow-hidden">
                                        <motion.img
                                            src={vehicle.image}
                                            alt={vehicle.name}
                                            className="w-full h-48 object-cover"
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ duration: 0.4 }}
                                        />
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                                            initial={{ opacity: 0 }}
                                            whileHover={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        ></motion.div>
                                        <motion.div
                                            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.4, delay: index * 0.1 + 0.5 }}
                                        >
                                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="text-sm font-semibold text-gray-700">{vehicle.rating}</span>
                                        </motion.div>
                                    </div>

                                    <motion.div
                                        className="p-8"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                                    >
                                        <motion.div
                                            className="mb-6"
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
                                        >
                                            <motion.h3
                                                className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                {vehicle.name}
                                            </motion.h3>
                                            <p className="text-gray-600 capitalize font-medium">{vehicle.type}</p>
                                        </motion.div>

                                        <motion.div
                                            className="mb-6"
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.1 + 0.5 }}
                                        >
                                            <div className="flex flex-wrap gap-2">
                                                {vehicle.features.map((feature, featureIndex) => (
                                                    <motion.span
                                                        key={featureIndex}
                                                        className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200"
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ duration: 0.3, delay: index * 0.1 + 0.6 + featureIndex * 0.1 }}
                                                        whileHover={{ scale: 1.05 }}
                                                    >
                                                        {feature}
                                                    </motion.span>
                                                ))}
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            className="flex justify-between items-center mb-6"
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.1 + 0.7 }}
                                        >
                                            <div className="flex items-baseline space-x-1">
                                                <motion.span
                                                    className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent"
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    ${vehicle.pricePerDay}
                                                </motion.span>
                                                <span className="text-gray-600 font-medium">/day</span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-green-600">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-sm font-medium">Available</span>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.1 + 0.8 }}
                                        >
                                            <Link
                                                to={`/vehicle-details/${vehicle.id}`}
                                                state={{ vehicle, withDriver: searchData.withDriver, drivers: mockDrivers }}
                                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-center block shadow-lg hover:shadow-xl transform hover:scale-105"
                                            >
                                                <motion.span
                                                    className="flex items-center justify-center space-x-2"
                                                    whileHover={{ x: 5 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <span>Select Vehicle</span>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </motion.span>
                                            </Link>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {filteredVehicles.length === 0 && (
                            <motion.div
                                className="text-center py-16"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <motion.div
                                    className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-xl border border-white/50"
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.div
                                        className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6"
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    >
                                        <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.469-.935-6.03-2.461" />
                                        </svg>
                                    </motion.div>
                                    <motion.h3
                                        className="text-2xl font-bold text-gray-900 mb-4"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                    >
                                        No vehicles found
                                    </motion.h3>
                                    <motion.p
                                        className="text-gray-600 leading-relaxed"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.5 }}
                                    >
                                        Try adjusting your search criteria to find available vehicles that match your needs.
                                    </motion.p>
                                </motion.div>
                            </motion.div>
                        )}
                    </div>
                </motion.section>
            )}

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

export default VehicleRental
