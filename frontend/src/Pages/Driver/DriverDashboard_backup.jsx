import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../../Components/Driver/Header.jsx'
import Sidebar from '../../Components/Driver/Sidebar.jsx'
import DriverOverview from '../../Components/Driver/Overview.jsx'
import DriverTrips from '../../Components/Driver/Trips.jsx'
import DriverHistory from '../../Components/Driver/History.jsx'
import DriverEarnings from '../../Components/Driver/Earnings.jsx'
import DriverAvailability from '../../Components/Driver/Availability.jsx'
import DriverVehicle from '../../Components/Driver/Vehicle.jsx'
import DriverProfile from '../../Components/Driver/Profile.jsx'
import DriverSettings from '../../Components/Driver/Settings.jsx'

function DriverDashboard() {
    const [searchParams, setSearchParams] = useSearchParams()
    const activeTab = searchParams.get('tab') || 'overview'

    const tabs = [
        { id: 'overview', label: 'Overview', component: DriverOverview },
        { id: 'trips', label: 'Active Trips', component: DriverTrips },
        { id: 'history', label: 'Trip History', component: DriverHistory },
        { id: 'earnings', label: 'Earnings', component: DriverEarnings },
        { id: 'availability', label: 'Availability', component: DriverAvailability },
        { id: 'vehicle', label: 'Vehicle Status', component: DriverVehicle },
        { id: 'profile', label: 'Profile', component: DriverProfile },
        { id: 'settings', label: 'Settings', component: DriverSettings },
    ]

    const handleTabClick = (tabId) => {
        setSearchParams({ tab: tabId })
    }

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || DriverOverview

    // Mock data for props
    const mockData = {
        driver: {
            id: 'DRV001',
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '+1 (555) 123-4567',
            licenseNumber: 'DL123456789',
            rating: 4.8,
            totalTrips: 1256,
            joinDate: '2023-01-15',
            isOnline: true,
            profilePicture: null
        },
        stats: {
            todayEarnings: 125.50,
            weekEarnings: 892.30,
            monthEarnings: 3456.80,
            totalEarnings: 28934.50,
            todayTrips: 12,
            weekTrips: 45,
            monthTrips: 187,
            averageRating: 4.8,
            totalReviews: 1102,
            onlineHours: 8.5,
            acceptanceRate: 94
        },
        activeTrips: [
            {
                id: 'TRIP001',
                pickupLocation: 'Downtown Mall',
                dropoffLocation: 'Airport Terminal 1',
                customerName: 'Sarah Johnson',
                fare: 28.50,
                distance: 15.2,
                estimatedTime: 25,
                status: 'in_progress'
            },
            {
                id: 'TRIP002',
                pickupLocation: 'Hotel Grand Plaza',
                dropoffLocation: 'City Center',
                customerName: 'Michael Brown',
                fare: 18.75,
                distance: 8.5,
                estimatedTime: 15,
                status: 'requested'
            }
        ],
        tripHistory: [
            {
                id: 'TRIP_H001',
                date: '2024-12-27',
                pickup: 'Central Station',
                dropoff: 'Business District',
                customer: 'Emily Davis',
                fare: 22.50,
                rating: 5,
                distance: 12.3,
                duration: 28
            },
            {
                id: 'TRIP_H002',
                date: '2024-12-27',
                pickup: 'Shopping Center',
                dropoff: 'Residential Area',
                customer: 'Robert Wilson',
                fare: 16.80,
                rating: 4,
                distance: 9.1,
                duration: 22
            },
            {
                id: 'TRIP_H003',
                date: '2024-12-26',
                pickup: 'Airport',
                dropoff: 'Hotel District',
                customer: 'Lisa Anderson',
                fare: 35.20,
                rating: 5,
                distance: 18.7,
                duration: 32
            }
        ],
        vehicle: {
            id: 'VEH001',
            make: 'Toyota',
            model: 'Camry',
            year: 2022,
            plateNumber: 'ABC-1234',
            status: 'active',
            mileage: 45623,
            fuelLevel: 75,
            lastMaintenance: '2024-11-15',
            nextMaintenance: '2024-12-15',
            insurance: {
                provider: 'State Farm',
                policyNumber: 'SF123456789',
                expiryDate: '2024-12-31'
            }
        }
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                {/* Tab Navigation */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-6">
                        <nav className="flex space-x-8 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                                            ? 'border-orange-500 text-orange-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <ActiveComponent {...mockData} />
                </main>
            </div>
        </div>
    )
}

export default DriverDashboard
