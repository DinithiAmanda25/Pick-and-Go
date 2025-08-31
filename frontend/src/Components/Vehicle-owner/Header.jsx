import React from 'react'

function VehicleOwnerHeader() {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Vehicle Owner Dashboard</h1>
                    <p className="text-sm text-gray-600">Manage your fleet and track earnings</p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Fleet Status */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Fleet Status:</span>
                        <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            <span className="text-sm font-medium text-green-600">8 Available</span>
                        </div>
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                        🔔
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
                    </button>

                    {/* Messages */}
                    <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                        💬
                    </button>

                    {/* Profile */}
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                            JD
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-medium text-gray-900">John Doe</p>
                            <p className="text-xs text-gray-600">Vehicle Owner</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default VehicleOwnerHeader
