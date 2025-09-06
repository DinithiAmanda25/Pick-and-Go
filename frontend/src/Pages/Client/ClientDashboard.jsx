import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ClientSidebar from '../../Components/Clients/Sidebar'
import ClientHeader from '../../Components/Clients/Header'
import Overview from '../../Components/Clients/Overview'
import BookingsEnhanced from '../../Components/Clients/BookingsEnhanced'
import ProfileSimplified from '../../Components/Clients/ProfileSimplified'
import PaymentEnhanced from '../../Components/Clients/PaymentEnhanced'
import FavoritesEnhanced from '../../Components/Clients/FavoritesEnhanced'
import Support from '../../Components/Clients/Support'
import RatingsFeedback from '../../Components/Clients/RatingsFeedback'

function ClientDashboard() {
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
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    address: '123 Main Street',
    city: 'New York',
    zipCode: '10001',
    dateOfBirth: '1990-01-15',
    licenseNumber: 'DL123456789'
  })

  // Profile actions
  const handleProfileUpdate = (updatedData) => {
    setProfileData((prev) => ({ ...prev, ...updatedData }))
    alert('Profile updated successfully')
  }

  const handleProfileDelete = () => {
    const ok = window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')
    if (ok) {
      // Clear profile data locally — in a real app, call API then log out/navigate
      setProfileData({})
      // navigate to home or login after deletion
      window.location.href = '/'
    }
  }


  // Enhanced mock booking data with more comprehensive details
  const mockBookings = [
    {
      id: 1,
      vehicle: {
        name: 'Toyota Camry 2023',
        image: '/api/placeholder/300/200',
        type: 'sedan'
      },
      driver: {
        name: 'John Smith',
        image: '/api/placeholder/100/100'
      },
      withDriver: true,
      bookingDate: '2024-01-15',
      pickupDate: '2024-01-20',
      dropoffDate: '2024-01-25',
      pickupTime: '10:00',
      dropoffTime: '18:00',
      status: 'confirmed',
      totalAmount: 375,
      invoiceId: 'INV-001'
    },
    {
      id: 2,
      vehicle: {
        name: 'Honda CR-V 2022',
        image: '/api/placeholder/300/200',
        type: 'suv'
      },
      driver: null,
      withDriver: false,
      bookingDate: '2024-01-10',
      pickupDate: '2024-01-12',
      dropoffDate: '2024-01-15',
      pickupTime: '09:00',
      dropoffTime: '17:00',
      status: 'completed',
      totalAmount: 225,
      invoiceId: 'INV-002'
    },
    {
      id: 3,
      vehicle: {
        name: 'BMW X3 2023',
        image: '/api/placeholder/300/200',
        type: 'luxury'
      },
      driver: {
        name: 'Mike Johnson',
        image: '/api/placeholder/100/100'
      },
      withDriver: true,
      bookingDate: '2024-02-01',
      pickupDate: '2024-02-05',
      dropoffDate: '2024-02-08',
      pickupTime: '11:00',
      dropoffTime: '16:00',
      status: 'pending',
      totalAmount: 450,
      invoiceId: 'INV-003'
    }
  ]

  // Mock payments & favorites
  const mockPayments = [
    { id: 1, description: 'Booking Payment — Honda CR-V', date: '2024-01-15', amount: 225 },
    { id: 2, description: 'Booking Payment — Toyota Camry', date: '2024-01-20', amount: 375 },
  ]

  const mockFavorites = [
    { id: 101, name: 'Toyota Camry', image: '/api/placeholder/400/200', type: 'Sedan' }
  ]

  // (profile updates handled by handleProfileUpdate(updatedData) above)

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    })
  }

  const downloadInvoice = (invoiceId) => {
    alert(`Downloading invoice ${invoiceId}`)
  }

  // Enhanced booking management functions
  const handleCancelBooking = (bookingId, reason) => {
    console.log(`Cancelling booking ${bookingId} with reason: ${reason}`)
    alert('Booking cancelled successfully!')
  }

  const handleModifyBooking = (bookingId, modifications) => {
    console.log(`Modifying booking ${bookingId}:`, modifications)
    alert('Booking modified successfully!')
  }

  const handleViewBookingDetails = (booking) => {
    console.log('Viewing booking details:', booking)
    alert(`Viewing details for booking #${booking.id}`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50">
        <ClientSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <ClientHeader />

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Content based on active tab */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
            <div className="p-8">
              <div className="animate-slide-in">
                {activeTab === 'overview' && (
                  <Overview mockBookings={mockBookings} setActiveTab={setActiveTab} />
                )}

                {activeTab === 'bookings' && (
                  <BookingsEnhanced
                    mockBookings={mockBookings}
                    onCancelBooking={handleCancelBooking}
                    onModifyBooking={handleModifyBooking}
                    onViewDetails={handleViewBookingDetails}
                    downloadInvoice={downloadInvoice}
                  />
                )}

                {activeTab === 'payments' && (
                  <PaymentEnhanced />
                )}

                {activeTab === 'ratings' && (
                  <RatingsFeedback />
                )}

                {activeTab === 'favorites' && (
                  <FavoritesEnhanced />
                )}

                {activeTab === 'profile' && (
                  <ProfileSimplified />
                )}

                {activeTab === 'support' && (
                  <Support />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDashboard