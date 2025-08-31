import React from 'react'

function VehicleOwnerVehicles({ vehicles }) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">My Vehicles</h2>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Add New Vehicle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles?.map((vehicle) => (
                    <div key={vehicle.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{vehicle.make} {vehicle.model}</h3>
                                <p className="text-sm text-gray-600">{vehicle.year} • {vehicle.plate}</p>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
                                    vehicle.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                }`}>
                                {vehicle.status}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-600">Monthly Earnings</p>
                                <p className="text-xl font-bold text-green-600">{vehicle.earnings}</p>
                            </div>
                            <button className="text-green-600 hover:text-green-700 font-medium">
                                Manage →
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default VehicleOwnerVehicles
