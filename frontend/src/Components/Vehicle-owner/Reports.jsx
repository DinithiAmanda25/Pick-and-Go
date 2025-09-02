import React, { useState } from 'react'

function VehicleOwnerReports({ vehicles, bookings }) {
    const [reportType, setReportType] = useState('utilization')
    const [selectedPeriod, setSelectedPeriod] = useState('monthly')
    const [selectedVehicle, setSelectedVehicle] = useState('all')

    // Calculate Fleet Utilization Report
    const calculateUtilizationReport = () => {
        return vehicles.map(vehicle => {
            const vehicleBookings = bookings.filter(booking => booking.vehicleId === vehicle.id)
            const totalDays = 30 // Monthly period
            const bookedDays = vehicleBookings.reduce((sum, booking) => {
                const start = new Date(booking.startDate)
                const end = new Date(booking.endDate)
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
                return sum + days
            }, 0)

            const utilizationRate = (bookedDays / totalDays) * 100
            const idleTime = totalDays - bookedDays
            const avgMileagePerBooking = vehicleBookings.length > 0
                ? vehicleBookings.reduce((sum, b) => sum + (b.mileage || 0), 0) / vehicleBookings.length
                : 0

            return {
                ...vehicle,
                utilizationRate: utilizationRate.toFixed(1),
                idleTime,
                bookedDays,
                totalBookings: vehicleBookings.length,
                avgMileagePerBooking: avgMileagePerBooking.toFixed(0),
                fuelEfficiency: vehicle.fuelEfficiency || '25 mpg',
                revenue: vehicleBookings.reduce((sum, b) => sum + (b.amount || 0), 0)
            }
        })
    }

    // Calculate Vehicle Availability Report
    const calculateAvailabilityReport = () => {
        const today = new Date()
        const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

        return vehicles.map(vehicle => {
            const upcomingBookings = bookings.filter(booking =>
                booking.vehicleId === vehicle.id &&
                new Date(booking.startDate) >= today &&
                new Date(booking.startDate) <= next30Days
            )

            const availableDates = []
            let currentDate = new Date(today)

            while (currentDate <= next30Days) {
                const dateStr = currentDate.toISOString().split('T')[0]
                const isBooked = upcomingBookings.some(booking =>
                    dateStr >= booking.startDate && dateStr <= booking.endDate
                )

                if (!isBooked) {
                    availableDates.push(dateStr)
                }
                currentDate.setDate(currentDate.getDate() + 1)
            }

            return {
                ...vehicle,
                availableDates: availableDates.length,
                upcomingBookings: upcomingBookings.length,
                nextAvailableDate: availableDates[0] || 'No availability in next 30 days',
                location: vehicle.location || 'Colombo Central',
                availabilityPercentage: ((availableDates.length / 30) * 100).toFixed(1)
            }
        })
    }

    const utilizationData = calculateUtilizationReport()
    const availabilityData = calculateAvailabilityReport()

    const getUtilizationColor = (rate) => {
        const numRate = parseFloat(rate)
        if (numRate >= 70) return 'text-green-600 bg-green-100'
        if (numRate >= 40) return 'text-yellow-600 bg-yellow-100'
        return 'text-red-600 bg-red-100'
    }

    const getAvailabilityColor = (percentage) => {
        const numPercentage = parseFloat(percentage)
        if (numPercentage >= 50) return 'text-green-600 bg-green-100'
        if (numPercentage >= 20) return 'text-yellow-600 bg-yellow-100'
        return 'text-red-600 bg-red-100'
    }

    const generateReport = () => {
        const reportData = {
            type: reportType,
            period: selectedPeriod,
            vehicle: selectedVehicle,
            data: reportType === 'utilization' ? utilizationData : availabilityData,
            generatedAt: new Date().toISOString()
        }

        console.log('Vehicle Report:', reportData)
        alert(`${reportType === 'utilization' ? 'Fleet Utilization' : 'Vehicle Availability'} report generated successfully!`)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Vehicle Reports</h2>
                    <p className="text-gray-600">Monitor fleet utilization and availability</p>
                </div>
                <button
                    onClick={generateReport}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                    Generate Report
                </button>
            </div>

            {/* Report Controls */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="utilization">Fleet Utilization Report</option>
                            <option value="availability">Vehicle Availability Report</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
                        <select
                            value={selectedVehicle}
                            onChange={(e) => setSelectedVehicle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="all">All Vehicles</option>
                            {vehicles.map(vehicle => (
                                <option key={vehicle.id} value={vehicle.id}>
                                    {vehicle.make} {vehicle.model} ({vehicle.plate})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Fleet Utilization Report */}
            {reportType === 'utilization' && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Fleet Utilization Report</h3>
                        <p className="text-sm text-gray-600">Usage, idle time, mileage, and fuel efficiency analysis</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization Rate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked Days</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Idle Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Mileage</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Efficiency</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {utilizationData.map((vehicle) => (
                                    <tr key={vehicle.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{vehicle.make} {vehicle.model}</div>
                                            <div className="text-sm text-gray-500">{vehicle.plate}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUtilizationColor(vehicle.utilizationRate)}`}>
                                                {vehicle.utilizationRate}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {vehicle.bookedDays} days
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {vehicle.idleTime} days
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {vehicle.avgMileagePerBooking} miles
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {vehicle.fuelEfficiency}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                            ${vehicle.revenue.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Vehicle Availability Report */}
            {reportType === 'availability' && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Vehicle Availability Report</h3>
                        <p className="text-sm text-gray-600">Location, brand, type, and availability analysis</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Days</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Available</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upcoming Bookings</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {availabilityData.map((vehicle) => (
                                    <tr key={vehicle.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{vehicle.make} {vehicle.model}</div>
                                            <div className="text-sm text-gray-500">{vehicle.plate}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {vehicle.location}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {vehicle.type || 'Sedan'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAvailabilityColor(vehicle.availabilityPercentage)}`}>
                                                {vehicle.availabilityPercentage}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {vehicle.availableDates} days
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {vehicle.nextAvailableDate === 'No availability in next 30 days'
                                                ? <span className="text-red-600">Fully booked</span>
                                                : new Date(vehicle.nextAvailableDate).toLocaleDateString()
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {vehicle.upcomingBookings} bookings
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Average Utilization</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {reportType === 'utilization'
                                    ? (utilizationData.reduce((sum, v) => sum + parseFloat(v.utilizationRate), 0) / utilizationData.length).toFixed(1)
                                    : (availabilityData.reduce((sum, v) => sum + parseFloat(v.availabilityPercentage), 0) / availabilityData.length).toFixed(1)
                                }%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                            <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${reportType === 'utilization'
                                    ? utilizationData.reduce((sum, v) => sum + v.revenue, 0).toLocaleString()
                                    : utilizationData.reduce((sum, v) => sum + v.revenue, 0).toLocaleString()
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VehicleOwnerReports
