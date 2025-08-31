import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import VehicleOwnerSidebar from '../../Components/Vehicle-owner/Sidebar'
import VehicleOwnerHeader from '../../Components/Vehicle-owner/Header'
import VehicleOwnerOverview from '../../Components/Vehicle-owner/Overview'
import VehicleOwnerVehicles from '../../Components/Vehicle-owner/Vehicles'
import VehicleOwnerBookings from '../../Components/Vehicle-owner/Bookings'
import VehicleOwnerEarnings from '../../Components/Vehicle-owner/Earnings'
import VehicleOwnerMaintenance from '../../Components/Vehicle-owner/Maintenance'
import VehicleOwnerAnalytics from '../../Components/Vehicle-owner/Analytics'
import VehicleOwnerProfile from '../../Components/Vehicle-owner/Profile'
import VehicleOwnerSettings from '../../Components/Vehicle-owner/Settings'

function VehicleOwnerDashboard() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const initialTab = params.get('tab') || 'overview'
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    const p = new URLSearchParams(location.search)
    const t = p.get('tab') || 'overview'
    if (t !== activeTab) {
      setActiveTab(t)
    }
  }, [location.search, activeTab])

  // Mock data for vehicle owner
  const mockVehicles = [
    { id: 1, make: 'Toyota', model: 'Camry', year: 2022, plate: 'ABC-123', status: 'available', earnings: '$450' },
    { id: 2, make: 'Honda', model: 'Civic', year: 2021, plate: 'XYZ-789', status: 'rented', earnings: '$380' },
    { id: 3, make: 'Ford', model: 'Focus', year: 2020, plate: 'DEF-456', status: 'maintenance', earnings: '$320' }
  ]

  const mockBookings = [
    { id: 1, vehicle: 'Toyota Camry', customer: 'John Smith', startDate: '2025-08-30', endDate: '2025-09-02', amount: '$450', status: 'active' },
    { id: 2, vehicle: 'Honda Civic', customer: 'Jane Doe', startDate: '2025-08-28', endDate: '2025-08-31', amount: '$380', status: 'completed' }
  ]

  const mockEarnings = [
    { month: 'August', amount: '$2,450', bookings: 12, growth: '+15%' },
    { month: 'July', amount: '$2,130', bookings: 10, growth: '+8%' },
    { month: 'June', amount: '$1,980', bookings: 9, growth: '+12%' }
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <VehicleOwnerSidebar />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <VehicleOwnerHeader />

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Content based on active tab */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
            <div className="p-8">
              <div className="animate-slide-in">
                {activeTab === 'overview' && (
                  <VehicleOwnerOverview
                    vehicles={mockVehicles}
                    bookings={mockBookings}
                    earnings={mockEarnings}
                    setActiveTab={setActiveTab}
                  />
                )}

                {activeTab === 'vehicles' && (
                  <VehicleOwnerVehicles vehicles={mockVehicles} />
                )}

                {activeTab === 'bookings' && (
                  <VehicleOwnerBookings bookings={mockBookings} />
                )}

                {activeTab === 'earnings' && (
                  <VehicleOwnerEarnings earnings={mockEarnings} />
                )}

                {activeTab === 'maintenance' && (
                  <VehicleOwnerMaintenance vehicles={mockVehicles} />
                )}

                {activeTab === 'analytics' && (
                  <VehicleOwnerAnalytics
                    vehicles={mockVehicles}
                    earnings={mockEarnings}
                    bookings={mockBookings}
                  />
                )}

                {activeTab === 'profile' && (
                  <VehicleOwnerProfile />
                )}

                {activeTab === 'settings' && (
                  <VehicleOwnerSettings />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VehicleOwnerDashboard
