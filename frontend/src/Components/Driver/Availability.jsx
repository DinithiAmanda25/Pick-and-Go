import React, { useState } from 'react'

function DriverAvailability() {
    const [isOnline, setIsOnline] = useState(true)
    const [workingHours, setWorkingHours] = useState({
        start: '08:00',
        end: '20:00'
    })

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-orange-900 mb-6">Availability Settings</h2>

                <div className="space-y-6">
                    {/* Online Status */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Online Status</h3>
                            <p className="text-sm text-gray-600">Toggle your availability to receive trip requests</p>
                        </div>
                        <button
                            onClick={() => setIsOnline(!isOnline)}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${isOnline ? 'bg-green-600' : 'bg-gray-200'
                                }`}
                        >
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isOnline ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Working Hours */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Working Hours</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                                <input
                                    type="time"
                                    value={workingHours.start}
                                    onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                                <input
                                    type="time"
                                    value={workingHours.end}
                                    onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Current Status */}
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">
                                    {isOnline ? 'You are online and available for trips' : 'You are offline'}
                                </h3>
                                <p className="text-sm text-green-600">
                                    {isOnline ? `Working hours: ${workingHours.start} - ${workingHours.end}` : 'Turn on availability to start receiving trip requests'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DriverAvailability
