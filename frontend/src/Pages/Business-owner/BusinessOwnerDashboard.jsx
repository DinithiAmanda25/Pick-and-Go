import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import BusinessOwnerSidebar from '../../Components/Business-owner/Sidebar'
import BusinessOwnerHeader from '../../Components/Business-owner/Header'

// Tab Components
import BusinessOwnerOverview from '../../Components/Business-owner/Overview'
import BusinessOwnerFleet from '../../Components/Business-owner/Fleet'
import BusinessOwnerPackages from '../../Components/Business-owner/Packages'
import BusinessOwnerBookings from '../../Components/Business-owner/Bookings'
import BusinessOwnerRevenue from '../../Components/Business-owner/Revenue'
import BusinessOwnerDrivers from '../../Components/Business-owner/Drivers'
import BusinessOwnerUsers from '../../Components/Business-owner/Users'
import BusinessOwnerAgreements from '../../Components/Business-owner/Agreements'
import BusinessOwnerFeedback from '../../Components/Business-owner/Feedback'
import BusinessOwnerAnalytics from '../../Components/Business-owner/Analytics'
import BusinessOwnerProfile from '../../Components/Business-owner/Profile'
import PendingDriverApplications from '../../Components/Business-owner/PendingDriverApplications'
import PendingApplications from '../../Components/Business-owner/PendingApplications'

