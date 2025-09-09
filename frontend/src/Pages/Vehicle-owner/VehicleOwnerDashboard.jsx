import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import VehicleOwnerService from '../../Services/vehicle-owner-service.js'
import VehicleOwnerSidebar from '../../Components/Vehicle-owner/Sidebar'
import VehicleOwnerHeader from '../../Components/Vehicle-owner/Header'
import VehicleOwnerOverview from '../../Components/Vehicle-owner/Overview'
import MyVehicles from '../../Components/Vehicle-owner/MyVehicles'
import VehicleOwnerReports from '../../Components/Vehicle-owner/Reports'
import VehicleOwnerAgreements from '../../Components/Vehicle-owner/Agreements'
import VehicleOwnerBookings from '../../Components/Vehicle-owner/Bookings'
import VehicleOwnerPayments from '../../Components/Vehicle-owner/Payments'
import VehicleOwnerFeedback from '../../Components/Vehicle-owner/Feedback'
import VehicleOwnerProfile from '../../Components/Vehicle-owner/VehicleOwnerProfile'

function VehicleOwnerDashboard() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const initialTab = params.get('tab') || 'profile'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Get authenticated user data
  const { user, getCurrentUserId, getSessionData } = useAuth()
  const userId = getCurrentUserId()
  const sessionData = getSessionData()

  // Fetch fresh profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (userId) {
          console.log('Fetching fresh profile data for userId:', userId)

          // Use the VehicleOwner service to fetch profile
          try {
            const response = await vehicleOwnerService.getProfile(userId);
            console.log('Profile service response:', response);

            if (response.success && response.user) {
              console.log('Setting profile from service response:', response.user)
              setProfile(response.user)
              setLoading(false)
              return
            }
          } catch (apiError) {
            console.error('VehicleOwner service call failed:', apiError)
          }

          // Fallback to context data
          console.log('Using fallback context data')
          setProfile(getUserProfileFromContext())
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        // Fallback to user data from context
        setProfile(getUserProfileFromContext())
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  useEffect(() => {
    const p = new URLSearchParams(location.search)
    const t = p.get('tab') || 'profile'
    if (t !== activeTab) {
      setActiveTab(t)
    }
  }, [location.search, activeTab])

  // Fallback: Get user profile data from context
  const getUserProfileFromContext = () => {
    if (!user) return null;

    console.log('getUserProfileFromContext - Raw user data:', user);
    console.log('getUserProfileFromContext - User address:', user.address);

    return {
      // Core user information from MongoDB document
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || 'Vehicle Owner',
      email: user.email || 'No email provided',
      phone: user.phone || 'No phone provided',
      firstName: user.firstName || '',
      lastName: user.lastName || '',

      // Address information from nested address object - try multiple possible locations
      address: {
        street: user.address?.street || user.street || '',
        city: user.address?.city || user.city || '',
        state: user.address?.state || user.state || '',
        zipCode: user.address?.zipCode || user.zipCode || ''
      },

      // Dates and timestamps
      joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,

      // Vehicle owner specific data
      role: user.role,
      isActive: user.isActive,
      documents: user.documents || [],

      // Business metrics (would come from vehicle/booking services in real implementation)
      totalVehicles: 0,
      totalEarnings: 0,
      averageRating: 0,

      // Database identifiers
      userId: user._id || user.id,
      _id: user._id
    };
  };

  // Show loading state while fetching profile
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  // Mock data for other sections (vehicles, bookings, etc.) - to be replaced with real data later
  const mockData = {
    vehicles: [
      {
        id: 1,
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        plate: 'ABC-123',
        status: 'available',
        type: 'Sedan',
        location: 'Colombo Central',
        fuelEfficiency: '28 mpg',
        lastService: '2024-01-15',
        nextService: '2024-04-15',
        mileage: 25000,
        documents: ['Registration', 'Insurance', 'Inspection']
      },
      {
        id: 2,
        make: 'Honda',
        model: 'Civic',
        year: 2021,
        plate: 'XYZ-789',
        status: 'rented',
        type: 'Sedan',
        location: 'Kandy',
        fuelEfficiency: '32 mpg',
        lastService: '2024-01-10',
        nextService: '2024-04-10',
        mileage: 18500,
        documents: ['Registration', 'Insurance', 'Inspection']
      },
      {
        id: 3,
        make: 'Ford',
        model: 'Focus',
        year: 2020,
        plate: 'DEF-456',
        status: 'maintenance',
        type: 'Hatchback',
        location: 'Galle',
        fuelEfficiency: '30 mpg',
        lastService: '2024-01-20',
        nextService: '2024-04-20',
        mileage: 32000,
        documents: ['Registration', 'Insurance']
      }
    ],
    bookings: [
      {
        id: 1,
        vehicleId: 1,
        vehicle: 'Toyota Camry',
        customer: 'John Smith',
        customerPhone: '+1 (555) 987-6543',
        startDate: '2024-01-25',
        endDate: '2024-01-28',
        amount: 450,
        status: 'upcoming',
        mileage: 150,
        pickupLocation: 'Colombo Airport',
        dropoffLocation: 'Kandy City'
      },
      {
        id: 2,
        vehicleId: 2,
        vehicle: 'Honda Civic',
        customer: 'Jane Doe',
        customerPhone: '+1 (555) 876-5432',
        startDate: '2024-01-20',
        endDate: '2024-01-23',
        amount: 380,
        status: 'active',
        mileage: 120,
        pickupLocation: 'Kandy Railway Station',
        dropoffLocation: 'Nuwara Eliya'
      },
      {
        id: 3,
        vehicleId: 1,
        vehicle: 'Toyota Camry',
        customer: 'Bob Wilson',
        customerPhone: '+1 (555) 765-4321',
        startDate: '2024-01-15',
        endDate: '2024-01-18',
        amount: 420,
        status: 'completed',
        mileage: 200,
        pickupLocation: 'Colombo Fort',
        dropoffLocation: 'Negombo Beach'
      }
    ],
    payments: [
      {
        id: 1,
        vehicleId: 1,
        vehicle: 'Toyota Camry',
        vehiclePlate: 'ABC-123',
        customer: 'John Smith',
        amount: 450,
        date: '2024-01-25',
        dueDate: '2024-01-28',
        status: 'Pending',
        bookingId: 1,
        paymentMethod: 'Credit Card'
      },
      {
        id: 2,
        vehicleId: 2,
        vehicle: 'Honda Civic',
        vehiclePlate: 'XYZ-789',
        customer: 'Jane Doe',
        amount: 380,
        date: '2024-01-20',
        dueDate: '2024-01-23',
        status: 'Paid',
        bookingId: 2,
        paymentMethod: 'PayPal'
      },
      {
        id: 3,
        vehicleId: 1,
        vehicle: 'Toyota Camry',
        vehiclePlate: 'ABC-123',
        customer: 'Bob Wilson',
        amount: 420,
        date: '2024-01-15',
        dueDate: '2024-01-18',
        status: 'Paid',
        bookingId: 3,
        paymentMethod: 'Bank Transfer'
      },
      {
        id: 4,
        vehicleId: 3,
        vehicle: 'Ford Focus',
        vehiclePlate: 'DEF-456',
        customer: 'Alice Brown',
        amount: 320,
        date: '2024-01-10',
        dueDate: '2024-01-13',
        status: 'Overdue',
        bookingId: 4,
        paymentMethod: 'Credit Card'
      }
    ],
    agreements: [
      {
        id: 1,
        vehicle: 'Toyota Camry',
        vehiclePlate: 'ABC-123',
        customer: 'John Smith',
        customerPhone: '+1 (555) 987-6543',
        startDate: '2024-01-25',
        expiryDate: '2024-01-28',
        status: 'Upcoming',
        dailyRate: 150,
        mileageLimit: 200,
        insurance: 'Full Coverage'
      },
      {
        id: 2,
        vehicle: 'Honda Civic',
        vehiclePlate: 'XYZ-789',
        customer: 'Jane Doe',
        customerPhone: '+1 (555) 876-5432',
        startDate: '2024-01-20',
        expiryDate: '2024-01-23',
        status: 'Active',
        dailyRate: 120,
        mileageLimit: 150,
        insurance: 'Standard Coverage'
      },
      {
        id: 3,
        vehicle: 'Toyota Camry',
        vehiclePlate: 'ABC-123',
        customer: 'Bob Wilson',
        customerPhone: '+1 (555) 765-4321',
        startDate: '2024-01-15',
        expiryDate: '2024-01-18',
        status: 'Expired',
        dailyRate: 140,
        mileageLimit: 250,
        insurance: 'Full Coverage'
      }
    ],
    feedback: [
      {
        id: 1,
        type: 'client',
        subject: 'Customer Damaged Vehicle',
        message: 'Customer returned my Honda Civic with a scratch on the rear bumper. They did not report it during checkout.',
        priority: 'high',
        category: 'damage',
        date: '2024-01-22',
        status: 'Submitted',
        response: null,
        isEditable: true,
        proofDocuments: [
          { id: 1, name: 'damage_photo_1.jpg', type: 'image/jpeg' },
          { id: 2, name: 'damage_photo_2.jpg', type: 'image/jpeg' }
        ]
      },
      {
        id: 2,
        type: 'system',
        subject: 'Payment Delay Issue',
        message: 'I have not received payment for booking #2 which was completed 5 days ago. The system shows it as paid but I have not received the funds.',
        priority: 'medium',
        category: 'payment',
        date: '2024-01-20',
        status: 'Responded',
        response: 'We have investigated the payment issue and found a delay in processing. Your payment has been expedited and you should receive it within 24 hours.',
        responseDate: '2024-01-21',
        isEditable: false
      }
    ],
    vehicleRatings: [
      {
        id: 1,
        vehicle: 'Toyota Camry',
        customer: 'Bob Wilson',
        rating: 5,
        comment: 'Excellent vehicle! Very clean and comfortable for the long drive.',
        date: '2024-01-18'
      },
      {
        id: 2,
        vehicle: 'Honda Civic',
        customer: 'Jane Doe',
        rating: 4,
        comment: 'Good car, fuel efficient. Minor issue with air conditioning.',
        date: '2024-01-23'
      },
      {
        id: 3,
        vehicle: 'Toyota Camry',
        customer: 'Mary Johnson',
        rating: 5,
        comment: 'Perfect for our family trip. Highly recommend this vehicle.',
        date: '2024-01-12'
      }
    ]
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <VehicleOwnerSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
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
                    vehicles={mockData.vehicles}
                    bookings={mockData.bookings}
                    profile={profile}
                    setActiveTab={setActiveTab}
                  />
                )}

                {activeTab === 'vehicles' && (
                  <MyVehicles />
                )}

                {activeTab === 'bookings' && (
                  <VehicleOwnerBookings bookings={mockData.bookings} />
                )}

                {activeTab === 'reports' && (
                  <VehicleOwnerReports vehicles={mockData.vehicles} bookings={mockData.bookings} />
                )}

                {activeTab === 'agreements' && (
                  <VehicleOwnerAgreements agreements={mockData.agreements} />
                )}

                {activeTab === 'payments' && (
                  <VehicleOwnerPayments payments={mockData.payments} vehicles={mockData.vehicles} />
                )}

                {activeTab === 'feedback' && (
                  <VehicleOwnerFeedback feedback={mockData.feedback} vehicleRatings={mockData.vehicleRatings} />
                )}

                {activeTab === 'profile' && (
                  <VehicleOwnerProfile profile={profile} />
                )}

                {/* Default fallback to Profile */}
                {!['profile', 'overview', 'vehicles', 'bookings', 'reports', 'agreements', 'payments', 'feedback'].includes(activeTab) && (
                  <VehicleOwnerProfile profile={profile} />
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
