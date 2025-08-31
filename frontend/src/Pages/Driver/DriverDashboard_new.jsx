import React from 'react'
import { useLocation } from 'react-router-dom'
import DriverSidebar from '../../Components/Driver/Sidebar'
import DriverHeader from '../../Components/Driver/Header'

// Tab Components (we'll create these)
import DriverOverview from '../../Components/Driver/Overview'
import DriverTrips from '../../Components/Driver/Trips'
import DriverHistory from '../../Components/Driver/History'
import DriverEarnings from '../../Components/Driver/Earnings'
import DriverAvailability from '../../Components/Driver/Availability'
import DriverVehicle from '../../Components/Driver/Vehicle'
import DriverProfile from '../../Components/Driver/Profile'
import DriverSettings from '../../Components/Driver/Settings'

function DriverDashboard() {
    const location = useLocation()
    const urlParams = new URLSearchParams(location.search)
    const activeTab = urlParams.get('tab') || 'overview'

    // Mock data for the dashboard
    const mockData = {
        profile: {
            name: 'John Smith',
            email: 'john.smith@example.com',
            licenseNumber: 'DL123456789',
            rating: 4.8,
            totalTrips: 157,
            status: 'Active',
            earnings: 3200
        },
        trips: [
            { id: 1, customer: 'Alice Johnson', pickup: '123 Main St', dropoff: '456 Oak Ave', date: '2024-01-20', amount: 45, status: 'Completed' },
            { id: 2, customer: 'Bob Wilson', pickup: '789 Pine St', dropoff: '321 Elm Ave', date: '2024-01-21', amount: 35, status: 'Active' },
            { id: 3, customer: 'Carol Brown', pickup: '555 Cedar St', dropoff: '777 Maple Ave', date: '2024-01-22', amount: 50, status: 'Scheduled' }
        ],
        vehicle: {
            make: 'Toyota',
            model: 'Camry',
            year: 2023,
            licensePlate: 'ABC-1234',
            status: 'Active',
            lastMaintenance: '2024-01-15'
        },
        earnings: {
            today: 120,
            thisWeek: 680,
            thisMonth: 3200,
            total: 15750
        }
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <DriverOverview data={mockData} />
            case 'trips':
                return <DriverTrips trips={mockData.trips} />
            case 'history':
                return <DriverHistory trips={mockData.trips} />
            case 'earnings':
                return <DriverEarnings earnings={mockData.earnings} />
            case 'availability':
                return <DriverAvailability />
            case 'vehicle':
                return <DriverVehicle vehicle={mockData.vehicle} />
            case 'profile':
                return <DriverProfile profile={mockData.profile} />
            case 'settings':
                return <DriverSettings />
            default:
                return <DriverOverview data={mockData} />
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DriverSidebar />
            <div className="flex-1">
                <DriverHeader />
                <main className="p-6">
                    {renderTabContent()}
                </main>
            </div>
        </div>
    )
}

export default DriverDashboard
