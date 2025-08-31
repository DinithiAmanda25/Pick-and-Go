import React from 'react'

function VehicleOwnerMaintenance({ vehicles }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Maintenance</h2>
                <p className="text-gray-600">Keep your fleet in top condition</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Schedule</h3>
                <div className="space-y-4">
                    {vehicles?.map((vehicle) => (
                        <div key={vehicle.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">{vehicle.make} {vehicle.model}</p>
                                <p className="text-sm text-gray-600">{vehicle.plate}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Next Service</p>
                                <p className="font-medium text-gray-900">Due in 2 weeks</p>
                            </div>
                            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                                Schedule
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default VehicleOwnerMaintenance
