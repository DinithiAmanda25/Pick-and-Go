import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import RevenueService from '../../Services/revenue-service'

function BusinessOwnerRevenue({ payments: initialPayments, revenue: initialRevenue }) {
    const { user } = useAuth()
    const [selectedPeriod, setSelectedPeriod] = useState('monthly')
    const [filter, setFilter] = useState('all')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [payments, setPayments] = useState(initialPayments || [])
    const [revenue, setRevenue] = useState(initialRevenue || 0)
    const [revenueSummary, setRevenueSummary] = useState(null)
    const [analytics, setAnalytics] = useState(null)
    const [paymentMethodBreakdown, setPaymentMethodBreakdown] = useState({})
    const [topServices, setTopServices] = useState([])
    const [payoutHistory, setPayoutHistory] = useState([])
    const [showPayoutModal, setShowPayoutModal] = useState(false)
    const [payoutAmount, setPayoutAmount] = useState('')
    const [customDateRange, setCustomDateRange] = useState({
        startDate: '',
        endDate: ''
    })
    const [showDatePicker, setShowDatePicker] = useState(false)

    // Load revenue data on component mount and period change
    useEffect(() => {
        if (user?.id) {
            loadRevenueData()
        }
    }, [user?.id, selectedPeriod])

    // Load all revenue-related data
    const loadRevenueData = async () => {
        if (!user?.id) return
        
        setLoading(true)
        setError(null)
        
        try {
            // Prepare date filters
            const dateFilters = {}
            if (selectedPeriod === 'custom' && customDateRange.startDate && customDateRange.endDate) {
                dateFilters.startDate = customDateRange.startDate
                dateFilters.endDate = customDateRange.endDate
            }

            const [
                summaryData,
                transactionsData,
                analyticsData,
                paymentMethodsData,
                topServicesData,
                payoutHistoryData
            ] = await Promise.all([
                RevenueService.getRevenueSummary(user.id, selectedPeriod, dateFilters.startDate, dateFilters.endDate),
                RevenueService.getPaymentTransactions(user.id, { 
                    status: filter === 'all' ? null : filter,
                    page: 1,
                    limit: 100,
                    ...dateFilters
                }),
                RevenueService.getRevenueAnalytics(user.id, selectedPeriod),
                RevenueService.getPaymentMethodBreakdown(user.id, selectedPeriod),
                RevenueService.getTopPerformingServices(user.id, selectedPeriod),
                RevenueService.getPayoutHistory(user.id)
            ])

            setRevenueSummary(summaryData)
            setPayments(transactionsData.transactions || transactionsData.data || [])
            setAnalytics(analyticsData)
            setPaymentMethodBreakdown(paymentMethodsData.breakdown || paymentMethodsData)
            setTopServices(topServicesData.services || topServicesData.data || [])
            setPayoutHistory(payoutHistoryData.payouts || payoutHistoryData.data || [])
            
            // Update revenue from summary
            if (summaryData.totalRevenue) {
                setRevenue(summaryData.totalRevenue)
            }
        } catch (err) {
            setError(err.message || 'Failed to load revenue data')
            console.error('Error loading revenue data:', err)
        } finally {
            setLoading(false)
        }
    }

    // Reload data when filter changes
    useEffect(() => {
        if (user?.id) {
            loadRevenueData()
        }
    }, [filter])

    const calculateRevenueMetrics = () => {
        if (revenueSummary) {
            return {
                totalRevenue: revenueSummary.totalRevenue || 0,
                avgTransactionValue: revenueSummary.avgTransactionValue || 0,
                successRate: revenueSummary.successRate || 0,
                totalTransactions: revenueSummary.totalTransactions || 0,
                completedTransactions: revenueSummary.completedTransactions || 0,
                growthRate: revenueSummary.growthRate || 0,
                previousPeriodRevenue: revenueSummary.previousPeriodRevenue || 0
            }
        }

        // Fallback calculation if no summary data
        const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
        const avgTransactionValue = payments.length > 0 ? totalRevenue / payments.length : 0
        const completedPayments = payments.filter(p => p.status === 'Completed' || p.status === 'completed')
        const successRate = payments.length > 0 ? (completedPayments.length / payments.length) * 100 : 0

        return {
            totalRevenue,
            avgTransactionValue,
            successRate,
            totalTransactions: payments.length,
            completedTransactions: completedPayments.length,
            growthRate: 0,
            previousPeriodRevenue: 0
        }
    }

    const getPaymentMethodBreakdown = () => {
        // Use API data if available, otherwise calculate from payments
        if (Object.keys(paymentMethodBreakdown).length > 0) {
            return paymentMethodBreakdown
        }

        const breakdown = {}
        payments.forEach(payment => {
            const method = payment.paymentMethod || payment.method
            if (!breakdown[method]) {
                breakdown[method] = { count: 0, amount: 0 }
            }
            breakdown[method].count++
            breakdown[method].amount += payment.amount
        })
        return breakdown
    }

    const filteredPayments = payments.filter(payment => {
        if (filter === 'completed') return payment.status === 'Completed' || payment.status === 'completed'
        if (filter === 'pending') return payment.status === 'Pending' || payment.status === 'pending'
        if (filter === 'failed') return payment.status === 'Failed' || payment.status === 'failed'
        return true
    })

    const generateReport = async () => {
        if (!user?.id) return
        
        setLoading(true)
        try {
            const reportData = {
                period: selectedPeriod,
                format: 'pdf', // or 'excel'
                includeCharts: true,
                includeTransactions: true,
                dateRange: {
                    start: null, // Will be calculated based on period
                    end: new Date().toISOString()
                }
            }

            const reportBlob = await RevenueService.generateRevenueReport(user.id, reportData)
            
            // Create download link
            const url = window.URL.createObjectURL(reportBlob)
            const link = document.createElement('a')
            link.href = url
            link.download = `revenue-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            
        } catch (err) {
            setError(err.message || 'Failed to generate report')
            console.error('Error generating report:', err)
        } finally {
            setLoading(false)
        }
    }

    const handlePayoutRequest = async () => {
        if (!user?.id || !payoutAmount) return
        
        setLoading(true)
        try {
            const payoutData = {
                amount: parseFloat(payoutAmount),
                paymentMethod: 'bank_transfer', // Default to bank transfer
                notes: `Payout request for ${selectedPeriod} period`
            }

            await RevenueService.requestPayout(user.id, payoutData)
            setShowPayoutModal(false)
            setPayoutAmount('')
            // Reload data to show updated balance
            loadRevenueData()
            
        } catch (err) {
            setError(err.message || 'Failed to request payout')
            console.error('Error requesting payout:', err)
        } finally {
            setLoading(false)
        }
    }

    const metrics = calculateRevenueMetrics()
    const paymentMethodBreakdownData = getPaymentMethodBreakdown()

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'failed': return 'bg-red-100 text-red-800'
            case 'refunded': return 'bg-blue-100 text-blue-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getGrowthIndicator = (growthRate) => {
        if (growthRate > 0) {
            return { color: 'text-green-600', icon: '↗', text: `+${growthRate.toFixed(1)}%` }
        } else if (growthRate < 0) {
            return { color: 'text-red-600', icon: '↘', text: `${growthRate.toFixed(1)}%` }
        }
        return { color: 'text-gray-600', icon: '→', text: '0%' }
    }

    if (loading && !revenueSummary) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading revenue data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Revenue & Payment Analytics</h2>
                    <p className="text-gray-600">Monitor revenue streams and payment details</p>
                </div>
                <div className="flex space-x-4">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => {
                            setSelectedPeriod(e.target.value)
                            if (e.target.value !== 'custom') {
                                setShowDatePicker(false)
                            }
                        }}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="custom">Custom Range</option>
                    </select>
                    
                    {selectedPeriod === 'custom' && (
                        <div className="flex space-x-2">
                            <input
                                type="date"
                                value={customDateRange.startDate}
                                onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                disabled={loading}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
                            />
                            <input
                                type="date"
                                value={customDateRange.endDate}
                                onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                disabled={loading}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
                            />
                            <button
                                onClick={loadRevenueData}
                                disabled={loading || !customDateRange.startDate || !customDateRange.endDate}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Apply
                            </button>
                        </div>
                    )}
                    <button
                        onClick={generateReport}
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                    <button
                        onClick={() => setShowPayoutModal(true)}
                        disabled={loading || metrics.totalRevenue <= 0}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Request Payout
                    </button>
                </div>
            </div>

            {/* Demo Data Notice */}
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium">Demo Mode</p>
                        <p className="text-xs mt-1">You're viewing sample revenue data. Real data will appear when backend revenue endpoints are implemented.</p>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    onClick={() => setError(null)}
                                    className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">LKR {metrics.totalRevenue.toLocaleString()}</p>
                            <p className={`text-sm flex items-center ${getGrowthIndicator(metrics.growthRate).color}`}>
                                <span className="mr-1">{getGrowthIndicator(metrics.growthRate).icon}</span>
                                {getGrowthIndicator(metrics.growthRate).text} from last {selectedPeriod}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Avg Transaction</p>
                            <p className="text-2xl font-bold text-gray-900">LKR {metrics.avgTransactionValue.toFixed(0)}</p>
                            <p className="text-sm text-blue-600">Per booking</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Success Rate</p>
                            <p className="text-2xl font-bold text-gray-900">{metrics.successRate.toFixed(1)}%</p>
                            <p className="text-sm text-green-600">{metrics.completedTransactions} of {metrics.totalTransactions}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Available Balance</p>
                            <p className="text-2xl font-bold text-gray-900">LKR {revenue.toLocaleString()}</p>
                            <p className="text-sm text-purple-600">Ready for payout</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Method Breakdown */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.keys(paymentMethodBreakdownData).length > 0 ? (
                        Object.entries(paymentMethodBreakdownData).map(([method, data]) => {
                            const percentage = metrics.totalRevenue > 0 ? ((data.amount / metrics.totalRevenue) * 100).toFixed(1) : 0
                            return (
                                <div key={method} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold text-gray-900 capitalize">{method.replace('_', ' ')}</span>
                                        <span className="text-sm text-gray-600">{percentage}%</span>
                                    </div>
                                    <div className="text-2xl font-bold text-purple-600 mb-1">LKR {data.amount.toLocaleString()}</div>
                                    <div className="text-sm text-gray-600">{data.count} transactions</div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                        <div
                                            className="bg-purple-600 h-2 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p>No payment data available for the selected period</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Top Performing Services */}
                {topServices.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Services</h3>
                        <div className="space-y-3">
                            {topServices.slice(0, 3).map((service, index) => (
                                <div key={service._id || service.id || index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 truncate max-w-24">{service.name || service.packageName}</p>
                                            <p className="text-xs text-gray-500">{service.bookingCount || service.count} bookings</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-green-600">LKR {service.revenue?.toLocaleString() || service.totalRevenue?.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Payout History */}
                {payoutHistory.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Payouts</h3>
                        <div className="space-y-3">
                            {payoutHistory.slice(0, 3).map((payout, index) => (
                                <div key={payout._id || payout.id || index} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {new Date(payout.date || payout.createdAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">{payout.status || 'Processing'}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-green-600">LKR {payout.amount?.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Performance Summary */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Performance</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Avg. Booking Value</span>
                            <span className="text-sm font-semibold text-gray-900">LKR {metrics.avgTransactionValue.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Conversion Rate</span>
                            <span className="text-sm font-semibold text-green-600">{metrics.successRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Bookings</span>
                            <span className="text-sm font-semibold text-gray-900">{metrics.totalTransactions}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Growth Rate</span>
                            <span className={`text-sm font-semibold ${getGrowthIndicator(metrics.growthRate).color}`}>
                                {getGrowthIndicator(metrics.growthRate).text}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h3>
                <div className="h-64 flex items-end justify-center bg-gradient-to-t from-purple-50 to-white rounded border">
                    <div className="text-center">
                        <svg className="w-16 h-16 text-purple-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-gray-500">Revenue chart visualization would integrate here</p>
                        <p className="text-sm text-gray-400 mt-2">Chart.js or similar charting library</p>
                    </div>
                </div>
            </div>

            {/* Payment Details Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Payment Details</h3>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 rounded text-sm transition-colors ${filter === 'all'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('completed')}
                                className={`px-3 py-1 rounded text-sm transition-colors ${filter === 'completed'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Completed
                            </button>
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-3 py-1 rounded text-sm transition-colors ${filter === 'pending'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Pending
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPayments.length > 0 ? (
                                filteredPayments.map((payment) => (
                                    <tr key={payment._id || payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {payment.transactionId || payment._id?.slice(-8)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {payment.customer || payment.clientName || payment.client?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                            LKR {payment.amount?.toLocaleString() || payment.paidAmount?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {payment.paymentMethod || payment.method || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {payment.date ? new Date(payment.date).toLocaleDateString() : 
                                             payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 
                                             payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                                                {payment.status || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            #{payment.bookingId || payment.booking?.id || 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p>No payment transactions found for the selected filters</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payout Request Modal */}
            {showPayoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Request Payout</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Available Balance
                                </label>
                                <div className="text-2xl font-bold text-green-600">
                                    LKR {revenue.toLocaleString()}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payout Amount
                                </label>
                                <input
                                    type="number"
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    max={revenue}
                                    min="100"
                                    step="100"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Enter amount to withdraw"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Minimum payout: LKR 100
                                </p>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <div className="flex">
                                    <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-yellow-800 font-medium">Processing Time</p>
                                        <p className="text-xs text-yellow-700">Payouts are processed within 3-5 business days</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={() => {
                                    setShowPayoutModal(false)
                                    setPayoutAmount('')
                                }}
                                disabled={loading}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePayoutRequest}
                                disabled={loading || !payoutAmount || parseFloat(payoutAmount) <= 0 || parseFloat(payoutAmount) > revenue}
                                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : 'Request Payout'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BusinessOwnerRevenue
