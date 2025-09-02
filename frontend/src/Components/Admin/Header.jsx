import React from 'react'
import { motion } from 'framer-motion'
import logo from '../../Assets/2.png'

function AdminHeader() {
  return (
    <motion.header
      className="bg-white shadow-sm border-b border-gray-200 px-6 py-4"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <img
            src={logo}
            alt="Pick & Go Logo"
            className="h-10 w-auto"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Manage your vehicle rental system</p>
          </div>
        </motion.div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <motion.button
            className="relative p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17H9a4 4 0 01-4-4V7a3 3 0 013-3h4m0 13V4" />
            </svg>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
          </motion.button>

          {/* Messages */}
          <motion.button
            className="relative p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-blue-400"></span>
          </motion.button>

          {/* Profile */}
          <motion.div
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              A
            </motion.div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-600">Administrator</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}

export default AdminHeader