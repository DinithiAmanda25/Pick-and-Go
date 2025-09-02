import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

function ClientMainHeader() {
    const location = useLocation()
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            setIsScrolled(scrollTop > 100) // Change header after scrolling 100px
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const isActiveRoute = (path) => {
        if (path === '/' && location.pathname === '/') return true
        if (path !== '/' && location.pathname.startsWith(path)) return true
        return false
    }

    return (
        <header className={`backdrop-blur-md shadow-lg border-b sticky top-0 z-50 transition-all duration-300 ${isScrolled
            ? 'bg-white/98 border-gray-200/80 shadow-xl'
            : 'bg-white/95 border-gray-100/50 shadow-lg'
            }`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center space-x-4 group">
                        <div className="relative">
                            <div className={`w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${isScrolled ? 'shadow-xl' : 'shadow-lg'
                                }`}>
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-xl'
                                }`}>
                                Pick & Go
                            </span>
                            <span className={`text-xs font-medium transition-all duration-300 ${isScrolled ? 'text-gray-600' : 'text-gray-500'
                                }`}>Premium Vehicle Rental</span>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center space-x-8">
                        <Link
                            to="/"
                            className={`relative font-medium transition-colors duration-200 group ${isActiveRoute('/')
                                ? 'text-blue-600 font-semibold'
                                : `${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-gray-600 hover:text-blue-600'}`
                                }`}
                        >
                            <span>Home</span>
                            <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-200 ${isActiveRoute('/') ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}></div>
                        </Link>
                        <Link
                            to="/vehicle-rental"
                            className={`relative font-medium transition-colors duration-200 group ${isActiveRoute('/vehicle-rental')
                                ? 'text-blue-600 font-semibold'
                                : `${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-gray-600 hover:text-blue-600'}`
                                }`}
                        >
                            <span>Vehicles</span>
                            <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-200 ${isActiveRoute('/vehicle-rental') ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}></div>
                        </Link>
                        <Link
                            to="/services"
                            className={`relative font-medium transition-colors duration-200 group ${isActiveRoute('/services')
                                ? 'text-blue-600 font-semibold'
                                : `${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-gray-600 hover:text-blue-600'}`
                                }`}
                        >
                            <span>Services</span>
                            <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-200 ${isActiveRoute('/services') ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}></div>
                        </Link>
                        <Link
                            to="/about"
                            className={`relative font-medium transition-colors duration-200 group ${isActiveRoute('/about')
                                ? 'text-blue-600 font-semibold'
                                : `${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-gray-600 hover:text-blue-600'}`
                                }`}
                        >
                            <span>About</span>
                            <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-200 ${isActiveRoute('/about') ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}></div>
                        </Link>
                        <Link
                            to="/contact"
                            className={`relative font-medium transition-colors duration-200 group ${isActiveRoute('/contact')
                                ? 'text-blue-600 font-semibold'
                                : `${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-gray-600 hover:text-blue-600'}`
                                }`}
                        >
                            <span>Contact</span>
                            <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-200 ${isActiveRoute('/contact') ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}></div>
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-4">
                        {/* Join as Driver Button */}
                        <Link
                            to="/driver-onboarding"
                            className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isScrolled
                                    ? 'text-green-700 hover:text-white hover:bg-green-600 border border-green-600'
                                    : 'text-green-600 hover:text-white hover:bg-green-600 border border-green-600'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span>Join as Driver</span>
                        </Link>

                        <Link to="/login" className={`hidden md:block font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-blue-50 ${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 ${isScrolled ? 'shadow-xl' : 'shadow-lg'} hover:shadow-xl`}
                        >
                            Get Started
                        </Link>

                        {/* Mobile Menu Button */}
                        <button className={`lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${isScrolled ? 'text-gray-700' : 'text-gray-600'}`}>
                            <svg className={`w-6 h-6 ${isScrolled ? 'text-gray-700' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default ClientMainHeader
