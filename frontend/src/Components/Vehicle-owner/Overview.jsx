import React from 'react'

function VehicleOwnerOverview({ vehicles, bookings, earnings, setActiveTab }) {
    const stats = [
        { title: 'Total Vehicles', value: vehicles?.length || 0, icon: '🚗', color: 'green' },
        { title: 'Active Bookings', value: bookings?.filter(b => b.status === 'active').length || 0, icon: '📋', color: 'blue' },
        { title: 'Monthly Earnings', value: '$2,450', icon: '💰', color: 'green' },
        { title: 'Fleet Utilization', value: '78%', icon: '📊', color: 'purple' }
    ]

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John!</h2>
                <p className="text-gray-600">Here's what's happening with your fleet today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className="text-3xl">{stat.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => setActiveTab('vehicles')}
                        className="p-4 text-left rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                🚗
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Add Vehicle</p>
                                <p className="text-sm text-gray-500">Register new vehicle</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('bookings')}
                        className="p-4 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                📋
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">View Bookings</p>
                                <p className="text-sm text-gray-500">Manage reservations</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('maintenance')}
                        className="p-4 text-left rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                                🔧
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Schedule Maintenance</p>
                                <p className="text-sm text-gray-500">Vehicle service</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('analytics')}
                        className="p-4 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                📊
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">View Analytics</p>
                                <p className="text-sm text-gray-500">Performance insights</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Recent Activity & Fleet Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
                    <div className="space-y-4">
                        {bookings?.slice(0, 3).map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">{booking.vehicle}</p>
                                    <p className="text-sm text-gray-600">{booking.customer}</p>
                                    <p className="text-xs text-gray-500">{booking.startDate} - {booking.endDate}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{booking.amount}</p>
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${booking.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className="mt-4 text-green-600 hover:text-green-700 font-medium text-sm"
                    >
                        View all bookings →
                    </button>
                </div>

                {/* Fleet Status */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fleet Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-900">Available</span>
                            </div>
                            <span className="text-lg font-bold text-green-600">
                                {vehicles?.filter(v => v.status === 'available').length || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-900">Rented</span>
                            </div>
                            <span className="text-lg font-bold text-blue-600">
                                {vehicles?.filter(v => v.status === 'rented').length || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-900">Maintenance</span>
                            </div>
                            <span className="text-lg font-bold text-yellow-600">
                                {vehicles?.filter(v => v.status === 'maintenance').length || 0}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setActiveTab('vehicles')}
                        className="mt-4 text-green-600 hover:text-green-700 font-medium text-sm"
                    >
                        Manage fleet →
                    </button>
                </div>
            </div>

            {/* Earnings Summary */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {earnings?.slice(0, 3).map((earning, index) => (
                        <div key={index} className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{earning.amount}</div>
                            <div className="text-sm text-gray-500">{earning.month}</div>
                            <div className="text-xs text-green-600 font-medium">{earning.growth}</div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => setActiveTab('earnings')}
                    className="mt-4 text-green-600 hover:text-green-700 font-medium text-sm"
                >
                    View detailed earnings →
                </button>
            </div>
        </div>
    )
}

export default VehicleOwnerOverview
