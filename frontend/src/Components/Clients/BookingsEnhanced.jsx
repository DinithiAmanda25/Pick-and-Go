import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function BookingsEnhanced({ mockBookings, onCancelBooking, onModifyBooking, onViewDetails, downloadInvoice }) {
    const [filter, setFilter] = useState('all')
    const [sortBy, setSortBy] = useState('date')
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [cancelReason, setCancelReason] = useState('')
    const [showModifyModal, setShowModifyModal] = useState(false)
    const [modificationDetails, setModificationDetails] = useState({})
    const navigate = useNavigate()

    const handleViewAllFeedback = () => {
        navigate('/feedback')
    }

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
            case 'pending':
                return 'bg-orange-100 text-orange-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    // Safety check for mockBookings
    const bookingsArray = mockBookings || []

    const filteredBookings = bookingsArray.filter(booking => {
        if (filter === 'all') return true
        return booking.status === filter
    })

    const sortedBookings = [...filteredBookings].sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return new Date(b.pickupDate) - new Date(a.pickupDate)
            case 'status':
                return a.status.localeCompare(b.status)
            case 'amount':
                return b.totalAmount - a.totalAmount
            default:
                return 0
        }
    })

    const handleCancelBooking = (booking) => {
        setSelectedBooking(booking)
        setShowCancelModal(true)
    }

    const confirmCancellation = () => {
        if (cancelReason.trim()) {
            onCancelBooking && onCancelBooking(selectedBooking.id, cancelReason)
            setShowCancelModal(false)
            setCancelReason('')
            setSelectedBooking(null)
        }
    }

    const handleModifyBooking = (booking) => {
        setSelectedBooking(booking)
        setModificationDetails({
            pickupDate: booking.pickupDate,
            dropoffDate: booking.dropoffDate,
            pickupTime: booking.pickupTime || '10:00',
            dropoffTime: booking.dropoffTime || '10:00'
        })
        setShowModifyModal(true)
    }

    const confirmModification = () => {
        onModifyBooking && onModifyBooking(selectedBooking.id, modificationDetails)
        setShowModifyModal(false)
        setModificationDetails({})
        setSelectedBooking(null)
    }

    const calculateDuration = (pickup, dropoff) => {
        const days = Math.ceil((new Date(dropoff) - new Date(pickup)) / (1000 * 60 * 60 * 24))
        return days
    }

    const canCancelOrModify = (booking) => {
        return ['confirmed', 'pending'].includes(booking.status)
    }

    const canViewInvoice = (booking) => {
        return ['completed', 'ongoing'].includes(booking.status)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-2">My Bookings</h2>
                <p className="text-green-100">Manage your vehicle reservations and track booking history</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="bg-green-400 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                        Total Bookings: {bookingsArray.length}
                    </span>
                    <span className="bg-green-400 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                        Active: {bookingsArray.filter(b => ['confirmed', 'ongoing'].includes(b.status)).length}
                    </span>
                </div>
            </div>

            {/* Filters and Sorting */}
            <div className="bg-white rounded-lg p-4 shadow-md">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Bookings</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="date">Booking Date</option>
                                <option value="status">Status</option>
                                <option value="amount">Amount</option>
                            </select>
                        </div>
                        {/* View All Feedback Button at the flex end */}
                        <div className="ml-auto">
                            <div><h1>Customer Feedback</h1>
                                <p>View and manage customer feedback for your bookings</p>
                                <button
                                    onClick={handleViewAllFeedback}
                                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    View All Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
                {sortedBookings.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg shadow-md">
                        <div className="text-gray-400 mb-2">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="text-gray-600">No bookings found for the selected filter</p>
                    </div>
                ) : (
                    sortedBookings.map((booking) => (
                        <motion.div
                            key={booking.id}
                            className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
                            whileHover={{ scale: 1.01 }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start space-x-4">
                                    <img
                                        src={booking.vehicle.image}
                                        alt={booking.vehicle.name}
                                        className="w-24 h-20 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {booking.vehicle.name}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                            <div>
                                                <p><strong>Booking ID:</strong> #{booking.id}</p>
                                                <p><strong>Pickup:</strong> {new Date(booking.pickupDate).toLocaleDateString()}</p>
                                                <p><strong>Dropoff:</strong> {new Date(booking.dropoffDate).toLocaleDateString()}</p>
                                                <p><strong>Duration:</strong> {calculateDuration(booking.pickupDate, booking.dropoffDate)} days</p>
                                            </div>

                                            <div>
                                                <p><strong>Total Amount:</strong> <span className="text-lg font-semibold text-green-600">${booking.totalAmount}</span></p>
                                                <p><strong>Booking Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                                                {booking.withDriver && booking.driver && (
                                                    <div className="flex items-center mt-2">
                                                        <img
                                                            src={booking.driver.image || '/api/placeholder/30/30'}
                                                            alt={booking.driver.name}
                                                            className="w-6 h-6 rounded-full mr-2"
                                                        />
                                                        <span>Driver: {booking.driver.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => onViewDetails && onViewDetails(booking)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    View Details
                                </button>

                                {canViewInvoice(booking) && (
                                    <button
                                        onClick={() => downloadInvoice && downloadInvoice(booking.invoiceId)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                    >
                                        Download Invoice
                                    </button>
                                )}

                                {canCancelOrModify(booking) && (
                                    <>
                                        <button
                                            onClick={() => handleModifyBooking(booking)}
                                            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                        >
                                            Modify
                                        </button>

                                        <button
                                            onClick={() => handleCancelBooking(booking)}
                                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Booking</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to cancel your booking for {selectedBooking?.vehicle.name}?
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for cancellation *
                            </label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                placeholder="Please provide a reason for cancellation"
                                required
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                            >
                                Keep Booking
                            </button>
                            <button
                                onClick={confirmCancellation}
                                disabled={!cancelReason.trim()}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                Cancel Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modify Modal */}
            {showModifyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Modify Booking</h3>
                        <p className="text-gray-600 mb-4">
                            Update your booking details for {selectedBooking?.vehicle.name}
                        </p>

                        <div className="space-y-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                                <input
                                    type="date"
                                    value={modificationDetails.pickupDate}
                                    onChange={(e) => setModificationDetails(prev => ({ ...prev, pickupDate: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dropoff Date</label>
                                <input
                                    type="date"
                                    value={modificationDetails.dropoffDate}
                                    onChange={(e) => setModificationDetails(prev => ({ ...prev, dropoffDate: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Time</label>
                                    <input
                                        type="time"
                                        value={modificationDetails.pickupTime}
                                        onChange={(e) => setModificationDetails(prev => ({ ...prev, pickupTime: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dropoff Time</label>
                                    <input
                                        type="time"
                                        value={modificationDetails.dropoffTime}
                                        onChange={(e) => setModificationDetails(prev => ({ ...prev, dropoffTime: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModifyModal(false)}
                                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmModification}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Update Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
