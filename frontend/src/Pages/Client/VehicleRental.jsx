import React, { useState, useEffect } from 'react'
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

    const API_BASE_URL =  'http://localhost:9000'

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

    const [vehicles, setVehicles] = useState([])
    const [filteredVehicles, setFilteredVehicles] = useState([])
    const [availableDrivers, setAvailableDrivers] = useState([])
    const [showResults, setShowResults] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [validationErrors, setValidationErrors] = useState({})

    // Fetch available drivers from API

    // Fetch available vehicles on component mount
    useEffect(() => {
        fetchAvailableVehicles()
    }, [])

    // Set minimum dates
    useEffect(() => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const minDate = tomorrow.toISOString().split('T')[0]
        
        if (!searchData.pickupDate) {
            setSearchData(prev => ({ ...prev, pickupDate: minDate }))
        }
    }, [])

    const fetchAvailableVehicles = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/api/vehicles/available/rental`)
            const data = await response.json()
            
            if (data.success) {
                setVehicles(data.vehicles)
            } else {
                setError('Failed to fetch vehicles')
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error)
            setError('Failed to fetch vehicles. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchAvailableDrivers = async (vehicleType, startDate, endDate) => {
        try {
            setIsLoading(true)
            
            // Fetch all approved drivers from API - using the correct endpoint
            const response = await fetch(`${API_BASE_URL}/api/drivers/all`)
            const data = await response.json()
            
            if (data.success && data.drivers) {
                // Filter drivers based on vehicle type and status
                const filteredDrivers = data.drivers.filter(driver => 
                    driver.status === 'approved' && 
                    driver.isActive === true &&
                    // Check if driver's vehicle type matches or if no specific type filter
                    (!vehicleType || 
                     !driver.vehicleInfo?.type || 
                     driver.vehicleInfo.type === vehicleType ||
                     vehicleType === '')
                ).map(driver => ({
                    _id: driver._id,
                    id: driver._id, // Ensure both _id and id are available
                    name: driver.fullName,
                    fullName: driver.fullName,
                    rating: driver.rating || 4.5,
                    experience: `${driver.totalDeliveries || 0} trips`, // Use actual data
                    pricePerDay: 2000, // Default driver price per day (could be dynamic)
                    image: driver.profileImage?.url || '/api/placeholder/80/80',
                    phone: driver.phone,
                    email: driver.email,
                    vehicleTypes: [driver.vehicleInfo?.type || 'car']
                }))
                
                console.log('Fetched drivers:', filteredDrivers)
                setAvailableDrivers(filteredDrivers)
            } else {
                console.error('Failed to fetch drivers:', data.message)
                setAvailableDrivers([])
                if (data.message) {
                    setError(`Failed to load drivers: ${data.message}`)
                }
            }
        } catch (error) {
            console.error('Error fetching drivers:', error)
            setAvailableDrivers([])
            
            // For now, let's use some fallback drivers until the API is fixed
            console.log('Using fallback drivers due to API error')
            const fallbackDrivers = [
                {
                    _id: '507f1f77bcf86cd799439011',
                    id: '507f1f77bcf86cd799439011',
                    name: 'John Smith',
                    fullName: 'John Smith',
                    rating: 4.8,
                    experience: '50 trips',
                    pricePerDay: 2000,
                    image: '/api/placeholder/80/80',
                    phone: '+94 77 123 4567',
                    email: 'john.smith@example.com',
                    vehicleTypes: ['car', 'van']
                },
                {
                    _id: '507f1f77bcf86cd799439012',
                    id: '507f1f77bcf86cd799439012',
                    name: 'Sarah Johnson',
                    fullName: 'Sarah Johnson',
                    rating: 4.9,
                    experience: '75 trips',
                    pricePerDay: 2500,
                    image: '/api/placeholder/80/80',
                    phone: '+94 77 234 5678',
                    email: 'sarah.johnson@example.com',
                    vehicleTypes: ['car', 'truck']
                },
                {
                    _id: '507f1f77bcf86cd799439013',
                    id: '507f1f77bcf86cd799439013',
                    name: 'Mike Wilson',
                    fullName: 'Mike Wilson',
                    rating: 4.7,
                    experience: '30 trips',
                    pricePerDay: 1800,
                    image: '/api/placeholder/80/80',
                    phone: '+94 77 345 6789',
                    email: 'mike.wilson@example.com',
                    vehicleTypes: ['motorcycle', 'car']
                }
            ].filter(driver => 
                !vehicleType || driver.vehicleTypes.includes(vehicleType) || vehicleType === ''
            )
            
            setAvailableDrivers(fallbackDrivers)
        } finally {
            setIsLoading(false)
        }
    }

    const validateDates = (pickupDate, dropoffDate) => {
        const errors = {}
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const pickup = new Date(pickupDate)
        const dropoff = new Date(dropoffDate)
        
        // Check if pickup date is in the past
        if (pickup < today) {
            errors.pickupDate = 'Pickup date cannot be in the past'
        }
        
        // Check if dropoff date is before or same as pickup date
        if (dropoff <= pickup) {
            errors.dropoffDate = 'Drop-off date must be after pickup date'
        }
        
        // Check if dates are more than 90 days apart (optional business rule)
        const diffTime = Math.abs(dropoff - pickup)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays > 90) {
            errors.dropoffDate = 'Rental period cannot exceed 90 days'
        }
        
        return errors
    }

    const validateTimes = (pickupTime, dropoffTime, pickupDate, dropoffDate) => {
        const errors = {}
        
        // If pickup and dropoff are on the same day, dropoff time must be after pickup time
        if (pickupDate === dropoffDate) {
            if (dropoffTime <= pickupTime) {
                errors.dropoffTime = 'Drop-off time must be after pickup time on the same day'
            }
        }
        
        return errors
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        
        setSearchData(prevData => {
            const newData = {
                ...prevData,
                [name]: type === 'checkbox' ? checked : value
            }
            
            // Clear validation errors for the changed field
            if (validationErrors[name]) {
                setValidationErrors(prev => ({
                    ...prev,
                    [name]: undefined
                }))
            }
            
            // Auto-adjust dates when pickup date changes
            if (name === 'pickupDate' && value) {
                const pickupDate = new Date(value)
                const nextDay = new Date(pickupDate)
                nextDay.setDate(nextDay.getDate() + 1)
                
                // If dropoff date is not set or is before/same as new pickup date, set it to next day
                if (!newData.dropoffDate || new Date(newData.dropoffDate) <= pickupDate) {
                    newData.dropoffDate = nextDay.toISOString().split('T')[0]
                }
            }
            
            // Validate dates in real-time
            if ((name === 'pickupDate' || name === 'dropoffDate') && newData.pickupDate && newData.dropoffDate) {
                const dateErrors = validateDates(newData.pickupDate, newData.dropoffDate)
                setValidationErrors(prev => ({
                    ...prev,
                    ...dateErrors
                }))
            }
            
            // Validate times in real-time
            if ((name === 'pickupTime' || name === 'dropoffTime') && newData.pickupTime && newData.dropoffTime) {
                const timeErrors = validateTimes(newData.pickupTime, newData.dropoffTime, newData.pickupDate, newData.dropoffDate)
                setValidationErrors(prev => ({
                    ...prev,
                    ...timeErrors
                }))
            }
            
            return newData
        })
    }

    const handleSearch = async (e) => {
        e.preventDefault();
        
        // Validate all fields before search
        const dateErrors = validateDates(searchData.pickupDate, searchData.dropoffDate)
        const timeErrors = validateTimes(searchData.pickupTime, searchData.dropoffTime, searchData.pickupDate, searchData.dropoffDate)
        const allErrors = { ...dateErrors, ...timeErrors }
        
        if (Object.keys(allErrors).length > 0) {
            setValidationErrors(allErrors)
            setError('Please fix the validation errors before searching.')
            return
        }
        
        setIsLoading(true);
        setError('');
        setValidationErrors({});
        
        try {
            // Build query parameters
            const params = new URLSearchParams();
            if (searchData.vehicleType) params.append('vehicleType', searchData.vehicleType);
            if (searchData.pickupLocation) params.append('city', searchData.pickupLocation);
            
            const response = await fetch(`${API_BASE_URL}/api/vehicles/available/rental?${params}`);
            const data = await response.json();
            
            if (data.success) {
                setFilteredVehicles(data.vehicles);
                setShowResults(true);
                
                // Fetch available drivers if driver service is required
                if (searchData.withDriver) {
                    await fetchAvailableDrivers(searchData.vehicleType, searchData.pickupDate, searchData.dropoffDate);
                }
            } else {
                setError('Failed to search vehicles');
            }
        } catch (error) {
            console.error('Error searching vehicles:', error);
            setError('Failed to search vehicles. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    // Calculate rental duration in days
    const calculateRentalDays = () => {
        if (!searchData.pickupDate || !searchData.dropoffDate) return 1
        
        const start = new Date(searchData.pickupDate)
        const end = new Date(searchData.dropoffDate)
        const diffTime = Math.abs(end - start)
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
    }

    // Calculate total price for a vehicle
    const calculateTotalPrice = (vehicle) => {
        const days = calculateRentalDays()
        return vehicle.rentalPrice.dailyRate * days
    }

    // Calculate total price with driver if selected
    const calculateTotalPriceWithDriver = (vehicle) => {
        const days = calculateRentalDays()
        let total = vehicle.rentalPrice.dailyRate * days
        if (searchData.withDriver && availableDrivers.length > 0) {
            // Use the cheapest available driver for price display
            const cheapestDriver = availableDrivers.reduce((min, driver) => 
                driver.pricePerDay < min.pricePerDay ? driver : min
            )
            total += cheapestDriver.pricePerDay * days
        }
        return total
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
                                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Tomorrow
                                    className={`w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border ${validationErrors.pickupDate ? 'border-red-400' : 'border-white/30'} rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white transition-all duration-300`}
                                    required
                                />
                                {validationErrors.pickupDate && (
                                    <p className="text-red-300 text-sm mt-1">{validationErrors.pickupDate}</p>
                                )}
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
                                    min={searchData.pickupDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Pickup date or tomorrow
                                    className={`w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border ${validationErrors.dropoffDate ? 'border-red-400' : 'border-white/30'} rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white transition-all duration-300`}
                                    required
                                />
                                {validationErrors.dropoffDate && (
                                    <p className="text-red-300 text-sm mt-1">{validationErrors.dropoffDate}</p>
                                )}
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
                                    className={`w-full px-4 py-3.5 bg-white/20 backdrop-blur-sm border ${validationErrors.dropoffTime ? 'border-red-400' : 'border-white/30'} rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-white transition-all duration-300`}
                                    required
                                />
                                {validationErrors.dropoffTime && (
                                    <p className="text-red-300 text-sm mt-1">{validationErrors.dropoffTime}</p>
                                )}
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
                                    <option value="car" className="text-gray-900">Car</option>
                                    <option value="van" className="text-gray-900">Van</option>
                                    <option value="truck" className="text-gray-900">Truck</option>
                                    <option value="motorcycle" className="text-gray-900">Motorcycle</option>
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
                                disabled={isLoading || Object.keys(validationErrors).length > 0}
                                className="bg-gradient-to-r from-white to-blue-50 text-gray-900 px-12 py-4 rounded-xl font-bold text-lg hover:from-blue-50 hover:to-white transition-all duration-300 shadow-2xl transform hover:scale-105 hover:shadow-white/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center space-x-2">
                                        <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Searching...</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center space-x-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <span>Search Vehicles</span>
                                    </span>
                                )}
                            </motion.button>
                        </motion.div>
                    </motion.form>
                </div>
            </section>

            {/* Available Drivers Section */}
            {searchData.withDriver && availableDrivers.length > 0 && showResults && (
                <motion.section
                    className="py-16 bg-gradient-to-br from-green-50 to-blue-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <motion.div
                            className="text-center mb-12"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Available Professional Drivers
                            </h2>
                            <p className="text-xl text-gray-600">
                                Choose from our experienced and certified drivers for your rental period
                            </p>
                        </motion.div>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            variants={staggerContainer}
                            initial="hidden"
                            animate="show"
                        >
                            {availableDrivers.map((driver, index) => (
                                <motion.div
                                    key={driver._id}
                                    className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
                                    variants={fadeInUp}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                >
                                    <div className="p-8">
                                        <div className="flex items-center mb-6">
                                            <img
                                                src={driver.image}
                                                alt={driver.name}
                                                className="w-16 h-16 rounded-full object-cover shadow-lg"
                                            />
                                            <div className="ml-4">
                                                <h3 className="text-xl font-bold text-gray-900">{driver.name}</h3>
                                                <div className="flex items-center mt-1">
                                                    <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                                                        <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        <span className="text-sm font-semibold text-gray-700">{driver.rating}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-gray-600 font-medium">Experience: {driver.experience}</p>
                                            <p className="text-gray-600 font-medium">Phone: {driver.phone}</p>
                                            {driver.email && (
                                                <p className="text-gray-600 font-medium text-sm">Email: {driver.email}</p>
                                            )}
                                        </div>

                                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="text-sm text-gray-600">Price per day</span>
                                                    <div className="text-2xl font-bold text-green-600">
                                                        ${driver.pricePerDay}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm text-gray-600">Total ({calculateRentalDays()} days)</span>
                                                    <div className="text-lg font-bold text-gray-900">
                                                        ${driver.pricePerDay * calculateRentalDays()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.section>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-lg text-gray-600">Loading available vehicles...</p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                            <button 
                                onClick={fetchAvailableVehicles}
                                className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modern Results Section */}
            {showResults && !isLoading && !error && (
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
                                {filteredVehicles.length > 0 
                                    ? `Found ${filteredVehicles.length} vehicle(s) matching your criteria` 
                                    : 'No vehicles found matching your criteria'
                                }
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
                                    key={vehicle._id}
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
                                            src={vehicle.images && vehicle.images.length > 0 
                                                ? vehicle.images.find(img => img.isPrimary)?.url || vehicle.images[0].url 
                                                : '/api/placeholder/300/200'
                                            }
                                            alt={`${vehicle.make} ${vehicle.model}`}
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
                                            <span className="text-sm font-semibold text-gray-700">
                                                {vehicle.rating?.average || 4.5}
                                            </span>
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
                                                {vehicle.make} {vehicle.model}
                                            </motion.h3>
                                            <p className="text-gray-600 capitalize font-medium">{vehicle.vehicleType}</p>
                                        </motion.div>

                                        <motion.div
                                            className="mb-6"
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.1 + 0.5 }}
                                        >
                                            <div className="flex flex-wrap gap-2">
                                                {vehicle.features && vehicle.features.slice(0, 3).map((feature, featureIndex) => (
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
                                                {vehicle.features && vehicle.features.length > 3 && (
                                                    <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200">
                                                        +{vehicle.features.length - 3} more
                                                    </span>
                                                )}
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
                                                    ${vehicle.rentalPrice.dailyRate}
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

                                        {/* Driver Service Info */}
                                        {searchData.withDriver && (
                                            <motion.div
                                                className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200"
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4, delay: index * 0.1 + 0.75 }}
                                            >
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span className="text-sm font-semibold text-green-800">Professional Driver Included</span>
                                                </div>
                                                <p className="text-xs text-green-700">
                                                    Starting from ${Math.min(...availableDrivers.map(d => d.pricePerDay))}/day
                                                </p>
                                            </motion.div>
                                        )}

                                        <motion.div
                                            className="flex justify-between items-center mb-6 bg-blue-50 p-3 rounded-lg"
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.1 + 0.75 }}
                                        >
                                            <span className="text-sm text-gray-600">Total for {calculateRentalDays()} day(s):</span>
                                            <span className="text-lg font-bold text-blue-700">
                                                ${searchData.withDriver ? calculateTotalPriceWithDriver(vehicle) : calculateTotalPrice(vehicle)}
                                                {searchData.withDriver && (
                                                    <span className="text-xs text-green-600 block">+ driver from ${Math.min(...availableDrivers.map(d => d.pricePerDay * calculateRentalDays()))}</span>
                                                )}
                                            </span>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.1 + 0.8 }}
                                        >
                                            <Link
                                                to={`/vehicle-details/${vehicle._id}`}
                                                state={{ 
                                                    vehicle, 
                                                    withDriver: searchData.withDriver,
                                                    drivers: searchData.withDriver ? availableDrivers : null,
                                                    pickupDate: searchData.pickupDate,
                                                    dropoffDate: searchData.dropoffDate,
                                                    pickupTime: searchData.pickupTime,
                                                    dropoffTime: searchData.dropoffTime,
                                                    pickupLocation: searchData.pickupLocation,
                                                    dropoffLocation: searchData.dropoffLocation,
                                                    rentalDays: calculateRentalDays(),
                                                    totalPrice: calculateTotalPrice(vehicle)
                                                }}
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.469-.935-6.030-2.461" />
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
                                    <button
                                        onClick={() => setShowResults(false)}
                                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
                                    >
                                        Modify Search
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </div>
                </motion.section>
            )}

            {/* Footer */}
            <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-blue-800 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                </div>

                <div className="relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8 16.5a1.5 1.5 0 01-3 0V14h.5a.5 5 0 01.5.5v1.5zM15 16.5a1.5 1.5 0 01-3 0V14h.5a.5 5 0 01.5.5v1.5z" />
                                            <path fillRule="evenodd" d="M2 12a5 5 0 015-5h6a5 5 0 110 10H7a5 5 0 01-5-5zm5-3a3 3 0 100 6h6a3 3 0 100-6H7z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">RentWheelz</span>
                                </div>
                                <p className="text-gray-300 leading-relaxed max-w-xs">
                                    Premium vehicle rental service with a wide range of options for your travel needs. Experience luxury and convenience with us.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                                <p className="text-gray-400 text-sm">
                                    © 2023 RentWheelz. All rights reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default VehicleRental