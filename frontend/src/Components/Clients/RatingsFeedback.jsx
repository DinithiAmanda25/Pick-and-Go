import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function RatingsFeedback() {
    const [activeTab, setActiveTab] = useState('pending')
    const [showRatingModal, setShowRatingModal] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [rating, setRating] = useState({
        vehicle: 0,
        driver: 0,
        service: 0,
        overall: 0
    })
    const [feedback, setFeedback] = useState('')
    const [photos, setPhotos] = useState([])

    // Mock data for bookings awaiting rating
    const pendingRatings = [
        {
            id: 1,
            vehicle: {
                name: 'Toyota Camry 2023',
                image: '/api/placeholder/300/200',
                owner: 'Premium Rentals'
            },
            driver: {
                name: 'John Smith',
                image: '/api/placeholder/100/100'
            },
            bookingDate: '2024-01-15',
            completedDate: '2024-01-20',
            hasDriver: true,
            amount: 375
        },
        {
            id: 2,
            vehicle: {
                name: 'Honda CR-V 2022',
                image: '/api/placeholder/300/200',
                owner: 'City Cars'
            },
            driver: null,
            bookingDate: '2024-01-10',
            completedDate: '2024-01-15',
            hasDriver: false,
            amount: 225
        }
    ]

    // Mock data for completed ratings
    const completedRatings = [
        {
            id: 3,
            vehicle: {
                name: 'BMW X3 2023',
                image: '/api/placeholder/300/200',
                owner: 'Luxury Fleet'
            },
            driver: {
                name: 'Mike Johnson',
                image: '/api/placeholder/100/100'
            },
            ratings: {
                vehicle: 5,
                driver: 4,
                service: 5,
                overall: 5
            },
            feedback: 'Excellent experience! The car was spotless and the driver was very professional.',
            ratedDate: '2024-01-05',
            hasDriver: true,
            amount: 450,
            photos: ['/api/placeholder/150/150', '/api/placeholder/150/150']
        }
    ]

    const handleRateBooking = (booking) => {
        setSelectedBooking(booking)
        setRating({ vehicle: 0, driver: 0, service: 0, overall: 0 })
        setFeedback('')
        setPhotos([])
        setShowRatingModal(true)
    }

    const handleStarClick = (category, stars) => {
        setRating(prev => ({
            ...prev,
            [category]: stars
        }))
    }

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files)
        files.forEach(file => {
            const reader = new FileReader()
            reader.onload = (e) => {
                setPhotos(prev => [...prev, e.target.result])
            }
            reader.readAsDataURL(file)
        })
    }

    const submitRating = () => {
        if (rating.overall === 0) {
            alert('Please provide an overall rating')
            return
        }

        // In a real app, this would make an API call
        console.log('Submitting rating:', {
            bookingId: selectedBooking.id,
            ratings: rating,
            feedback,
            photos
        })

        alert('Thank you for your feedback!')
        setShowRatingModal(false)
        setSelectedBooking(null)
    }

    const renderStars = (currentRating, onStarClick, category) => {
        return (
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        onClick={() => onStarClick && onStarClick(category, star)}
                        className={`w-8 h-8 ${onStarClick ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                    >
                        <svg
                            className={`w-full h-full ${star <= currentRating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                ))}
            </div>
        )
    }

    const renderRatingCard = (booking, isPending = false) => (
        <motion.div
            key={booking.id}
            className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
            whileHover={{ scale: 1.01 }}
        >
            <div className="flex items-start space-x-4 mb-4">
                <img
                    src={booking.vehicle.image}
                    alt={booking.vehicle.name}
                    className="w-20 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{booking.vehicle.name}</h3>
                    <p className="text-gray-600 text-sm">by {booking.vehicle.owner}</p>
                    <p className="text-gray-600 text-sm">
                        Completed: {new Date(booking.completedDate || booking.ratedDate).toLocaleDateString()}
                    </p>
                    <p className="text-green-600 font-semibold">${booking.amount}</p>
                </div>
            </div>

            {booking.hasDriver && booking.driver && (
                <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                    <img
                        src={booking.driver.image}
                        alt={booking.driver.name}
                        className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                        <p className="text-sm font-medium text-gray-900">{booking.driver.name}</p>
                        <p className="text-xs text-gray-600">Your Driver</p>
                    </div>
                </div>
            )}

            {isPending ? (
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">Share your experience</p>
                    <button
                        onClick={() => handleRateBooking(booking)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Rate & Review
                    </button>
                </div>
            ) : (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Overall Rating</span>
                            {renderStars(booking.ratings.overall)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Vehicle:</span>
                                {renderStars(booking.ratings.vehicle)}
                            </div>
                            {booking.hasDriver && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Driver:</span>
                                    {renderStars(booking.ratings.driver)}
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">Service:</span>
                                {renderStars(booking.ratings.service)}
                            </div>
                        </div>
                    </div>

                    {booking.feedback && (
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Your Review</p>
                            <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{booking.feedback}</p>
                        </div>
                    )}

                    {booking.photos && booking.photos.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Photos</p>
                            <div className="flex space-x-2">
                                {booking.photos.map((photo, index) => (
                                    <img
                                        key={index}
                                        src={photo}
                                        alt={`Review photo ${index + 1}`}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-2">Ratings & Feedback</h2>
                <p className="text-purple-100">Share your experience and view your past reviews</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'pending'
                                ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Pending Reviews ({pendingRatings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'completed'
                                ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        My Reviews ({completedRatings.length})
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'pending' && (
                        <div className="space-y-4">
                            {pendingRatings.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 mb-2">
                                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600">No bookings waiting for your review</p>
                                </div>
                            ) : (
                                pendingRatings.map(booking => renderRatingCard(booking, true))
                            )}
                        </div>
                    )}

                    {activeTab === 'completed' && (
                        <div className="space-y-4">
                            {completedRatings.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 mb-2">
                                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600">You haven't left any reviews yet</p>
                                </div>
                            ) : (
                                completedRatings.map(booking => renderRatingCard(booking, false))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Rating Modal */}
            {showRatingModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                Rate Your Experience
                            </h3>

                            <div className="mb-6">
                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <img
                                        src={selectedBooking.vehicle.image}
                                        alt={selectedBooking.vehicle.name}
                                        className="w-16 h-12 object-cover rounded"
                                    />
                                    <div>
                                        <h4 className="font-medium text-gray-900">{selectedBooking.vehicle.name}</h4>
                                        <p className="text-sm text-gray-600">by {selectedBooking.vehicle.owner}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Overall Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Overall Experience *
                                    </label>
                                    {renderStars(rating.overall, handleStarClick, 'overall')}
                                </div>

                                {/* Vehicle Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Vehicle Quality
                                    </label>
                                    {renderStars(rating.vehicle, handleStarClick, 'vehicle')}
                                </div>

                                {/* Driver Rating */}
                                {selectedBooking.hasDriver && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Driver Service
                                        </label>
                                        {renderStars(rating.driver, handleStarClick, 'driver')}
                                    </div>
                                )}

                                {/* Service Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Customer Service
                                    </label>
                                    {renderStars(rating.service, handleStarClick, 'service')}
                                </div>

                                {/* Feedback */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Share Your Experience (Optional)
                                    </label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        rows="4"
                                        placeholder="Tell others about your experience..."
                                    />
                                </div>

                                {/* Photo Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Add Photos (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    {photos.length > 0 && (
                                        <div className="mt-2 flex space-x-2">
                                            {photos.map((photo, index) => (
                                                <img
                                                    key={index}
                                                    src={photo}
                                                    alt={`Upload preview ${index + 1}`}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowRatingModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitRating}
                                    disabled={rating.overall === 0}
                                    className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
