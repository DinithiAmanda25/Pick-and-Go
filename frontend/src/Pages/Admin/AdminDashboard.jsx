import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AdminSidebar from '../../Components/Admin/Sidebar'
import AdminHeader from '../../Components/Admin/Header'
import AdminOverview from './AdminOverview'
import AdminBookingManagement from '../../Components/Admin/AdminBookingManagement'
import AdminDriverSchedule from '../../Components/Admin/AdminDriverSchedule'

const AdminDashboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data for stats
  const stats = [
    { title: 'Total Users', value: '1,234', change: '+12%', color: 'red', icon: '👥' },
    { title: 'Active Vehicles', value: '456', change: '+8%', color: 'red', icon: '🚗' },
    { title: 'Total Bookings', value: '789', change: '+15%', color: 'red', icon: '📋' },
    { title: 'Revenue', value: '$12,345', change: '+22%', color: 'red', icon: '💰' }
  ]

  // Mock data for recent activity
  const recentActivity = [
    { type: 'user', message: 'New user registered: John Doe', time: '5 min ago' },
    { type: 'booking', message: 'Booking #B123 completed', time: '10 min ago' },
    { type: 'vehicle', message: 'Vehicle V456 added to fleet', time: '15 min ago' },
    { type: 'payment', message: 'Payment of $299 received', time: '20 min ago' }
  ]

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [location])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    navigate(`?tab=${tab}`)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <AdminHeader />

        {/* Dashboard Content */}
        <div className="p-6">
          <motion.div
            className="bg-white rounded-xl shadow-lg border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-8">
              {activeTab === 'overview' && (
                <AdminOverview stats={stats} recentActivity={recentActivity} />
              )}

              {activeTab === 'users' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">User Management</h2>
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
                    User management component is under development.
                  </div>
                </div>
              )}

              {activeTab === 'vehicles' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Vehicle Management</h2>
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
                    Vehicle management component is under development.
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <AdminBookingManagement />
              )}

              {activeTab === 'driver-schedule' && (
                <AdminDriverSchedule />
              )}

              {activeTab === 'reports' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Reports & Analytics</h2>
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
                    Reports and analytics component is under development.
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">System Settings</h2>
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
                    System settings component is under development.
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard