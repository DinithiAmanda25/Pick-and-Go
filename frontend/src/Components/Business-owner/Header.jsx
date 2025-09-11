import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import businessOwnerService from '../../Services/business-owner-service'
import logo from '../../Assets/2.png'

function BusinessOwnerHeader() {
    const [showDropdown, setShowDropdown] = useState(false)
    const [pendingCount, setPendingCount] = useState(0)
    const { logout, user } = useAuth()
    const navigate = useNavigate()
    const dropdownRef = useRef(null)

    // Fetch pending applications count
    useEffect(() => {
        const fetchPendingCount = async () => {
            try {
                const response = await businessOwnerService.getPendingApplicationsCount()
                if (response.success) {
                    setPendingCount(response.count)
                }
            } catch (error) {
                console.error('Error fetching pending count:', error)
            }
        }

        fetchPendingCount()
        // Refresh count every 30 seconds
        const interval = setInterval(fetchPendingCount, 30000)
        return () => clearInterval(interval)
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout()
            navigate('/login')
        }
        setShowDropdown(false)
    }

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <img
                        src={logo}
                        alt="Pick & Go Logo"
                        className="h-10 w-auto"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
                        <p className="text-sm text-gray-600">Manage drivers and vehicles for your business</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Pending Applications Count */}
                    <div className="flex items-center space-x-4">
                        {pendingCount > 0 && (
                            <Link
                                to="/business-owner-dashboard?tab=pending-applications"
                                className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-yellow-200 transition-colors"
                            >
                                {pendingCount} Pending Application{pendingCount !== 1 ? 's' : ''}
                            </Link>
                        )}
                    </div>

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

                    {/* Mobile Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="md:hidden p-2 text-gray-600 hover:text-red-600 transition-colors"
                        title="Logout"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>

                    {/* Profile Dropdown - Desktop Only */}
                    <div className="relative hidden md:block" ref={dropdownRef}>
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center space-x-3 focus:outline-none"
                        >
                            <img
                                src="/api/placeholder/40/40"
                                alt="Business Owner Profile"
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            />
                            <div className="hidden md:block">
                                <p className="text-sm font-medium text-gray-900">{user?.businessName || user?.username || 'Business Owner'}</p>
                                <p className="text-xs text-gray-600">Business Owner</p>
                            </div>
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                <Link
                                    to="/business-owner-dashboard?tab=profile"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setShowDropdown(false)}
                                >
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>View Profile</span>
                                    </div>
                                </Link>
                                <hr className="my-1" />
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                >
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Logout</span>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default BusinessOwnerHeader
