import React from 'react'
import { Link, useLocation } from 'react-router-dom'

function ClientSidebar() {
  const location = useLocation()

  const menuItems = [
    {
      name: 'Profile',
      path: '/client-dashboard?tab=profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      name: 'Dashboard',
      path: '/client-dashboard?tab=overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z" />
        </svg>
      )
    },
    {
      name: 'My Bookings',
      path: '/client-dashboard?tab=bookings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      name: 'Payment History',
      path: '/client-dashboard?tab=payments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      name: 'Favorites',
      path: '/client-dashboard?tab=favorites',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      name: 'Support',
      path: '/client-dashboard?tab=support',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className="bg-blue-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <Link to="/" className="text-xl font-bold text-center block text-white">
          Pick & Go
        </Link>
        <p className="text-blue-200 text-sm text-center mt-1">Client Portal</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const currentPath = location.pathname + location.search
          const urlParams = new URLSearchParams(location.search)
          const currentTab = urlParams.get('tab') || 'overview'

          // Determine if this item is active
          let isActive = false
          if (item.path === '/client-dashboard?tab=profile') {
            isActive = currentTab === 'profile'
          } else if (item.path === '/client-dashboard?tab=overview') {
            isActive = currentTab === 'overview'
          } else if (item.path === '/client-dashboard?tab=bookings') {
            isActive = currentTab === 'bookings'
          } else if (item.path === '/client-dashboard?tab=payments') {
            isActive = currentTab === 'payments'
          } else if (item.path === '/client-dashboard?tab=favorites') {
            isActive = currentTab === 'favorites'
          } else if (item.path === '/client-dashboard?tab=support') {
            isActive = currentTab === 'support'
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                ? 'bg-blue-600 text-white'
                : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-blue-700">
        <Link
          to="/login"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-200 hover:bg-red-600 hover:text-white transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </Link>
      </div>
    </div>
  )
}

export default ClientSidebar