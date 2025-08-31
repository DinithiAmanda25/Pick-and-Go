import React from 'react'
import { Link } from 'react-router-dom'

function HeroSection() {
  return (
    <section className="pt-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left content */}
          <div className="mb-8 lg:mb-0">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Rent Your Perfect
              <span className="text-blue-600"> Vehicle</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Choose from our wide range of vehicles with or without professional drivers.
              Experience convenience, reliability, and affordable pricing for all your travel needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/vehicle-rental"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 text-center shadow-lg"
              >
                Rent Now
              </Link>
              <Link
                to="/register"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition duration-300 text-center"
              >
                Join as Partner
              </Link>
            </div>
          </div>

          {/* Right content - Hero Image */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <img
                src="/api/placeholder/500/400"
                alt="Vehicle Rental"
                className="w-full h-80 object-cover rounded-lg"
              />

              {/* Floating cards */}
              <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">24/7 Support</p>
                    <p className="text-xs text-gray-600">Always here to help</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Verified Vehicles</p>
                    <p className="text-xs text-gray-600">Quality guaranteed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection