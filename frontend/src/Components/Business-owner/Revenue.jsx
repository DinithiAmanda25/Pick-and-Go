import React from 'react'

function BusinessOwnerRevenue({ revenue }) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-purple-900 mb-6">Revenue Analytics</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">Monthly Revenue</h3>
                        <p className="text-3xl font-bold">${revenue.toLocaleString()}</p>
                        <p className="text-purple-200 mt-2">+12% from last month</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">Total Earnings</h3>
                        <p className="text-3xl font-bold">${(revenue * 8).toLocaleString()}</p>
                        <p className="text-green-200 mt-2">This year</p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">Average Per Vehicle</h3>
                        <p className="text-3xl font-bold">${Math.round(revenue / 25).toLocaleString()}</p>
                        <p className="text-blue-200 mt-2">Per month</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Chart</h3>
                    <div className="h-64 flex items-end justify-center bg-white rounded border">
                        <p className="text-gray-500">Revenue chart visualization would go here</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BusinessOwnerRevenue
