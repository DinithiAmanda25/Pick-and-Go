import React from 'react'

function VehicleOwnerEarnings({ earnings }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Earnings</h2>
                <p className="text-gray-600">Track your vehicle rental income</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Earnings</h3>
                    <p className="text-3xl font-bold text-green-600">$12,580</p>
                    <p className="text-sm text-green-600">+15% from last month</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">This Month</h3>
                    <p className="text-3xl font-bold text-blue-600">$2,450</p>
                    <p className="text-sm text-blue-600">12 bookings</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Average per Vehicle</h3>
                    <p className="text-3xl font-bold text-purple-600">$450</p>
                    <p className="text-sm text-purple-600">per month</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
                <div className="space-y-4">
                    {earnings?.map((earning, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">{earning.month}</p>
                                <p className="text-sm text-gray-600">{earning.bookings} bookings</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-gray-900">{earning.amount}</p>
                                <p className="text-sm text-green-600">{earning.growth}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default VehicleOwnerEarnings
