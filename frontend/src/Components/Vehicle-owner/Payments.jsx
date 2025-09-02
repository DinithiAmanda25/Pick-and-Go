import React, { useState } from 'react'

function VehicleOwnerPayments({ payments, vehicles }) {
    const [filter, setFilter] = useState('all')
    const [selectedPeriod, setSelectedPeriod] = useState('monthly')
    const [selectedVehicle, setSelectedVehicle] = useState('all')

    const calculatePaymentMetrics = () => {
        const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0)
        const paidPayments = payments.filter(p => p.status === 'Paid')
        const pendingPayments = payments.filter(p => p.status === 'Pending')
        const overduePayments = payments.filter(p => p.status === 'Overdue')

        return {
            totalEarnings,
            paidAmount: paidPayments.reduce((sum, p) => sum + p.amount, 0),
            pendingAmount: pendingPayments.reduce((sum, p) => sum + p.amount, 0),
            overdueAmount: overduePayments.reduce((sum, p) => sum + p.amount, 0),
            totalTransactions: payments.length,
            paidTransactions: paidPayments.length,
            pendingTransactions: pendingPayments.length,
            overdueTransactions: overduePayments.length
        }
    }

    const getVehicleEarnings = () => {
        const vehicleEarnings = {}
        vehicles.forEach(vehicle => {
            const vehiclePayments = payments.filter(p => p.vehicleId === vehicle.id)
            vehicleEarnings[vehicle.id] = {
                vehicle: vehicle,
                earnings: vehiclePayments.reduce((sum, p) => sum + p.amount, 0),
                bookings: vehiclePayments.length
            }
        })
        return vehicleEarnings
    }

    const generateRevenueReport = () => {
        const reportData = {
            period: selectedPeriod,
            vehicle: selectedVehicle,
            metrics: calculatePaymentMetrics(),
            vehicleEarnings: getVehicleEarnings(),
            payments: filteredPayments,
            generatedAt: new Date().toISOString()
        }

        console.log('Revenue Report:', reportData)
        alert('Revenue report generated successfully! Check console for details.')
    }

    const generatePaymentSummary = () => {
        const summaryData = {
            period: selectedPeriod,
            totalPayments: payments.length,
            metrics: calculatePaymentMetrics(),
            vehicleBreakdown: getVehicleEarnings(),
            generatedAt: new Date().toISOString()
        }

        console.log('Payment Summary:', summaryData)
        alert('Payment summary generated successfully! Check console for details.')
    }

    const filteredPayments = payments.filter(payment => {
        let passesStatusFilter = true
        let passesVehicleFilter = true

        if (filter === 'paid') passesStatusFilter = payment.status === 'Paid'
        if (filter === 'pending') passesStatusFilter = payment.status === 'Pending'
        if (filter === 'overdue') passesStatusFilter = payment.status === 'Overdue'

        if (selectedVehicle !== 'all') passesVehicleFilter = payment.vehicleId === parseInt(selectedVehicle)

        return passesStatusFilter && passesVehicleFilter
    })

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800'
            case 'Pending': return 'bg-yellow-100 text-yellow-800'
            case 'Overdue': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const metrics = calculatePaymentMetrics()
    const vehicleEarnings = getVehicleEarnings()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Payments & Revenue</h2>
                    <p className="text-gray-600">Track income and payment status from your vehicles</p>
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={generatePaymentSummary}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Payment Summary
                    </button>
                    <button
                        onClick={generateRevenueReport}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Revenue Report
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                            <p className="text-2xl font-bold text-gray-900">${metrics.totalEarnings.toLocaleString()}</p>
                            <p className="text-sm text-green-600">+15% from last month</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                            <p className="text-2xl font-bold text-gray-900">${metrics.paidAmount.toLocaleString()}</p>
                            <p className="text-sm text-blue-600">{metrics.paidTransactions} transactions</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                            <p className="text-2xl font-bold text-gray-900">${metrics.pendingAmount.toLocaleString()}</p>
                            <p className="text-sm text-yellow-600">{metrics.pendingTransactions} transactions</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
                            <p className="text-2xl font-bold text-gray-900">${metrics.overdueAmount.toLocaleString()}</p>
                            <p className="text-sm text-red-600">{metrics.overdueTransactions} transactions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vehicle Earnings Breakdown */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Earnings by Vehicle</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.values(vehicleEarnings).map(({ vehicle, earnings, bookings }) => (
                        <div key={vehicle.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{vehicle.make} {vehicle.model}</h4>
                                    <p className="text-sm text-gray-600">{vehicle.plate}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
                                        vehicle.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                                            'bg-red-100 text-red-800'
                                    }`}>
                                    {vehicle.status}
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-green-600 mb-1">${earnings.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">{bookings} bookings</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${Math.min((earnings / metrics.totalEarnings) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex space-x-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        All Payments
                    </button>
                    <button
                        onClick={() => setFilter('paid')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'paid'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Paid
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'pending'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('overdue')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'overdue'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Overdue
                    </button>
                </div>

                <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                    <option value="all">All Vehicles</option>
                    {vehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.make} {vehicle.model} ({vehicle.plate})
                        </option>
                    ))}
                </select>

                <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select>
            </div>

            {/* Payment Status Report Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Payment Status Report</h3>
                    <p className="text-sm text-gray-600">Monitor payment status for all your vehicles</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        PAY{payment.id.toString().padStart(3, '0')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{payment.vehicle}</div>
                                        <div className="text-sm text-gray-500">{payment.vehiclePlate}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {payment.customer}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                        ${payment.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(payment.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(payment.dueDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        #{payment.bookingId}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredPayments.length === 0 && (
                <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <p className="text-gray-500">No payments found for the selected filters.</p>
                </div>
            )}
        </div>
    )
}

export default VehicleOwnerPayments
