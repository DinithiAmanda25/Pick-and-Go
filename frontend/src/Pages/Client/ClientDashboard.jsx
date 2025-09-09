import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import authService from '../../Services/Auth-service.js'
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
  const initialTab = params.get('tab') || 'profile'
  const [activeTab, setActiveTab] = useState(initialTab)

  // Get authenticated user data
  const { user, getCurrentUserId, getSessionData } = useAuth()
  const userId = getCurrentUserId()
  const sessionData = getSessionData()

  useEffect(() => {
    const p = new URLSearchParams(location.search)
    const t = p.get('tab') || 'profile'
    if (t !== activeTab) {
      setActiveTab(t)
    }
  }, [location.search, activeTab])

  // Get real user profile data
  const getUserProfile = () => {
    if (!user) return null;

    return {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      address: user.address || {},
      preferences: user.preferences || {},
      profileImage: user.profileImage || null,
      joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
      userId: user._id || user.id,
      role: user.role || 'client'
    };
  };

  const profile = getUserProfile();

  // Profile actions
  const handleProfileUpdate = async (updatedData) => {
    try {
      console.log('Profile update requested:', updatedData);

      if (!userId) {
        alert('User ID not found. Please log in again.');
        return;
      }

      // Call the API to update client profile
      const response = await authService.updateClientProfile(userId, updatedData);

      if (response.success) {
        alert('Profile updated successfully!');
        // The auth service automatically updates localStorage
        // Force a re-render by updating the auth context
        window.location.reload(); // Simple way to refresh user data
      } else {
        alert('Failed to update profile: ' + response.message);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile. Please try again.');
    }
  }

  const handleProfileDelete = () => {
    const ok = window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')
    if (ok) {
      // TODO: Implement API call to delete client profile
      console.log('Profile deletion requested for user:', userId);
      // navigate to home or login after deletion
    }
  }

  // Mock data for bookings and other sections
  const mockBookings = [
    {
      id: 1,
      vehicle: 'Honda Civic 2023',
      driver: 'John Smith',
      status: 'upcoming',
      pickupLocation: 'Colombo Airport',
      dropoffLocation: 'Kandy',
      pickupDate: '2024-01-25',
      dropoffDate: '2024-01-27',
      pickupTime: '10:00',
      dropoffTime: '10:00',
      totalAmount: 5500,
      duration: '2 days'
    },
    {
      id: 2,
      vehicle: 'Toyota Corolla 2022',
      driver: 'Sarah Wilson',
      status: 'confirmed',
      pickupLocation: 'Galle Fort',
      dropoffLocation: 'Colombo',
      pickupDate: '2024-01-20',
      dropoffDate: '2024-01-21',
      pickupTime: '08:00',
      dropoffTime: '18:00',
      totalAmount: 3200,
      duration: '1 day'
    },
    {
      id: 3,
      vehicle: 'Nissan Sentra 2023',
      driver: 'Mike Johnson',
      status: 'completed',
      pickupLocation: 'Negombo Beach',
      dropoffLocation: 'Nuwara Eliya',
      pickupDate: '2024-01-15',
      dropoffDate: '2024-01-18',
      pickupTime: '06:00',
      dropoffTime: '20:00',
      totalAmount: 8500,
      duration: '3 days'
    }
  ]

  const handleViewBookingDetails = (bookingId) => {
    console.log('Viewing details for booking:', bookingId)
    alert(`Viewing details for booking ${bookingId}`)
  }

  const downloadInvoice = (bookingId) => {
    console.log('Downloading invoice for booking:', bookingId)
    alert(`Downloading invoice for booking ${bookingId}`)
  }

  const getContentByTab = (tab) => {
    switch (tab) {
      case 'overview':
        return <Overview mockBookings={mockBookings} setActiveTab={setActiveTab} />
      case 'bookings':
        return (
          <BookingsEnhanced
            mockBookings={mockBookings}
            onViewDetails={handleViewBookingDetails}
            downloadInvoice={downloadInvoice}
          />
        )
      case 'payments':
        return <PaymentEnhanced />
      case 'ratings':
        return <RatingsFeedback />
      case 'favorites':
        return <FavoritesEnhanced />
      case 'profile':
        return (
          <ProfileSimplified
            profile={profile}
            onUpdateProfile={handleProfileUpdate}
            onDeleteProfile={handleProfileDelete}
          />
        )
      case 'support':
        return <Support />
      default:
        return (
          <ProfileSimplified
            profile={profile}
            onUpdateProfile={handleProfileUpdate}
            onDeleteProfile={handleProfileDelete}
          />
        )
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Fixed Position */}
      <div className="fixed top-0 left-0 h-full z-10">
        <ClientSidebar />
      </div>

      {/* Main Content - With proper margin to account for fixed sidebar */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="w-full">
          <ClientHeader />
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Content based on active tab */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
            <div className="p-8">
              <div className="animate-slide-in">
                {getContentByTab(activeTab)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDashboard
