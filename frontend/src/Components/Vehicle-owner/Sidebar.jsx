import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../../Assets/2.png'

function VehicleOwnerSidebar() {
  const location = useLocation()

  const menuItems = [
    {
      name: 'Profile',
      path: '/vehicle-owner-dashboard?tab=profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      name: 'Overview',
      path: '/vehicle-owner-dashboard?tab=overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z" />
        </svg>
      )
    },
    {
      name: 'My Vehicles',
      path: '/vehicle-owner-dashboard?tab=vehicles',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0" />
        </svg>
      )
    },
    {
      name: 'Vehicle Reports',
      path: '/vehicle-owner-dashboard?tab=reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: 'E-Agreements',
      path: '/vehicle-owner-dashboard?tab=agreements',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: 'Bookings',
      path: '/vehicle-owner-dashboard?tab=bookings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      name: 'Payments & Revenue',
      path: '/vehicle-owner-dashboard?tab=payments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: 'Feedback & Ratings',
      path: '/vehicle-owner-dashboard?tab=feedback',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    }
  ]

  return (
    <div className="bg-green-900 text-white w-64 min-h-screen p-4 fixed left-0 top-0 overflow-y-auto">
      <div className="mb-8 flex flex-col items-center">
        <Link to="/" className="flex items-center space-x-2 justify-center">
          <img
            src={logo}
            alt="Pick & Go Logo"
            className="h-12 w-auto"
          />
          <span className="text-2xl font-bold text-white">Pick & Go</span>
        </Link>
        <p className="text-green-200 text-base mt-2">Vehicle Owner</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const currentPath = location.pathname + location.search
          const urlParams = new URLSearchParams(location.search)
          const currentTab = urlParams.get('tab') || 'overview'

          // Determine if this item is active
          let isActive = false
          if (item.path === '/vehicle-owner-dashboard?tab=overview') {
            isActive = currentTab === 'overview'
          } else if (item.path === '/vehicle-owner-dashboard?tab=vehicles') {
            isActive = currentTab === 'vehicles'
          } else if (item.path === '/vehicle-owner-dashboard?tab=bookings') {
            isActive = currentTab === 'bookings'
          } else if (item.path === '/vehicle-owner-dashboard?tab=earnings') {
            isActive = currentTab === 'earnings'
          } else if (item.path === '/vehicle-owner-dashboard?tab=maintenance') {
            isActive = currentTab === 'maintenance'
          } else if (item.path === '/vehicle-owner-dashboard?tab=analytics') {
            isActive = currentTab === 'analytics'
          } else if (item.path === '/vehicle-owner-dashboard?tab=profile') {
            isActive = currentTab === 'profile'
          } else if (item.path === '/vehicle-owner-dashboard?tab=settings') {
            isActive = currentTab === 'settings'
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                ? 'bg-green-600 text-white'
                : 'text-green-200 hover:bg-green-800 hover:text-white'
                }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-green-700">
        <Link
          to="/login"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-green-200 hover:bg-red-600 hover:text-white transition-colors duration-200"
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

export default VehicleOwnerSidebar
