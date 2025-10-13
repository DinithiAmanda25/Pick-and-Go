import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import bookingService from '../../Services/bookingService'

function DriverEarnings({ stats }) {
    const [earnings, setEarnings] = useState({
        todayEarnings: 0,
        weekEarnings: 0,
        monthEarnings: 0,
        totalEarnings: 0,
        todayTrips: 0,
        weekTrips: 0,
        monthTrips: 0,
        totalTrips: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { user } = useAuth()

    useEffect(() => {
        if (user) {
            calculateEarnings()
        }
    }, [user])

    const calculateEarnings = async () => {
        try {
            setLoading(true)
            setError('')
            
            const driverId = user?.userId || user?.id || user?.driverId
            if (!driverId) {
                throw new Error('Driver not authenticated')
            }

            // Fetch all completed trips for the driver
            const response = await bookingService.getDriverBookings(driverId, 'completed')
            
            if (response.success) {
                const completedTrips = response.bookings || []
                
                // Calculate earnings based on 10% of each trip's total amount
                const now = new Date()
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

                let todayEarnings = 0, weekEarnings = 0, monthEarnings = 0, totalEarnings = 0
                let todayTrips = 0, weekTrips = 0, monthTrips = 0, totalTrips = 0

                completedTrips.forEach(trip => {
                    const tripDate = new Date(trip.createdAt || trip.rentalPeriod?.startDate)
                    const tripAmount = trip.pricing?.totalAmount || 0
                    const driverEarning = tripAmount * 0.1 // 10% of trip amount

                    totalEarnings += driverEarning
                    totalTrips += 1

                    if (tripDate >= today) {
                        todayEarnings += driverEarning
                        todayTrips += 1
                    }

                    if (tripDate >= weekAgo) {
                        weekEarnings += driverEarning
                        weekTrips += 1
                    }

                    if (tripDate >= monthAgo) {
                        monthEarnings += driverEarning
                        monthTrips += 1
                    }
                })

                setEarnings({
                    todayEarnings: Math.round(todayEarnings * 100) / 100,
                    weekEarnings: Math.round(weekEarnings * 100) / 100,
                    monthEarnings: Math.round(monthEarnings * 100) / 100,
                    totalEarnings: Math.round(totalEarnings * 100) / 100,
                    todayTrips,
                    weekTrips,
                    monthTrips,
                    totalTrips
                })

            } else {
                throw new Error(response.message || 'Failed to fetch driver bookings')
            }

        } catch (err) {
            console.error('Error calculating earnings:', err)
            setError(err.message)
            
            // Fallback to mock data if API fails
            setEarnings({
                todayEarnings: stats?.todayEarnings || 125.50,
                weekEarnings: stats?.weekEarnings || 892.30,
                monthEarnings: stats?.monthEarnings || 3456.80,
                totalEarnings: stats?.totalEarnings || 28934.50,
                todayTrips: 12,
                weekTrips: 45,
                monthTrips: 187,
                totalTrips: 1256
            })
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return `$${amount?.toLocaleString() || '0'}`
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-orange-900 mb-6">Earnings Dashboard</h2>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading earnings data...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-orange-900 mb-6">Earnings Dashboard</h2>
                
                {error && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-yellow-800 text-sm">⚠️ {error} - Showing sample data</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">Today</h3>
                        <p className="text-3xl font-bold">{formatCurrency(earnings.todayEarnings)}</p>
                        <p className="text-orange-200 mt-2">{earnings.todayTrips} trips completed</p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">This Week</h3>
                        <p className="text-3xl font-bold">{formatCurrency(earnings.weekEarnings)}</p>
                        <p className="text-blue-200 mt-2">{earnings.weekTrips} trips completed</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">This Month</h3>
                        <p className="text-3xl font-bold">{formatCurrency(earnings.monthEarnings)}</p>
                        <p className="text-green-200 mt-2">{earnings.monthTrips} trips completed</p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">Total</h3>
                        <p className="text-3xl font-bold">{formatCurrency(earnings.totalEarnings)}</p>
                        <p className="text-purple-200 mt-2">{earnings.totalTrips} trips completed</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="font-medium text-gray-900 mb-2">Earnings Rate</h4>
                            <p className="text-2xl font-bold text-green-600">10%</p>
                            <p className="text-sm text-gray-600">of each completed trip</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="font-medium text-gray-900 mb-2">Average per Trip</h4>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(earnings.totalTrips > 0 ? earnings.totalEarnings / earnings.totalTrips : 0)}
                            </p>
                            <p className="text-sm text-gray-600">earnings per trip</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="font-medium text-gray-900 mb-2">Completion Rate</h4>
                            <p className="text-2xl font-bold text-purple-600">100%</p>
                            <p className="text-sm text-gray-600">of completed trips</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DriverEarnings
