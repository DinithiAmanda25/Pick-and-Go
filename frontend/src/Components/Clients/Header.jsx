import React from 'react'
import { Link } from 'react-router-dom'

function ClientHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back! Manage your rentals and bookings</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Rent a Vehicle removed from client header - use Home page for booking */}

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17H9a4 4 0 01-4-4V7a3 3 0 013-3h4m0 13V4" />
            </svg>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
          </button>

          {/* Messages */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

          {/* Profile Dropdown */}
          <div className="flex items-center space-x-3">
            <img
              src="/api/placeholder/40/40"
              alt="Client Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-600">Premium Member</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default ClientHeader