import React from 'react'
import { motion } from 'framer-motion'

const AdminOverview = ({ stats, recentActivity }) => {
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
        visible: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening with your rental system.</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={containerVariants}
            >
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-red-600 font-medium">{stat.change}</p>
                            </div>
                            <div className="text-3xl">{stat.icon}</div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Content Grid */}
            <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                variants={containerVariants}
            >
                {/* Recent Activity */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'user' ? 'bg-blue-500' :
                                        activity.type === 'booking' ? 'bg-green-500' :
                                            activity.type === 'vehicle' ? 'bg-yellow-500' :
                                                'bg-red-500'
                                    }`}></div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">{activity.message}</p>
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors group"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                    👤
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Add New User</p>
                                    <p className="text-sm text-gray-500">Create a new user account</p>
                                </div>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors group"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                    🚗
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Add Vehicle</p>
                                    <p className="text-sm text-gray-500">Register a new vehicle</p>
                                </div>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors group"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                    📊
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Generate Report</p>
                                    <p className="text-sm text-gray-500">Create system reports</p>
                                </div>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors group"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                    ⚙️
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">System Settings</p>
                                    <p className="text-sm text-gray-500">Configure system preferences</p>
                                </div>
                            </div>
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>

            {/* System Status */}
            <motion.div
                variants={itemVariants}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Database: Online</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Payment Gateway: Active</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">SMS Service: Warning</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default AdminOverview
