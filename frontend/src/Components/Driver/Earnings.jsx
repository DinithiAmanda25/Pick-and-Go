import React from 'react'

function DriverEarnings({ stats }) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-orange-900 mb-6">Earnings Dashboard</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">Today</h3>
                        <p className="text-3xl font-bold">${stats?.todayEarnings}</p>
                        <p className="text-orange-200 mt-2">+8% from yesterday</p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">This Week</h3>
                        <p className="text-3xl font-bold">${stats?.weekEarnings?.toLocaleString()}</p>
                        <p className="text-blue-200 mt-2">+15% from last week</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">This Month</h3>
                        <p className="text-3xl font-bold">${stats?.monthEarnings?.toLocaleString()}</p>
                        <p className="text-green-200 mt-2">+22% from last month</p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">Total</h3>
                        <p className="text-3xl font-bold">${stats?.totalEarnings?.toLocaleString()}</p>
                        <p className="text-purple-200 mt-2">All time</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings Chart</h3>
                    <div className="h-64 flex items-end justify-center bg-white rounded border">
                        <p className="text-gray-500">Earnings chart visualization would go here</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DriverEarnings
