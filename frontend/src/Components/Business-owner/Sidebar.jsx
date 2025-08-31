import React from 'react'
import { Link, useLocation } from 'react-router-dom'

function BusinessOwnerSidebar() {
    const location = useLocation()

    const menuItems = [
        {
            name: 'Overview',
            path: '/business-owner-dashboard?tab=overview',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z" />
                </svg>
            )
        },
        {
            name: 'Fleet Management',
            path: '/business-owner-dashboard?tab=fleet',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0" />
                </svg>
            )
        },
        {
            name: 'Bookings',
            path: '/business-owner-dashboard?tab=bookings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            )
        },
        {
            name: 'Revenue',
            path: '/business-owner-dashboard?tab=revenue',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            name: 'Drivers',
            path: '/business-owner-dashboard?tab=drivers',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            )
        },
        {
            name: 'Analytics',
            path: '/business-owner-dashboard?tab=analytics',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            name: 'Profile',
            path: '/business-owner-dashboard?tab=profile',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            name: 'Settings',
            path: '/business-owner-dashboard?tab=settings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        }
    ]

    return (
        <div className="bg-purple-900 text-white w-64 min-h-screen p-4">
            <div className="mb-8">
                <Link to="/" className="text-xl font-bold text-center block text-white">
                    Pick & Go
                </Link>
                <p className="text-purple-200 text-sm text-center mt-1">Business Owner</p>
            </div>

            <nav className="space-y-2">
                {menuItems.map((item) => {
                    const currentPath = location.pathname + location.search
                    const urlParams = new URLSearchParams(location.search)
                    const currentTab = urlParams.get('tab') || 'overview'

                    // Determine if this item is active
                    let isActive = false
                    if (item.path === '/business-owner-dashboard?tab=overview') {
                        isActive = currentTab === 'overview'
                    } else if (item.path === '/business-owner-dashboard?tab=fleet') {
                        isActive = currentTab === 'fleet'
                    } else if (item.path === '/business-owner-dashboard?tab=bookings') {
                        isActive = currentTab === 'bookings'
                    } else if (item.path === '/business-owner-dashboard?tab=revenue') {
                        isActive = currentTab === 'revenue'
                    } else if (item.path === '/business-owner-dashboard?tab=drivers') {
                        isActive = currentTab === 'drivers'
                    } else if (item.path === '/business-owner-dashboard?tab=analytics') {
                        isActive = currentTab === 'analytics'
                    } else if (item.path === '/business-owner-dashboard?tab=profile') {
                        isActive = currentTab === 'profile'
                    } else if (item.path === '/business-owner-dashboard?tab=settings') {
                        isActive = currentTab === 'settings'
                    }

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                                ? 'bg-purple-600 text-white'
                                : 'text-purple-200 hover:bg-purple-800 hover:text-white'
                                }`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="mt-8 pt-8 border-t border-purple-700">
                <Link
                    to="/login"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-purple-200 hover:bg-red-600 hover:text-white transition-colors duration-200"
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

export default BusinessOwnerSidebar