function BusinessOwnerDashboard() {
  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)
  const activeTab = urlParams.get('tab') || 'overview'

  // Get authenticated user data
  const { user, getCurrentUserId, getSessionData } = useAuth()
  const userId = getCurrentUserId()
  const sessionData = getSessionData()

  // Debug logging
  console.log('BusinessOwnerDashboard - User:', user)
  console.log('BusinessOwnerDashboard - UserID:', userId)
  console.log('BusinessOwnerDashboard - SessionData:', sessionData)

  // Check if user is authenticated and is a business owner
  if (!user || user.role !== 'business_owner') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Access Denied</h2>
          <p className="text-gray-600">You must be logged in as a Business Owner to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Current user role: {user?.role || 'Not logged in'}</p>
        </div>
      </div>
    )
  }

  // Use actual user data for profile, fallback to defaults for other data
  const mockData = {
    profile: {
      id: userId,
      username: user?.username || '',
      email: user?.email || '',
      businessName: user?.businessName || '',
      contactNumber: user?.contactNumber || '',
      ownerName: user?.ownerName || '',
      businessType: user?.businessType || '',
      businessAddress: user?.businessAddress || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Sri Lanka'
      },
      businessLicense: user?.businessLicense || '',
      taxId: user?.taxId || '',
      website: user?.website || '',
      description: user?.description || '',
      registrationDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
      loginTime: sessionData?.loginTime ? new Date(sessionData.loginTime).toLocaleString() : '',

      // For overview display (these should come from actual business data later)
      name: user?.businessName || 'Business Owner', // Display name for overview
      totalVehicles: 25,
      activeDrivers: 18,
      monthlyRevenue: 45000,
      totalUsers: 156,
      completedBookings: 892,
      averageRating: 4.7
    },
    fleet: [
      {
        id: 1,
        model: 'Toyota Camry 2023',
        plateNumber: 'ABC-123',
        status: 'Active',
        driver: 'John Smith',
        mileage: 12500,
        revenue: 3200,
        rating: 4.8,
        bookingsCount: 45,
        lastService: '2024-01-10'
      },
      {
        id: 2,
        model: 'Honda Accord 2022',
        plateNumber: 'XYZ-789',
        status: 'Active',
        driver: 'Emily Davis',
        mileage: 8900,
        revenue: 2800,
        rating: 4.9,
        bookingsCount: 38,
        lastService: '2024-01-08'
      },
      {
        id: 3,
        model: 'Nissan Altima 2023',
        plateNumber: 'DEF-456',
        status: 'Maintenance',
        driver: null,
        mileage: 15600,
        revenue: 0,
        rating: 4.6,
        bookingsCount: 52,
        lastService: '2024-01-18'
      }
    ],
    packages: [
      {
        id: 1,
        name: 'Economy Package',
        duration: '1 Day',
        price: 45,
        discount: 0,
        vehicles: ['Toyota Corolla', 'Nissan Sentra'],
        features: ['Basic Insurance', 'Roadside Assistance'],
        isActive: true
      },
      {
        id: 2,
        name: 'Premium Weekend',
        duration: '2 Days',
        price: 150,
        discount: 10,
        vehicles: ['Honda Accord', 'Toyota Camry'],
        features: ['Full Insurance', '24/7 Support', 'GPS Navigation'],
        isActive: true
      },
      {
        id: 3,
        name: 'Business Week',
        duration: '7 Days',
        price: 400,
        discount: 15,
        vehicles: ['BMW 3 Series', 'Mercedes C-Class'],
        features: ['Premium Insurance', 'Concierge Service', 'Airport Pickup'],
        isActive: false
      }
    ],
    bookings: [
      {
        id: 1,
        customer: 'Alice Johnson',
        vehicle: 'Toyota Camry',
        driver: 'John Smith',
        startDate: '2024-01-20',
        endDate: '2024-01-22',
        amount: 120,
        status: 'Completed',
        mileage: 250,
        rating: 5
      },
      {
        id: 2,
        customer: 'Bob Wilson',
        vehicle: 'Honda Accord',
        driver: 'Emily Davis',
        startDate: '2024-01-21',
        endDate: '2024-01-23',
        amount: 95,
        status: 'Active',
        mileage: 180,
        rating: null
      },
      {
        id: 3,
        customer: 'Carol Brown',
        vehicle: 'Nissan Altima',
        driver: 'Michael Johnson',
        startDate: '2024-01-25',
        endDate: '2024-01-27',
        amount: 110,
        status: 'Upcoming',
        mileage: 0,
        rating: null
      }
    ],
    drivers: [
      {
        id: 1,
        name: 'John Smith',
        status: 'Active',
        totalTrips: 145,
        rating: 4.8,
        earnings: 4200,
        joinDate: '2023-03-15',
        licenseExpiry: '2025-12-30',
        currentVehicle: 'Toyota Camry',
        phone: '+1 234-567-8901'
      },
      {
        id: 2,
        name: 'Emily Davis',
        status: 'Active',
        totalTrips: 132,
        rating: 4.9,
        earnings: 3800,
        joinDate: '2023-05-20',
        licenseExpiry: '2026-08-15',
        currentVehicle: 'Honda Accord',
        phone: '+1 234-567-8902'
      },
      {
        id: 3,
        name: 'Michael Johnson',
        status: 'Offline',
        totalTrips: 98,
        rating: 4.7,
        earnings: 2900,
        joinDate: '2023-07-10',
        licenseExpiry: '2025-11-20',
        currentVehicle: null,
        phone: '+1 234-567-8903'
      }
    ],
    users: [
      {
        id: 1,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'Customer',
        joinDate: '2023-12-01',
        totalBookings: 8,
        totalSpent: 950,
        lastActivity: '2024-01-19',
        isActive: true
      },
      {
        id: 2,
        name: 'Bob Wilson',
        email: 'bob@example.com',
        role: 'Customer',
        joinDate: '2023-11-15',
        totalBookings: 12,
        totalSpent: 1240,
        lastActivity: '2024-01-21',
        isActive: true
      },
      {
        id: 3,
        name: 'Carol Brown',
        email: 'carol@example.com',
        role: 'Customer',
        joinDate: '2023-08-20',
        totalBookings: 3,
        totalSpent: 280,
        lastActivity: '2023-12-15',
        isActive: false
      }
    ],
    agreements: [
      {
        id: 1,
        bookingId: 1,
        customer: 'Alice Johnson',
        vehicle: 'Toyota Camry',
        createdDate: '2024-01-20',
        expiryDate: '2024-01-22',
        status: 'Expired',
        agreementUrl: '/agreements/AG001.pdf'
      },
      {
        id: 2,
        bookingId: 2,
        customer: 'Bob Wilson',
        vehicle: 'Honda Accord',
        createdDate: '2024-01-21',
        expiryDate: '2024-01-26',
        status: 'Active',
        agreementUrl: '/agreements/AG002.pdf'
      },
      {
        id: 3,
        bookingId: 3,
        customer: 'Carol Brown',
        vehicle: 'Nissan Altima',
        createdDate: '2024-01-25',
        expiryDate: '2024-01-27',
        status: 'Active',
        agreementUrl: '/agreements/AG003.pdf'
      },
      {
        id: 4,
        bookingId: 4,
        customer: 'David Smith',
        vehicle: 'BMW 3 Series',
        createdDate: '2024-01-15',
        expiryDate: '2024-01-18',
        status: 'Expired',
        agreementUrl: '/agreements/AG004.pdf'
      },
      {
        id: 5,
        bookingId: 5,
        customer: 'Emma Davis',
        vehicle: 'Mercedes C-Class',
        createdDate: '2024-01-22',
        expiryDate: '2024-01-24',
        status: 'Pending',
        agreementUrl: '/agreements/AG005.pdf'
      }
    ],
    feedback: [
      {
        id: 1,
        customer: 'Alice Johnson',
        vehicle: 'Toyota Camry',
        driver: 'John Smith',
        rating: 5,
        vehicleRating: 5,
        driverRating: 5,
        comment: 'Excellent service! The car was clean and the driver was very professional.',
        date: '2024-01-22',
        category: 'Service Quality',
        bookingId: 1,
        status: 'Resolved',
        responded: true,
        response: 'Thank you for your wonderful feedback! We appreciate your business.',
        responseDate: '2024-01-23'
      },
      {
        id: 2,
        customer: 'Bob Wilson',
        vehicle: 'Honda Accord',
        driver: 'Emily Davis',
        rating: 4,
        vehicleRating: 4,
        driverRating: 5,
        comment: 'Good experience overall. The vehicle was comfortable.',
        date: '2024-01-21',
        category: 'Vehicle Condition',
        bookingId: 2,
        status: 'New',
        responded: false,
        response: null,
        responseDate: null
      },
      {
        id: 3,
        customer: 'Carol Brown',
        vehicle: 'BMW 3 Series',
        driver: 'Michael Johnson',
        rating: 2,
        vehicleRating: 3,
        driverRating: 2,
        comment: 'The vehicle had some issues and the driver was late. Not satisfied with the service.',
        date: '2024-01-20',
        category: 'Service Quality',
        bookingId: 3,
        status: 'In Progress',
        responded: true,
        response: 'We apologize for the inconvenience. We are investigating this matter and will ensure better service in the future.',
        responseDate: '2024-01-21'
      },
      {
        id: 4,
        customer: 'David Smith',
        vehicle: 'Mercedes C-Class',
        driver: 'Sarah Wilson',
        rating: 5,
        vehicleRating: 5,
        driverRating: 5,
        comment: 'Outstanding service! Luxury vehicle was spotless and driver was excellent.',
        date: '2024-01-19',
        category: 'Service Quality',
        bookingId: 4,
        status: 'Resolved',
        responded: true,
        response: 'Thank you for choosing our premium service! We look forward to serving you again.',
        responseDate: '2024-01-20'
      },
      {
        id: 5,
        customer: 'Emma Davis',
        vehicle: 'Tesla Model 3',
        driver: 'Alex Rodriguez',
        rating: 3,
        vehicleRating: 4,
        driverRating: 3,
        comment: 'Car was great but driver seemed unfamiliar with the route.',
        date: '2024-01-18',
        category: 'Driver Performance',
        bookingId: 5,
        status: 'New',
        responded: false,
        response: null,
        responseDate: null
      },
      {
        id: 6,
        customer: 'Frank Miller',
        vehicle: 'Audi A4',
        driver: 'Lisa Chen',
        rating: 4,
        vehicleRating: 4,
        driverRating: 4,
        comment: 'Good service, vehicle was clean and well-maintained.',
        date: '2024-01-17',
        category: 'Vehicle Condition',
        bookingId: 6,
        status: 'Resolved',
        responded: true,
        response: 'Thank you for your feedback! We maintain our vehicles to the highest standards.',
        responseDate: '2024-01-18'
      }
    ],
    payments: [
      {
        id: 1,
        bookingId: 1,
        customer: 'Alice Johnson',
        amount: 120,
        paymentMethod: 'Credit Card',
        date: '2024-01-20',
        status: 'Completed',
        transactionId: 'TXN001'
      },
      {
        id: 2,
        bookingId: 2,
        customer: 'Bob Wilson',
        amount: 95,
        paymentMethod: 'PayPal',
        date: '2024-01-21',
        status: 'Completed',
        transactionId: 'TXN002'
      }
    ]
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <BusinessOwnerOverview data={mockData} />
      case 'fleet':
        return <BusinessOwnerFleet fleet={mockData.fleet} />
      case 'packages':
        return <BusinessOwnerPackages packages={mockData.packages} />
      case 'bookings':
        return <BusinessOwnerBookings bookings={mockData.bookings} />
      case 'revenue':
        return <BusinessOwnerRevenue payments={mockData.payments} revenue={mockData.profile.monthlyRevenue} />
      case 'drivers':
        return <BusinessOwnerDrivers drivers={mockData.drivers} />
      case 'pending-applications':
        return <PendingApplications />
      case 'pending-drivers':
        return <PendingDriverApplications />
      case 'users':
        return <BusinessOwnerUsers users={mockData.users} />
      case 'agreements':
        return <BusinessOwnerAgreements agreements={mockData.agreements} />
      case 'feedback':
        return <BusinessOwnerFeedback feedback={mockData.feedback} />
      case 'analytics':
        return <BusinessOwnerAnalytics data={mockData} />
      case 'profile':
        // Create clean profile object without business metrics for profile display
        const cleanProfile = {
          id: mockData.profile.id,
          username: mockData.profile.username,
          email: mockData.profile.email,
          businessName: mockData.profile.businessName,
          contactNumber: mockData.profile.contactNumber,
          ownerName: mockData.profile.ownerName,
          businessType: mockData.profile.businessType,
          businessAddress: mockData.profile.businessAddress,
          businessLicense: mockData.profile.businessLicense,
          taxId: mockData.profile.taxId,
          website: mockData.profile.website,
          description: mockData.profile.description,
          registrationDate: mockData.profile.registrationDate,
          loginTime: mockData.profile.loginTime
        }
        return <BusinessOwnerProfile profile={cleanProfile} />
      default:
        return <BusinessOwnerOverview data={mockData} />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <BusinessOwnerSidebar />
      <div className="flex-1 ml-64">
        <BusinessOwnerHeader />
        <main className="p-6">
          {renderTabContent()}
        </main>
      </div>
    </div>
  )
}

export default BusinessOwnerDashboard
