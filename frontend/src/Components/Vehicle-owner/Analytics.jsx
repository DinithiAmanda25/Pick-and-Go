import React from 'react'

function VehicleOwnerAnalytics({ vehicles, earnings, bookings }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
                <p className="text-gray-600">Performance insights for your fleet</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fleet Performance</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Utilization Rate</span>
                            <span className="font-bold text-green-600">78%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Average Booking Duration</span>
                            <span className="font-bold text-blue-600">3.2 days</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Customer Rating</span>
                            <span className="font-bold text-yellow-600">4.8/5</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Monthly Growth</span>
                            <span className="font-bold text-green-600">+15%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Best Performing Vehicle</span>
                            <span className="font-bold text-purple-600">Toyota Camry</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Peak Season</span>
                            <span className="font-bold text-orange-600">Summer</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VehicleOwnerAnalytics
