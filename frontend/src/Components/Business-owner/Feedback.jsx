import React, { useState } from 'react'

function BusinessOwnerFeedback({ feedback }) {
    const [feedbackData, setFeedbackData] = useState(feedback)
    const [filter, setFilter] = useState('all')
    const [ratingFilter, setRatingFilter] = useState('all')

    const handleRespondToFeedback = (feedbackId) => {
        const response = prompt('Enter your response to this feedback:')
        if (response) {
            const updatedFeedback = feedbackData.map(item =>
                item.id === feedbackId
                    ? { ...item, response: response, responded: true, responseDate: new Date().toISOString().split('T')[0] }
                    : item
            )
            setFeedbackData(updatedFeedback)
            alert('Response sent successfully!')
        }
    }

    const handleMarkAsResolved = (feedbackId) => {
        const updatedFeedback = feedbackData.map(item =>
            item.id === feedbackId
                ? { ...item, status: 'Resolved', resolvedDate: new Date().toISOString().split('T')[0] }
                : item
        )
        setFeedbackData(updatedFeedback)
    }

    const getAverageRating = () => {
        const totalRating = feedbackData.reduce((sum, item) => sum + item.rating, 0)
        return (totalRating / feedbackData.length).toFixed(1)
    }

    const getRatingDistribution = () => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        feedbackData.forEach(item => {
            distribution[item.rating]++
        })
        return distribution
    }

    const getServiceQualityTrend = () => {
        const last30Days = feedbackData.filter(item => {
            const feedbackDate = new Date(item.date)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            return feedbackDate >= thirtyDaysAgo
        })

        const avgLast30 = last30Days.length > 0
            ? (last30Days.reduce((sum, item) => sum + item.rating, 0) / last30Days.length).toFixed(1)
            : 0

        const overallAvg = getAverageRating()
        const trend = avgLast30 > overallAvg ? 'improving' : avgLast30 < overallAvg ? 'declining' : 'stable'

        return { avgLast30, trend }
    }

    const filteredFeedback = feedbackData.filter(item => {
        let passesTypeFilter = true
        let passesRatingFilter = true

        if (filter === 'positive') passesTypeFilter = item.rating >= 4
        if (filter === 'negative') passesTypeFilter = item.rating <= 2
        if (filter === 'unresolved') passesTypeFilter = item.status !== 'Resolved'
        if (filter === 'responded') passesTypeFilter = item.responded

        if (ratingFilter !== 'all') passesRatingFilter = item.rating === parseInt(ratingFilter)

        return passesTypeFilter && passesRatingFilter
    })

    const getRatingColor = (rating) => {
        if (rating >= 4) return 'text-green-600'
        if (rating >= 3) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-green-100 text-green-800'
            case 'In Progress': return 'bg-yellow-100 text-yellow-800'
            case 'New': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <svg
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))
    }

    const distribution = getRatingDistribution()
    const qualityTrend = getServiceQualityTrend()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Customer Feedback & Ratings</h2>
                    <p className="text-gray-600">Monitor and respond to customer feedback</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{getAverageRating()}</div>
                    <div className="flex justify-end mb-1">{renderStars(Math.round(getAverageRating()))}</div>
                    <div className="text-sm text-gray-600">Overall Rating</div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                            <p className="text-2xl font-bold text-gray-900">{feedbackData.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Positive Reviews</p>
                            <p className="text-2xl font-bold text-gray-900">{feedbackData.filter(f => f.rating >= 4).length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending Response</p>
                            <p className="text-2xl font-bold text-gray-900">{feedbackData.filter(f => !f.responded).length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center">
                        <div className={`p-3 rounded-lg ${qualityTrend.trend === 'improving' ? 'bg-green-100' : qualityTrend.trend === 'declining' ? 'bg-red-100' : 'bg-blue-100'}`}>
                            <svg className={`w-6 h-6 ${qualityTrend.trend === 'improving' ? 'text-green-600' : qualityTrend.trend === 'declining' ? 'text-red-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={qualityTrend.trend === 'improving' ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : qualityTrend.trend === 'declining' ? "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" : "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"} />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">30-Day Trend</p>
                            <p className="text-2xl font-bold text-gray-900">{qualityTrend.avgLast30}</p>
                            <p className={`text-xs font-medium ${qualityTrend.trend === 'improving' ? 'text-green-600' : qualityTrend.trend === 'declining' ? 'text-red-600' : 'text-blue-600'}`}>
                                {qualityTrend.trend.charAt(0).toUpperCase() + qualityTrend.trend.slice(1)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Rating Distribution</h3>
                <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map(rating => {
                        const count = distribution[rating]
                        const percentage = feedbackData.length > 0 ? (count / feedbackData.length) * 100 : 0
                        return (
                            <div key={rating} className="flex items-center">
                                <div className="flex items-center w-20">
                                    <span className="text-sm font-medium">{rating}</span>
                                    <svg className="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>
                                <div className="flex-1 mx-4">
                                    <div className="bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-yellow-400 h-2 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="w-16 text-right">
                                    <span className="text-sm font-medium">{count} ({percentage.toFixed(0)}%)</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex space-x-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        All Feedback
                    </button>
                    <button
                        onClick={() => setFilter('positive')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'positive'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Positive (4-5★)
                    </button>
                    <button
                        onClick={() => setFilter('negative')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'negative'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Negative (1-2★)
                    </button>
                    <button
                        onClick={() => setFilter('unresolved')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'unresolved'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Unresolved
                    </button>
                </div>

                <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
                {filteredFeedback.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 font-semibold">{item.customer.charAt(0)}</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{item.customer}</h4>
                                    <p className="text-sm text-gray-600">{item.vehicle} • {new Date(item.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                    {renderStars(item.rating)}
                                    <span className={`ml-2 font-semibold ${getRatingColor(item.rating)}`}>
                                        {item.rating}.0
                                    </span>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-gray-700">{item.comment}</p>
                        </div>

                        {item.response && (
                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-blue-900 mb-1">Your Response:</p>
                                        <p className="text-blue-800">{item.response}</p>
                                        <p className="text-xs text-blue-600 mt-2">Responded on {new Date(item.responseDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <div className="flex space-x-2">
                                {!item.responded && (
                                    <button
                                        onClick={() => handleRespondToFeedback(item.id)}
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                                    >
                                        Respond
                                    </button>
                                )}
                                {item.status !== 'Resolved' && (
                                    <button
                                        onClick={() => handleMarkAsResolved(item.id)}
                                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300"
                                    >
                                        Mark Resolved
                                    </button>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">
                                Booking ID: {item.bookingId}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredFeedback.length === 0 && (
                <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                    </svg>
                    <p className="text-gray-500">No feedback found for the selected filters.</p>
                </div>
            )}
        </div>
    )
}

export default BusinessOwnerFeedback
