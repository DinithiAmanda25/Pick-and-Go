import React, { useState } from 'react'
import { Link } from 'react-router-dom'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Pick & Go
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 transition duration-300">
              Home
            </Link>
            {/* Rent Vehicle removed from header - booking handled on Home page */}
            <a href="#about" className="text-gray-600 hover:text-blue-600 transition duration-300">
              About
            </a>
            <a href="#services" className="text-gray-600 hover:text-blue-600 transition duration-300">
              Services
            </a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600 transition duration-300">
              Contact
            </a>
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-600 hover:text-blue-600 transition duration-300"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Register
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/" className="block px-3 py-2 text-gray-600 hover:text-blue-600">
                Home
              </Link>
              {/* Rent Vehicle removed from mobile menu - booking handled on Home page */}
              <a href="#about" className="block px-3 py-2 text-gray-600 hover:text-blue-600">
                About
              </a>
              <a href="#services" className="block px-3 py-2 text-gray-600 hover:text-blue-600">
                Services
              </a>
              <a href="#contact" className="block px-3 py-2 text-gray-600 hover:text-blue-600">
                Contact
              </a>
              <div className="border-t border-gray-200 pt-2">
                <Link to="/login" className="block px-3 py-2 text-gray-600 hover:text-blue-600">
                  Login
                </Link>
                <Link to="/register" className="block px-3 py-2 bg-blue-600 text-white rounded-md mx-3 text-center">
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header