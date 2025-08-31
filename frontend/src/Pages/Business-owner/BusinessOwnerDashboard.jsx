import React from 'react'
import { useLocation } from 'react-router-dom'
import BusinessOwnerSidebar from '../../Components/Business-owner/Sidebar'
import BusinessOwnerHeader from '../../Components/Business-owner/Header'

// Tab Components (we'll create these)
import BusinessOwnerOverview from '../../Components/Business-owner/Overview'
import BusinessOwnerFleet from '../../Components/Business-owner/Fleet'
import BusinessOwnerBookings from '../../Components/Business-owner/Bookings'
import BusinessOwnerRevenue from '../../Components/Business-owner/Revenue'
import BusinessOwnerDrivers from '../../Components/Business-owner/Drivers'
import BusinessOwnerAnalytics from '../../Components/Business-owner/Analytics'
import BusinessOwnerProfile from '../../Components/Business-owner/Profile'
import BusinessOwnerSettings from '../../Components/Business-owner/Settings'

function BusinessOwnerDashboard() {
  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)
  const activeTab = urlParams.get('tab') || 'overview'

  // Mock data for the dashboard
  const mockData = {
    profile: {
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      businessName: 'Wilson Transportation LLC',
      totalVehicles: 25,
      activeDrivers: 18,
      monthlyRevenue: 45000
    },
    fleet: [
      { id: 1, model: 'Toyota Camry 2023', status: 'Active', driver: 'John Smith', revenue: 3200 },
      { id: 2, model: 'Honda Accord 2022', status: 'Active', driver: 'Emily Davis', revenue: 2800 },
      { id: 3, model: 'Nissan Altima 2023', status: 'Maintenance', driver: null, revenue: 0 }
    ],
    bookings: [
      { id: 1, customer: 'Alice Johnson', vehicle: 'Toyota Camry', date: '2024-01-20', amount: 120, status: 'Completed' },
      { id: 2, customer: 'Bob Wilson', vehicle: 'Honda Accord', date: '2024-01-21', amount: 95, status: 'Active' },
      { id: 3, customer: 'Carol Brown', vehicle: 'Nissan Altima', date: '2024-01-22', amount: 110, status: 'Pending' }
    ],
    drivers: [
      { id: 1, name: 'John Smith', status: 'Active', totalTrips: 145, rating: 4.8, earnings: 4200 },
      { id: 2, name: 'Emily Davis', status: 'Active', totalTrips: 132, rating: 4.9, earnings: 3800 },
      { id: 3, name: 'Michael Johnson', status: 'Offline', totalTrips: 98, rating: 4.7, earnings: 2900 }
    ]
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <BusinessOwnerOverview data={mockData} />
      case 'fleet':
        return <BusinessOwnerFleet fleet={mockData.fleet} />
      case 'bookings':
        return <BusinessOwnerBookings bookings={mockData.bookings} />
      case 'revenue':
        return <BusinessOwnerRevenue revenue={mockData.profile.monthlyRevenue} />
      case 'drivers':
        return <BusinessOwnerDrivers drivers={mockData.drivers} />
      case 'analytics':
        return <BusinessOwnerAnalytics data={mockData} />
      case 'profile':
        return <BusinessOwnerProfile profile={mockData.profile} />
      case 'settings':
        return <BusinessOwnerSettings />
      default:
        return <BusinessOwnerOverview data={mockData} />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <BusinessOwnerSidebar />
      <div className="flex-1">
        <BusinessOwnerHeader />
        <main className="p-6">
          {renderTabContent()}
        </main>
      </div>
    </div>
  )
}

export default BusinessOwnerDashboard
