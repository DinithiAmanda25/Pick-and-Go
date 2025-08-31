import React from 'react'
import { motion } from 'framer-motion'

export default function AdminOverview({ stats, recentActivity }) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 }
        }
    }

    const statCards = [
        { title: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'blue', change: '+12%' },
        { title: 'Active Vehicles', value: stats.activeVehicles, icon: '🚗', color: 'green', change: '+8%' },
        { title: 'Total Bookings', value: stats.totalBookings, icon: '📋', color: 'purple', change: '+23%' },
        { title: 'Total Revenue', value: `$${stats.totalRevenue}`, icon: '💰', color: 'yellow', change: '+15%' }
    ]

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div
                className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg"
                variants={itemVariants}
            >
                <h2 className="text-2xl font-bold mb-2">Admin Overview</h2>
                <p className="text-red-100">Complete system status and analytics</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg p-6 transition-shadow duration-300"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                <p className={`text-sm text-${card.color}-600 font-medium`}>{card.change} from last month</p>
                            </div>
                            <div className={`w-12 h-12 bg-${card.color}-100 rounded-full flex items-center justify-center text-2xl`}>
                                {card.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity */}
            <motion.div
                className="bg-white rounded-lg shadow-lg p-6"
                variants={itemVariants}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent System Activity</h3>
                    <motion.button
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                    >
                        View All
                    </motion.button>
                </div>

                <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                        <motion.div
                            key={activity.id}
                            className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className={`w-10 h-10 bg-${activity.type === 'user' ? 'blue' : activity.type === 'vehicle' ? 'green' : activity.type === 'booking' ? 'purple' : 'yellow'}-100 rounded-full flex items-center justify-center`}>
                                {activity.type === 'user' && (
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                )}
                                {activity.type === 'vehicle' && (
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                )}
                                {activity.type === 'booking' && (
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                <p className="text-sm text-gray-500">{activity.timestamp}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activity.status === 'success' ? 'bg-green-100 text-green-800' :
                                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                    }`}>
                                    {activity.status}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                className="bg-white rounded-lg shadow-lg p-6"
                variants={itemVariants}
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { name: 'Add User', icon: '👤', color: 'blue' },
                        { name: 'Approve Vehicle', icon: '✅', color: 'green' },
                        { name: 'View Reports', icon: '📊', color: 'purple' },
                        { name: 'System Settings', icon: '⚙️', color: 'gray' }
                    ].map((action, index) => (
                        <motion.button
                            key={action.name}
                            className={`p-4 bg-${action.color}-50 hover:bg-${action.color}-100 rounded-lg transition-all duration-200 text-center`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="text-2xl mb-2">{action.icon}</div>
                            <p className={`text-sm font-medium text-${action.color}-700`}>{action.name}</p>
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    )
}
