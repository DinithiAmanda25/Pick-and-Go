import React from 'react'
import { motion } from 'framer-motion'

export default function PaymentHistory({ payments = [] }) {
  const mockPayments = [
    { id: 1, date: '2024-01-15', description: 'Toyota Camry Rental', amount: 120.00, status: 'Completed' },
    { id: 2, date: '2024-01-10', description: 'Honda Civic Rental', amount: 85.00, status: 'Completed' },
    { id: 3, date: '2024-01-05', description: 'BMW X5 Rental', amount: 200.00, status: 'Completed' },
    { id: 4, date: '2024-01-01', description: 'Tesla Model 3 Rental', amount: 150.00, status: 'Pending' },
  ];

  const paymentsToShow = payments.length > 0 ? payments : mockPayments;

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

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-bold mb-2">Payment History</h2>
        <p className="text-indigo-100">View all your rental transactions and invoices</p>
      </motion.div>

      {paymentsToShow.length > 0 ? (
        <motion.div 
          className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
          variants={itemVariants}
          whileHover={{ boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentsToShow.map((payment, index) => (
                  <motion.tr 
                    key={payment.id} 
                    className="hover:bg-gray-50 transition-colors duration-200"
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <motion.button 
                        className="text-blue-600 hover:text-blue-900 mr-3 transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Receipt
                      </motion.button>
                      <motion.button 
                        className="text-green-600 hover:text-green-900 transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Download
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="bg-white rounded-lg shadow-md p-8 text-center"
          variants={itemVariants}
        >
          <motion.div 
            className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </motion.div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payment history</h3>
          <p className="text-gray-500">Your payment transactions will appear here once you make bookings.</p>
        </motion.div>
      )}

      {/* Payment Summary */}
      {paymentsToShow.length > 0 && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={itemVariants}
        >
          <motion.div 
            className="bg-white rounded-lg shadow-md p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${paymentsToShow.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg shadow-md p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paymentsToShow.filter(p => p.status === 'Completed').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg shadow-md p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paymentsToShow.filter(p => p.status === 'Pending').length}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
