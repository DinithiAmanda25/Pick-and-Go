import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import PackageService from '../../Services/package-service'

const PackageSlider = () => {
  const [packages, setPackages] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load packages on component mount
  useEffect(() => {
    loadPackages()
  }, [])

  const loadPackages = async () => {
    try {
      // For now, we'll use mock data since we need packages from all business owners
      // In a real implementation, you'd create an endpoint to get all active packages
      const mockPackages = [
        {
          _id: '1',
          name: 'City Explorer Package',
          duration: '1 Day',
          price: 2500,
          discount: 15,
          features: ['GPS Navigation', 'Free Fuel', '24/7 Support', 'Insurance Included'],
          vehicles: [
            { make: 'Toyota', model: 'Corolla', year: 2023 },
            { make: 'Honda', model: 'Civic', year: 2022 }
          ],
          businessOwner: { businessName: 'City Car Rentals' },
          isActive: true
        },
        {
          _id: '2',
          name: 'Weekend Getaway',
          duration: '2 Days',
          price: 4500,
          discount: 20,
          features: ['Premium Vehicle', 'Driver Service', 'Airport Pickup', 'Unlimited Mileage'],
          vehicles: [
            { make: 'BMW', model: 'X3', year: 2023 },
            { make: 'Mercedes', model: 'C-Class', year: 2022 }
          ],
          businessOwner: { businessName: 'Luxury Rentals' },
          isActive: true
        },
        {
          _id: '3',
          name: 'Business Traveler',
          duration: '1 Week',
          price: 15000,
          discount: 10,
          features: ['Professional Driver', 'WiFi Enabled', 'Meeting Ready', 'Flexible Schedule'],
          vehicles: [
            { make: 'Audi', model: 'A6', year: 2023 },
            { make: 'Lexus', model: 'ES', year: 2022 }
          ],
          businessOwner: { businessName: 'Executive Cars' },
          isActive: true
        },
        {
          _id: '4',
          name: 'Family Adventure',
          duration: '3 Days',
          price: 6500,
          discount: 25,
          features: ['Child Seats Available', 'Spacious Vehicle', 'Safety First', 'Family Friendly'],
          vehicles: [
            { make: 'Toyota', model: 'Innova', year: 2023 },
            { make: 'Honda', model: 'CR-V', year: 2022 }
          ],
          businessOwner: { businessName: 'Family Rentals' },
          isActive: true
        }
      ]
      
      setPackages(mockPackages)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  // Auto-rotate packages
  useEffect(() => {
    if (packages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % packages.length)
      }, 5000) // Change every 5 seconds

      return () => clearInterval(interval)
    }
  }, [packages.length])

  const calculateDiscountedPrice = (price, discount) => {
    return price - (price * discount / 100)
  }

  const nextPackage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % packages.length)
  }

  const prevPackage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + packages.length) % packages.length)
  }

  const goToPackage = (index) => {
    setCurrentIndex(index)
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading packages...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">Error loading packages: {error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (packages.length === 0) {
    return null
  }

  const currentPackage = packages[currentIndex]

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="packageGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#packageGrid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Featured <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Packages</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our curated rental packages designed to meet your specific needs and budget
          </p>
        </motion.div>

        {/* Package Slider */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50"
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content - Package Info */}
                <div className="space-y-8">
                  <div>
                    <motion.h3
                      className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {currentPackage.name}
                    </motion.h3>
                    <motion.div
                      className="flex items-center space-x-4 mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                        {currentPackage.duration}
                      </span>
                      <span className="text-gray-600">by {currentPackage.businessOwner.businessName}</span>
                    </motion.div>
                  </div>

                  {/* Price Display */}
                  <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {currentPackage.discount > 0 ? (
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl font-bold text-green-600">
                          LKR {calculateDiscountedPrice(currentPackage.price, currentPackage.discount).toLocaleString()}
                        </span>
                        <span className="text-2xl text-gray-500 line-through">
                          LKR {currentPackage.price.toLocaleString()}
                        </span>
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {currentPackage.discount}% OFF
                        </span>
                      </div>
                    ) : (
                      <span className="text-4xl font-bold text-gray-900">
                        LKR {currentPackage.price.toLocaleString()}
                      </span>
                    )}
                  </motion.div>

                  {/* Features */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Package Features:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {currentPackage.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center space-x-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Vehicles */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Vehicles:</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentPackage.vehicles.map((vehicle, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {vehicle.make} {vehicle.model} ({vehicle.year})
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Link
                      to="/vehicle-rental"
                      className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Book This Package
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </motion.div>
                </div>

                {/* Right Content - Visual Element */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="20" fill="white" />
                        <circle cx="150" cy="100" r="15" fill="white" />
                        <circle cx="100" cy="150" r="25" fill="white" />
                      </svg>
                    </div>
                    
                    <div className="relative z-10 text-center">
                      <motion.div
                        className="text-6xl mb-6"
                        animate={{ rotate: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        🚗
                      </motion.div>
                      <h4 className="text-2xl font-bold mb-4">Premium Experience</h4>
                      <p className="text-blue-100 mb-6">
                        Experience the convenience of our curated packages with professional service and modern vehicles.
                      </p>
                      <div className="flex justify-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">500+</div>
                          <div className="text-sm text-blue-200">Vehicles</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">24/7</div>
                          <div className="text-sm text-blue-200">Support</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">100%</div>
                          <div className="text-sm text-blue-200">Safe</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            {/* Previous Button */}
            <motion.button
              onClick={prevPackage}
              className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            {/* Dots Indicator */}
            <div className="flex space-x-2">
              {packages.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToPackage(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-blue-600 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            {/* Next Button */}
            <motion.button
              onClick={nextPackage}
              className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PackageSlider

