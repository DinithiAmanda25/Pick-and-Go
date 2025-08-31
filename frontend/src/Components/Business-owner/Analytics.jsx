import React from 'react'

function BusinessOwnerAnalytics({ data }) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-purple-900 mb-6">Business Analytics</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Fleet Utilization</span>
                                <span className="font-semibold">85%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Driver Efficiency</span>
                                <span className="font-semibold">92%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Customer Satisfaction</span>
                                <span className="font-semibold">4.8/5</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                        <div className="h-64 flex items-end justify-center bg-white rounded border">
                            <p className="text-gray-500">Analytics chart visualization would go here</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BusinessOwnerAnalytics
