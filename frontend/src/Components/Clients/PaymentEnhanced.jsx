import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'

export default function PaymentEnhanced() {
    const { getToken, user } = useAuth()
    const [activeTab, setActiveTab] = useState('history')
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('card')
    // Real payment history state
    const [paymentHistory, setPaymentHistory] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [summary, setSummary] = useState({
        totalTransactions: 0,
        totalSpent: 0,
        totalRefunded: 0,
        netSpent: 0
    })

    // API configuration
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:9000/api'
    
    const getAuthHeaders = () => {
        const token = getToken()
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    }

    // Fetch payment history
    const fetchPaymentHistory = async () => {
        if (!user?.id) return
        
        setLoading(true)
        setError(null)
        
        try {
            const response = await axios.get(`${backendUrl}/bookings/client/${user.id}/payment-history`, {
                headers: getAuthHeaders(),
                withCredentials: true
            })
            
            if (response.data.success) {
                setPaymentHistory(response.data.paymentHistory || [])
                setSummary(response.data.summary || {
                    totalTransactions: 0,
                    totalSpent: 0,
                    totalRefunded: 0,
                    netSpent: 0
                })
            }
        } catch (err) {
            console.error('Error fetching payment history:', err)
            setError('Failed to load payment history')
        } finally {
            setLoading(false)
        }
    }

    // Load payment history on component mount
    useEffect(() => {
        fetchPaymentHistory()
    }, [user?.id])

    // Mock pending payments
    const pendingPayments = [
        {
            id: 'PEN-001',
            bookingId: 'BK-004',
            vehicle: 'Tesla Model 3 2023',
            amount: 450,
            dueDate: '2024-02-01',
            description: 'Final payment for upcoming booking',
            type: 'final_payment'
        }
    ]


    const handlePayNow = (payment) => {
        setSelectedPayment(payment)
        setShowPaymentModal(true)
    }

    const processPayment = () => {
        // In a real app, this would integrate with payment processor
        console.log('Processing payment:', {
            paymentId: selectedPayment.id,
            method: paymentMethod,
            amount: selectedPayment.amount
        })

        alert('Payment processed successfully!')
        setShowPaymentModal(false)
        setSelectedPayment(null)
    }


    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'failed':
                return 'bg-red-100 text-red-800'
            case 'refunded':
                return 'bg-blue-100 text-blue-800'
            case 'paid':
                return 'bg-green-100 text-green-800'
            case 'active':
                return 'bg-blue-100 text-blue-800'
            case 'cancelled':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-2">Payment History</h2>
                <p className="text-emerald-100">View your payment transactions and booking history</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'history'
                                ? 'border-b-2 border-emerald-600 text-emerald-600 bg-emerald-50'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Payment History
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'pending'
                                ? 'border-b-2 border-emerald-600 text-emerald-600 bg-emerald-50'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Pending Payments ({pendingPayments.length})
                    </button>
                </div>

                <div className="p-6">
                    {/* Payment History Tab */}
                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
                                <div className="text-sm text-gray-600">
                                    Total Spent: <span className="font-semibold text-emerald-600">
                                        ${summary.totalSpent.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                                    <p className="text-gray-600 mt-2">Loading payment history...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8">
                                    <div className="text-red-500 mb-2">
                                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-red-600 mb-4">{error}</p>
                                    <button
                                        onClick={fetchPaymentHistory}
                                        className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : paymentHistory.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 mb-2">
                                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600">No payment history found</p>
                                    <p className="text-sm text-gray-500">Your completed bookings will appear here</p>
                                </div>
                            ) : (
                                paymentHistory.map(payment => (
                                    <motion.div
                                        key={payment.id}
                                        className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${payment.status === 'refunded' ? 'bg-green-100' : 'bg-red-100'
                                                    }`}>
                                                    {payment.status === 'refunded' ? (
                                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">
                                                        {payment.status === 'refunded' ? 'Refund' : 'Payment'} - {payment.vehicle}
                                                        {payment.vehicleYear && ` (${payment.vehicleYear})`}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        Booking ID: {payment.bookingId} • {new Date(payment.paymentDate).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Destination: {payment.destination}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {payment.method} • {payment.totalDays} day{payment.totalDays !== 1 ? 's' : ''}
                                                        {payment.driverRequired && ' • With Driver'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className={`text-lg font-semibold ${payment.status === 'refunded' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {payment.status === 'refunded' ? '+' : '-'}${Math.abs(payment.amount).toFixed(2)}
                                                </p>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                    {payment.status}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {payment.currency}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Pending Payments Tab */}
                    {activeTab === 'pending' && (
                        <div className="space-y-4">
                            {pendingPayments.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 mb-2">
                                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600">No pending payments</p>
                                </div>
                            ) : (
                                pendingPayments.map(payment => (
                                    <motion.div
                                        key={payment.id}
                                        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{payment.vehicle}</h4>
                                                <p className="text-sm text-gray-600">{payment.description}</p>
                                                <p className="text-sm text-orange-600">
                                                    Due: {new Date(payment.dueDate).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-gray-900">${payment.amount}</p>
                                                <button
                                                    onClick={() => handlePayNow(payment)}
                                                    className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                                >
                                                    Pay Now
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Complete Payment
                            </h3>

                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <p className="font-medium text-gray-900">{selectedPayment.vehicle}</p>
                                <p className="text-sm text-gray-600">{selectedPayment.description}</p>
                                <p className="text-lg font-semibold text-emerald-600 mt-2">${selectedPayment.amount}</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                                                CARD
                                            </div>
                                            <span>Credit/Debit Card</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={processPayment}
                                    className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
                                >
                                    Pay ${selectedPayment.amount}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
