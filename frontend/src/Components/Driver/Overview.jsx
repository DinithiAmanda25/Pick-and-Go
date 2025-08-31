import React from 'react'

function DriverOverview({ driver, stats }) {
    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-orange-900 mb-2">
                    Welcome back, {driver?.name || 'Driver'}!
                </h2>
                <p className="text-gray-600">Here's your driving activity overview</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-orange-100 rounded-full">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Trips</p>
                            <p className="text-2xl font-bold text-gray-900">{driver?.totalTrips || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-full">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                            <p className="text-2xl font-bold text-gray-900">${stats?.monthEarnings?.toLocaleString() || '0'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Rating</p>
                            <p className="text-2xl font-bold text-gray-900">{driver?.rating || '0.0'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Status</p>
                            <p className="text-2xl font-bold text-gray-900">{driver?.isOnline ? 'Online' : 'Offline'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Trips</h3>
                    <div className="space-y-4">
                        {/* Mock recent trips - we'll use static data for now */}
                        {[
                            { id: 1, pickup: 'Downtown Mall', dropoff: 'Airport', fare: 28.50, time: '2 hours ago' },
                            { id: 2, pickup: 'Hotel Plaza', dropoff: 'City Center', fare: 18.75, time: '4 hours ago' },
                            { id: 3, pickup: 'Central Station', dropoff: 'Business District', fare: 22.50, time: '6 hours ago' }
                        ].map((trip) => (
                            <div key={trip.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                <div>
                                    <p className="font-medium text-gray-900">{trip.pickup} → {trip.dropoff}</p>
                                    <p className="text-sm text-gray-600">{trip.time}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">${trip.fare}</p>
                                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                        Completed
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Vehicle</span>
                            <span className="font-medium">Toyota Camry</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">License Plate</span>
                            <span className="font-medium">ABC-1234</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Status</span>
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Active
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Last Maintenance</span>
                            <span className="font-medium">Nov 15, 2024</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DriverOverview
