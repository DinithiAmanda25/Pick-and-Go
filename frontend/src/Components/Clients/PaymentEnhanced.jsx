import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function PaymentEnhanced() {
    const [activeTab, setActiveTab] = useState('history')
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('card')
    const [showAddCardModal, setShowAddCardModal] = useState(false)
    const [newCard, setNewCard] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: '',
        isDefault: false
    })

    // Mock payment history
    const paymentHistory = [
        {
            id: 'PAY-001',
            bookingId: 'BK-001',
            vehicle: 'Toyota Camry 2023',
            amount: 375,
            date: '2024-01-20',
            status: 'completed',
            method: 'Credit Card',
            cardLast4: '1234',
            type: 'booking',
            receiptUrl: '#'
        },
        {
            id: 'PAY-002',
            bookingId: 'BK-002',
            vehicle: 'Honda CR-V 2022',
            amount: 225,
            date: '2024-01-15',
            status: 'completed',
            method: 'PayPal',
            cardLast4: null,
            type: 'booking',
            receiptUrl: '#'
        },
        {
            id: 'REF-001',
            bookingId: 'BK-003',
            vehicle: 'BMW X3 2023',
            amount: -150,
            date: '2024-01-10',
            status: 'completed',
            method: 'Credit Card',
            cardLast4: '5678',
            type: 'refund',
            receiptUrl: '#'
        }
    ]

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

    // Mock saved payment methods
    const [savedCards, setSavedCards] = useState([
        {
            id: 1,
            type: 'Visa',
            last4: '1234',
            name: 'John Doe',
            expiry: '12/25',
            isDefault: true
        },
        {
            id: 2,
            type: 'Mastercard',
            last4: '5678',
            name: 'John Doe',
            expiry: '09/26',
            isDefault: false
        }
    ])

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

    const handleAddCard = () => {
        if (newCard.number && newCard.name && newCard.expiry && newCard.cvv) {
            const cardType = newCard.number.startsWith('4') ? 'Visa' : 'Mastercard'
            const newCardData = {
                id: savedCards.length + 1,
                type: cardType,
                last4: newCard.number.slice(-4),
                name: newCard.name,
                expiry: newCard.expiry,
                isDefault: newCard.isDefault || savedCards.length === 0
            }

            setSavedCards(prev => {
                const updated = newCard.isDefault
                    ? prev.map(card => ({ ...card, isDefault: false })).concat(newCardData)
                    : prev.concat(newCardData)
                return updated
            })

            setNewCard({ number: '', name: '', expiry: '', cvv: '', isDefault: false })
            setShowAddCardModal(false)
            alert('Card added successfully!')
        }
    }

    const deleteCard = (cardId) => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            setSavedCards(prev => prev.filter(card => card.id !== cardId))
        }
    }

    const setDefaultCard = (cardId) => {
        setSavedCards(prev => prev.map(card => ({
            ...card,
            isDefault: card.id === cardId
        })))
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
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getCardIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'visa':
                return (
                    <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        VISA
                    </div>
                )
            case 'mastercard':
                return (
                    <div className="w-8 h-6 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        MC
                    </div>
                )
            default:
                return (
                    <div className="w-8 h-6 bg-gray-600 rounded text-white text-xs flex items-center justify-center">
                        Card
                    </div>
                )
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-2">Payment Management</h2>
                <p className="text-emerald-100">Manage your payments, cards, and transaction history</p>
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
                    <button
                        onClick={() => setActiveTab('methods')}
                        className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'methods'
                                ? 'border-b-2 border-emerald-600 text-emerald-600 bg-emerald-50'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Payment Methods
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
                                        ${paymentHistory.filter(p => p.amount > 0).reduce((sum, p) => sum + p.amount, 0)}
                                    </span>
                                </div>
                            </div>

                            {paymentHistory.map(payment => (
                                <motion.div
                                    key={payment.id}
                                    className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${payment.amount > 0 ? 'bg-red-100' : 'bg-green-100'
                                                }`}>
                                                {payment.amount > 0 ? (
                                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                    </svg>
                                                )}
                                            </div>

                                            <div>
                                                <h4 className="font-medium text-gray-900">
                                                    {payment.type === 'refund' ? 'Refund' : 'Payment'} - {payment.vehicle}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {payment.id} • {new Date(payment.date).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {payment.method} {payment.cardLast4 && `ending in ${payment.cardLast4}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className={`text-lg font-semibold ${payment.amount > 0 ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                {payment.amount > 0 ? '-' : '+'}${Math.abs(payment.amount)}
                                            </p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                {payment.status}
                                            </span>
                                            <button
                                                onClick={() => window.open(payment.receiptUrl, '_blank')}
                                                className="block mt-1 text-xs text-blue-600 hover:text-blue-800"
                                            >
                                                View Receipt
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
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

                    {/* Payment Methods Tab */}
                    {activeTab === 'methods' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Saved Payment Methods</h3>
                                <button
                                    onClick={() => setShowAddCardModal(true)}
                                    className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    Add New Card
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {savedCards.map(card => (
                                    <motion.div
                                        key={card.id}
                                        className={`border rounded-lg p-4 ${card.isDefault ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                {getCardIcon(card.type)}
                                                <div>
                                                    <p className="font-medium text-gray-900">•••• •••• •••• {card.last4}</p>
                                                    <p className="text-sm text-gray-600">{card.name}</p>
                                                </div>
                                            </div>
                                            {card.isDefault && (
                                                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                                                    Default
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-600 mb-3">Expires {card.expiry}</p>

                                        <div className="flex space-x-2">
                                            {!card.isDefault && (
                                                <button
                                                    onClick={() => setDefaultCard(card.id)}
                                                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                                                >
                                                    Set Default
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteCard(card.id)}
                                                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
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
                                    {savedCards.map(card => (
                                        <label key={card.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={`card-${card.id}`}
                                                checked={paymentMethod === `card-${card.id}`}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <div className="flex items-center space-x-2">
                                                {getCardIcon(card.type)}
                                                <span>•••• {card.last4}</span>
                                                {card.isDefault && (
                                                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                        </label>
                                    ))}
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

            {/* Add Card Modal */}
            {showAddCardModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Add New Card
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Card Number
                                    </label>
                                    <input
                                        type="text"
                                        value={newCard.number}
                                        onChange={(e) => setNewCard(prev => ({ ...prev, number: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="1234 5678 9012 3456"
                                        maxLength="19"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cardholder Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newCard.name}
                                        onChange={(e) => setNewCard(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Expiry Date
                                        </label>
                                        <input
                                            type="text"
                                            value={newCard.expiry}
                                            onChange={(e) => setNewCard(prev => ({ ...prev, expiry: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="MM/YY"
                                            maxLength="5"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            CVV
                                        </label>
                                        <input
                                            type="text"
                                            value={newCard.cvv}
                                            onChange={(e) => setNewCard(prev => ({ ...prev, cvv: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="123"
                                            maxLength="4"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="setDefault"
                                        checked={newCard.isDefault}
                                        onChange={(e) => setNewCard(prev => ({ ...prev, isDefault: e.target.checked }))}
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="setDefault" className="ml-2 block text-sm text-gray-900">
                                        Set as default payment method
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddCardModal(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddCard}
                                    className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
                                >
                                    Add Card
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
