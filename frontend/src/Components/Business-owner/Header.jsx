import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../Assets/2.png'

function BusinessOwnerHeader() {
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
                        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                            5 Pending Applications
                        </div>
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

                    {/* Profile Dropdown */}
                    <div className="flex items-center space-x-3">
                        <img
                            src="/api/placeholder/40/40"
                            alt="Business Owner Profile"
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div className="hidden md:block">
                            <p className="text-sm font-medium text-gray-900">Sarah Wilson</p>
                            <p className="text-xs text-gray-600">Business Owner</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default BusinessOwnerHeader
