import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import FeedbackService from '../../Services/Feedback-service';
import BusinessOwnerHeader from '../../Components/Business-owner/Header';

const BusinessOwnerFeedback = () => {
    const { user } = useAuth();
    const [feedbackList, setFeedbackList] = useState([]);
    const [filteredFeedback, setFilteredFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [submittingResponse, setSubmittingResponse] = useState(false);

    // Filter states
    const [filterType, setFilterType] = useState('all'); // all, vehicle, driver
    const [filterVehicle, setFilterVehicle] = useState('');
    const [filterDriver, setFilterDriver] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, open, in_progress, resolved, closed
    const [filterSeverity, setFilterSeverity] = useState('all'); // all, low, medium, high, critical
    const [filterCategory, setFilterCategory] = useState('all'); // all, payment, booking, login, vehicle_condition, driver_service, general
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        critical: 0,
        vehicleIssues: 0,
        driverIssues: 0
    });

    // Fetch feedback for business owner's vehicles and drivers
    useEffect(() => {
        fetchFeedback();
    }, [user]);

    // Apply filters whenever filter states change
    useEffect(() => {
        applyFilters();
    }, [feedbackList, filterType, filterVehicle, filterDriver, filterStatus, filterSeverity, filterCategory, searchQuery]);

    const fetchFeedback = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all feedback - backend should filter by business owner's vehicles
            const response = await FeedbackService.getFeedback({
                page: 1,
                limit: 1000 // Get all for client-side filtering
            });

            if (response.success) {
                const feedback = response.data || [];
                setFeedbackList(feedback);
                calculateStats(feedback);
            } else {
                setError('Failed to load feedback');
            }
        } catch (err) {
            console.error('Error fetching feedback:', err);
            setError('An error occurred while loading feedback');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (feedback) => {
        const stats = {
            total: feedback.length,
            open: feedback.filter(f => f.status === 'open').length,
            inProgress: feedback.filter(f => f.status === 'in_progress').length,
            resolved: feedback.filter(f => f.status === 'resolved' || f.status === 'closed').length,
            critical: feedback.filter(f => f.severity === 'critical' && f.status !== 'resolved' && f.status !== 'closed').length,
            vehicleIssues: feedback.filter(f => f.category === 'vehicle_condition').length,
            driverIssues: feedback.filter(f => f.category === 'driver_service').length
        };
        setStats(stats);
    };

    const applyFilters = () => {
        let filtered = [...feedbackList];

        // Filter by type (vehicle/driver)
        if (filterType === 'vehicle') {
            filtered = filtered.filter(f => f.category === 'vehicle_condition');
        } else if (filterType === 'driver') {
            filtered = filtered.filter(f => f.category === 'driver_service');
        }

        // Filter by specific vehicle
        if (filterVehicle && filterVehicle !== 'all') {
            filtered = filtered.filter(f => f.vehicle?._id === filterVehicle);
        }

        // Filter by specific driver
        if (filterDriver && filterDriver !== 'all') {
            filtered = filtered.filter(f => f.booking?.driver === filterDriver);
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(f => f.status === filterStatus);
        }

        // Filter by severity
        if (filterSeverity !== 'all') {
            filtered = filtered.filter(f => f.severity === filterSeverity);
        }

        // Filter by category
        if (filterCategory !== 'all') {
            filtered = filtered.filter(f => f.category === filterCategory);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(f =>
                f.subject?.toLowerCase().includes(query) ||
                f.message?.toLowerCase().includes(query) ||
                f.vehicle?.carNumber?.toLowerCase().includes(query) ||
                f.vehicle?.make?.toLowerCase().includes(query) ||
                f.vehicle?.model?.toLowerCase().includes(query)
            );
        }

        setFilteredFeedback(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleViewDetails = (feedback) => {
        setSelectedFeedback(feedback);
    };

    const handleRespond = (feedback) => {
        setSelectedFeedback(feedback);
        setResponseMessage('');
        setShowResponseModal(true);
    };

    const handleSubmitResponse = async () => {
        if (!responseMessage.trim() || responseMessage.length < 10) {
            alert('Please enter a response message (minimum 10 characters)');
            return;
        }

        try {
            setSubmittingResponse(true);
            const response = await FeedbackService.addAdminResponse(selectedFeedback._id, responseMessage);

            if (response.success) {
                alert('Response submitted successfully!');
                setShowResponseModal(false);
                setResponseMessage('');
                fetchFeedback(); // Refresh feedback list
                setSelectedFeedback(null);
            } else {
                alert(response.message || 'Failed to submit response');
            }
        } catch (err) {
            console.error('Error submitting response:', err);
            alert('An error occurred while submitting response');
        } finally {
            setSubmittingResponse(false);
        }
    };

    const handleEscalateToAdmin = async (feedback) => {
        if (window.confirm('Escalate this critical issue to admin for immediate attention?')) {
            try {
                // Update severity to critical if not already
                if (feedback.severity !== 'critical') {
                    await FeedbackService.updateFeedbackSeverity(feedback._id, 'critical');
                }

                // Add a note about escalation
                await FeedbackService.addAdminResponse(
                    feedback._id,
                    `[ESCALATED BY BUSINESS OWNER] This issue requires immediate admin attention. Business: ${user?.businessName || 'N/A'}`
                );

                alert('Issue escalated to admin successfully');
                fetchFeedback();
            } catch (err) {
                console.error('Error escalating issue:', err);
                alert('Failed to escalate issue');
            }
        }
    };

    const getSeverityBadge = (severity) => {
        const severityStyles = {
            low: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityStyles[severity] || severityStyles.medium}`}>
                {severity?.toUpperCase()}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            open: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-purple-100 text-purple-800',
            resolved: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.open}`}>
                {status?.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    const getCategoryIcon = (category) => {
        const icons = {
            payment: '💳',
            booking: '📅',
            login: '🔐',
            vehicle_condition: '🚗',
            driver_service: '👤',
            general: '📝'
        };
        return icons[category] || '📝';
    };

    // Get unique vehicles and drivers for filter dropdowns
    const uniqueVehicles = [...new Set(feedbackList.map(f => f.vehicle).filter(Boolean))];
    const uniqueDrivers = [...new Set(feedbackList.map(f => f.booking?.driver).filter(Boolean))];

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredFeedback.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <BusinessOwnerHeader />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading feedback...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <BusinessOwnerHeader />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Feedback</h1>
                    <p className="text-gray-600">Monitor and respond to customer feedback for your business</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="bg-blue-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Open Issues</p>
                                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.open}</p>
                            </div>
                            <div className="bg-yellow-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                                <p className="text-2xl font-bold text-red-900 mt-1">{stats.critical}</p>
                            </div>
                            <div className="bg-red-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Resolved</p>
                                <p className="text-2xl font-bold text-green-900 mt-1">{stats.resolved}</p>
                            </div>
                            <div className="bg-green-100 rounded-full p-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Severity Trends Alert */}
                {stats.critical > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Critical Issues Detected
                                </h3>
                                <p className="mt-2 text-sm text-red-700">
                                    You have {stats.critical} critical issue{stats.critical !== 1 ? 's' : ''} that require immediate attention.
                                    Consider coordinating with admin for urgent resolution.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Issue Breakdown */}
                {(stats.vehicleIssues > 0 || stats.driverIssues > 0) && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">Issue Breakdown</h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>🚗 Vehicle Issues: <strong>{stats.vehicleIssues}</strong> | 👤 Driver Issues: <strong>{stats.driverIssues}</strong></p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search feedback by subject, message, vehicle..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Types</option>
                                <option value="vehicle">Vehicle Issues</option>
                                <option value="driver">Driver Issues</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        {/* Severity Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                            <select
                                value={filterSeverity}
                                onChange={(e) => setFilterSeverity(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Severity</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Categories</option>
                                <option value="payment">Payment</option>
                                <option value="booking">Booking</option>
                                <option value="login">Login</option>
                                <option value="vehicle_condition">Vehicle Condition</option>
                                <option value="driver_service">Driver Service</option>
                                <option value="general">General</option>
                            </select>
                        </div>

                        {/* Vehicle Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
                            <select
                                value={filterVehicle}
                                onChange={(e) => setFilterVehicle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Vehicles</option>
                                {uniqueVehicles.map(vehicle => (
                                    <option key={vehicle._id} value={vehicle._id}>
                                        {vehicle.carNumber || vehicle.licensePlate} - {vehicle.make} {vehicle.model}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters Button */}
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setFilterType('all');
                                    setFilterVehicle('');
                                    setFilterDriver('');
                                    setFilterStatus('all');
                                    setFilterSeverity('all');
                                    setFilterCategory('all');
                                    setSearchQuery('');
                                }}
                                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-600">
                        Showing {filteredFeedback.length} of {feedbackList.length} feedback items
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Feedback List */}
                {currentItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchQuery || filterType !== 'all' || filterStatus !== 'all' || filterSeverity !== 'all'
                                ? 'Try adjusting your filters or search query.'
                                : 'No customer feedback available for your business yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {currentItems.map((feedback) => (
                            <div key={feedback._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            {/* Header with Category Icon and Badges */}
                                            <div className="flex items-center space-x-3 mb-3">
                                                <span className="text-2xl">{getCategoryIcon(feedback.category)}</span>
                                                <div className="flex items-center space-x-2">
                                                    {getSeverityBadge(feedback.severity)}
                                                    {getStatusBadge(feedback.status)}
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                        {feedback.category?.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Subject */}
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feedback.subject}</h3>

                                            {/* Message Preview */}
                                            <p className="text-gray-600 mb-3 line-clamp-2">{feedback.message}</p>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Customer:</span>
                                                    <p className="font-medium text-gray-900">{feedback.user?.name || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Vehicle:</span>
                                                    <p className="font-medium text-gray-900">
                                                        {feedback.vehicle?.carNumber || feedback.vehicle?.licensePlate || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {feedback.vehicle?.make} {feedback.vehicle?.model}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Booking:</span>
                                                    <p className="font-medium text-gray-900">{feedback.booking?.bookingNumber || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Date:</span>
                                                    <p className="font-medium text-gray-900">
                                                        {new Date(feedback.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Admin Response */}
                                            {feedback.adminResponse?.message && (
                                                <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-3">
                                                    <div className="flex">
                                                        <div className="flex-shrink-0">
                                                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-green-800">Response from Admin/Business Owner:</p>
                                                            <p className="text-sm text-green-700 mt-1">{feedback.adminResponse.message}</p>
                                                            <p className="text-xs text-green-600 mt-1">
                                                                Responded on {new Date(feedback.adminResponse.respondedAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                            onClick={() => handleViewDetails(feedback)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                        >
                                            View Details
                                        </button>

                                        {feedback.status !== 'resolved' && feedback.status !== 'closed' && (
                                            <button
                                                onClick={() => handleRespond(feedback)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                            >
                                                Respond
                                            </button>
                                        )}

                                        {feedback.severity === 'critical' && feedback.status !== 'resolved' && feedback.status !== 'closed' && (
                                            <button
                                                onClick={() => handleEscalateToAdmin(feedback)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                            >
                                                🚨 Escalate to Admin
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredFeedback.length)} of {filteredFeedback.length} results
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 rounded-lg ${currentPage === 1
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Previous
                            </button>

                            {[...Array(totalPages)].map((_, index) => {
                                const pageNumber = index + 1;
                                if (
                                    pageNumber === 1 ||
                                    pageNumber === totalPages ||
                                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`px-4 py-2 rounded-lg ${currentPage === pageNumber
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                    return <span key={pageNumber} className="px-2 py-2">...</span>;
                                }
                                return null;
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 rounded-lg ${currentPage === totalPages
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {selectedFeedback && !showResponseModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Feedback Details</h2>
                                    <div className="flex items-center space-x-2 mt-2">
                                        {getSeverityBadge(selectedFeedback.severity)}
                                        {getStatusBadge(selectedFeedback.status)}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedFeedback(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                                    <p className="text-lg text-gray-900 mt-1">{selectedFeedback.subject}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                                    <p className="text-gray-900 mt-1 flex items-center">
                                        <span className="mr-2">{getCategoryIcon(selectedFeedback.category)}</span>
                                        {selectedFeedback.category?.replace('_', ' ').toUpperCase()}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Message</h3>
                                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">{selectedFeedback.message}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                                        <p className="text-gray-900 mt-1">{selectedFeedback.user?.name || 'N/A'}</p>
                                        <p className="text-sm text-gray-600">{selectedFeedback.user?.email || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Vehicle</h3>
                                        <p className="text-gray-900 mt-1">
                                            {selectedFeedback.vehicle?.carNumber || selectedFeedback.vehicle?.licensePlate || 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {selectedFeedback.vehicle?.make} {selectedFeedback.vehicle?.model}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Booking Reference</h3>
                                        <p className="text-gray-900 mt-1">{selectedFeedback.booking?.bookingNumber || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Submitted On</h3>
                                        <p className="text-gray-900 mt-1">
                                            {new Date(selectedFeedback.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {selectedFeedback.tags && selectedFeedback.tags.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedFeedback.tags.map((tag, index) => (
                                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedFeedback.adminResponse?.message && (
                                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                                        <h3 className="text-sm font-medium text-green-800 mb-2">Response from Admin/Business Owner</h3>
                                        <p className="text-sm text-green-700 whitespace-pre-wrap">{selectedFeedback.adminResponse.message}</p>
                                        <p className="text-xs text-green-600 mt-2">
                                            Responded on {new Date(selectedFeedback.adminResponse.respondedAt).toLocaleString()}
                                        </p>
                                    </div>
                                )}

                                {selectedFeedback.attachments && selectedFeedback.attachments.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Attachments</h3>
                                        <div className="space-y-2">
                                            {selectedFeedback.attachments.map((attachment, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <span className="text-sm text-gray-700">{attachment.originalName}</span>
                                                    <a
                                                        href={attachment.path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-700 text-sm"
                                                    >
                                                        Download
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setSelectedFeedback(null)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Close
                                </button>
                                {selectedFeedback.status !== 'resolved' && selectedFeedback.status !== 'closed' && (
                                    <button
                                        onClick={() => handleRespond(selectedFeedback)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Respond to Customer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Response Modal */}
            {showResponseModal && selectedFeedback && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Respond to Feedback</h2>
                                    <p className="text-sm text-gray-600 mt-1">Subject: {selectedFeedback.subject}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowResponseModal(false);
                                        setResponseMessage('');
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2"><strong>Customer Message:</strong></p>
                                <p className="text-gray-900">{selectedFeedback.message}</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Response <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={responseMessage}
                                    onChange={(e) => setResponseMessage(e.target.value)}
                                    rows={6}
                                    placeholder="Enter your response to the customer (minimum 10 characters)..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {responseMessage.length}/500 characters (minimum 10 required)
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowResponseModal(false);
                                        setResponseMessage('');
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    disabled={submittingResponse}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitResponse}
                                    disabled={submittingResponse || responseMessage.length < 10}
                                    className={`px-6 py-2 rounded-lg transition-colors ${submittingResponse || responseMessage.length < 10
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                >
                                    {submittingResponse ? 'Submitting...' : 'Submit Response'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessOwnerFeedback;
