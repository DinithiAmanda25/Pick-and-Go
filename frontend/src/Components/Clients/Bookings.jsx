import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function Bookings({ mockBookings }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-bold mb-2">My Bookings</h2>
        <p className="text-green-100">Manage your vehicle reservations</p>
      </motion.div>

      {/* Bookings List */}
      <div className="space-y-6">
        {mockBookings.map((booking, index) => (
          <motion.div 
            key={booking.id} 
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <motion.img
                  src={booking.vehicle.image}
                  alt={booking.vehicle.name}
                  className="w-24 h-20 object-cover rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200">
                    {booking.vehicle.name}
                  </h3>
                  <p className="text-gray-600">Booking ID: #{booking.id}</p>
                  <p className="text-gray-600">
                    {new Date(booking.pickupDate).toLocaleDateString()} - {new Date(booking.dropoffDate).toLocaleDateString()}
                  </p>
                  {booking.withDriver && (
                    <div className="flex items-center mt-2">
                      <img
                        src={booking.driver.photo}
                        alt={booking.driver.name}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span className="text-sm text-gray-600">Driver: {booking.driver.name}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
                <p className="text-lg font-semibold text-gray-900 mt-2">${booking.totalCost}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Pickup Location</p>
                  <p className="text-gray-900">{booking.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Dropoff Location</p>
                  <p className="text-gray-900">{booking.dropoffLocation}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Duration</p>
                  <p className="text-gray-900">{booking.duration} days</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Payment Method</p>
                  <p className="text-gray-900">{booking.paymentMethod}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                {booking.status === 'confirmed' && (
                  <motion.button 
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel Booking
                  </motion.button>
                )}
                {booking.status === 'ongoing' && (
                  <motion.button 
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    End Trip
                  </motion.button>
                )}
                <motion.button 
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Details
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {mockBookings.length === 0 && (
        <motion.div 
          className="text-center py-12"
          variants={itemVariants}
        >
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-500">Start exploring vehicles to make your first booking!</p>
        </motion.div>
      )}
    </motion.div>
  )
}
