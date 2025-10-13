import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FeedbackService from '../../Services/Feedback-service';

const AdminFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);

    // Filters
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [responseText, setResponseText] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchFeedbacks();
        fetchStats();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [feedbacks, categoryFilter, severityFilter, statusFilter, searchQuery]);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const result = await FeedbackService.getFeedback();

            if (result.success) {
                setFeedbacks(result.data || []);
                setError(null);
            } else {
                setError(result.message || 'Failed to fetch feedbacks');
            }
        } catch (err) {
            console.error('Error fetching feedbacks:', err);
            setError('Failed to load feedbacks');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const result = await FeedbackService.getFeedbackStats();
            if (result.success) {
                setStats(result.data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const applyFilters = () => {
        let filtered = [...feedbacks];

        // Category filter
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(f => f.category === categoryFilter);
        }

        // Severity filter
        if (severityFilter !== 'all') {
            filtered = filtered.filter(f => f.severity === severityFilter);
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(f => f.status === statusFilter);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(f =>
                f.subject?.toLowerCase().includes(query) ||
                f.message?.toLowerCase().includes(query) ||
                f.category?.toLowerCase().includes(query)
            );
        }

        setFilteredFeedbacks(filtered);
    };

    const handleUpdateSeverity = async (feedbackId, newSeverity) => {
        try {
            setActionLoading(true);
            const result = await FeedbackService.updateFeedbackSeverity(feedbackId, newSeverity);

            if (result.success) {
                setFeedbacks(prev => prev.map(f =>
                    f._id === feedbackId ? { ...f, severity: newSeverity } : f
                ));
                await fetchStats();
            } else {
                alert(result.message || 'Failed to update severity');
            }
        } catch (err) {
            console.error('Error updating severity:', err);
            alert('Failed to update severity');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateStatus = async (feedbackId, newStatus) => {
        try {
            setActionLoading(true);
            const result = await FeedbackService.updateFeedbackStatus(feedbackId, newStatus);

            if (result.success) {
                setFeedbacks(prev => prev.map(f =>
                    f._id === feedbackId ? { ...f, status: newStatus } : f
                ));
                await fetchStats();
            } else {
                alert(result.message || 'Failed to update status');
            }
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddResponse = async () => {
        if (!responseText.trim() || !selectedFeedback) {
            alert('Please enter a response message');
            return;
        }

        try {
            setActionLoading(true);
            const result = await FeedbackService.addAdminResponse(selectedFeedback._id, responseText);

            if (result.success) {
                setFeedbacks(prev => prev.map(f =>
                    f._id === selectedFeedback._id
                        ? { ...f, adminResponse: result.data.adminResponse, status: 'in_progress' }
                        : f
                ));
                setShowResponseModal(false);
                setResponseText('');
                setSelectedFeedback(null);
                await fetchStats();
            } else {
                alert(result.message || 'Failed to add response');
            }
        } catch (err) {
            console.error('Error adding response:', err);
            alert('Failed to add response');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteFeedback = async () => {
        if (!selectedFeedback) return;

        try {
            setActionLoading(true);
            const result = await FeedbackService.deleteFeedback(selectedFeedback._id);

            if (result.success) {
                setFeedbacks(prev => prev.filter(f => f._id !== selectedFeedback._id));
                setShowDeleteConfirm(false);
                setSelectedFeedback(null);
                await fetchStats();
            } else {
                alert(result.message || 'Failed to delete feedback');
            }
        } catch (err) {
            console.error('Error deleting feedback:', err);
            alert('Failed to delete feedback');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResolveFeedback = async (feedbackId) => {
        try {
            setActionLoading(true);
            const result = await FeedbackService.resolveFeedback(feedbackId);

            if (result.success) {
                setFeedbacks(prev => prev.map(f =>
                    f._id === feedbackId ? { ...f, status: 'resolved' } : f
                ));
                await fetchStats();
            } else {
                alert(result.message || 'Failed to resolve feedback');
            }
        } catch (err) {
            console.error('Error resolving feedback:', err);
            alert('Failed to resolve feedback');
        } finally {
            setActionLoading(false);
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            payment: 'bg-blue-100 text-blue-800',
            booking: 'bg-purple-100 text-purple-800',
            login: 'bg-yellow-100 text-yellow-800',
            vehicle_condition: 'bg-orange-100 text-orange-800',
            driver_service: 'bg-green-100 text-green-800',
            general: 'bg-gray-100 text-gray-800'
        };
        return colors[category] || colors.general;
    };

    const getSeverityColor = (severity) => {
        const colors = {
            low: 'bg-green-500',
            medium: 'bg-yellow-500',
            high: 'bg-orange-500',
            critical: 'bg-red-500'
        };
        return colors[severity] || colors.low;
    };

    const getStatusColor = (status) => {
        const colors = {
            open: 'bg-red-100 text-red-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            resolved: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || colors.open;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading feedbacks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center bg-white p-8 rounded-xl shadow-lg">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Feedbacks</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchFeedbacks}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback Management</h1>
                    <p className="text-gray-600">Monitor and respond to customer feedback</p>
                </motion.div>

                {/* Statistics Cards */}
                {stats && (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Feedback</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
                                </div>
                                <div className="text-4xl">📋</div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Resolution Rate</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.resolutionRate || 0}%</p>
                                </div>
                                <div className="text-4xl">✅</div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Critical Issues</p>
                                    <p className="text-3xl font-bold text-red-600">{stats.criticalIssues || 0}</p>
                                </div>
                                <div className="text-4xl">🚨</div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Open Issues</p>
                                    <p className="text-3xl font-bold text-orange-600">
                                        {stats.statusBreakdown?.open || 0}
                                    </p>
                                </div>
                                <div className="text-4xl">⏳</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Filters */}
                <motion.div
                    className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search feedback..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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

                        {/* Severity Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                            <select
                                value={severityFilter}
                                onChange={(e) => setSeverityFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="all">All Severities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="all">All Statuses</option>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {filteredFeedbacks.length} of {feedbacks.length} feedback items
                        </p>
                        <button
                            onClick={() => {
                                setCategoryFilter('all');
                                setSeverityFilter('all');
                                setStatusFilter('all');
                                setSearchQuery('');
                            }}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                            Clear Filters
                        </button>
                    </div>
                </motion.div>

                {/* Feedback List */}
                <div className="space-y-4">
                    {filteredFeedbacks.length === 0 ? (
                        <motion.div
                            className="bg-white p-12 rounded-xl shadow-md border border-gray-100 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Feedback Found</h3>
                            <p className="text-gray-600">No feedback matches your current filters.</p>
                        </motion.div>
                    ) : (
                        filteredFeedbacks.map((feedback, index) => (
                            <motion.div
                                key={feedback._id || index}
                                className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                {/* Feedback Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(feedback.category)}`}>
                                                {feedback.category?.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Severity:</span>
                                                <select
                                                    value={feedback.severity}
                                                    onChange={(e) => handleUpdateSeverity(feedback._id, e.target.value)}
                                                    disabled={actionLoading}
                                                    className={`text-xs font-semibold px-2 py-1 rounded border-0 ${getSeverityColor(feedback.severity)} text-white cursor-pointer`}
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                    <option value="critical">Critical</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Status:</span>
                                                <select
                                                    value={feedback.status}
                                                    onChange={(e) => handleUpdateStatus(feedback._id, e.target.value)}
                                                    disabled={actionLoading}
                                                    className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(feedback.status)} cursor-pointer`}
                                                >
                                                    <option value="open">Open</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="resolved">Resolved</option>
                                                    <option value="closed">Closed</option>
                                                </select>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{feedback.subject}</h3>
                                        <p className="text-sm text-gray-600">
                                            Submitted {formatDate(feedback.createdAt || feedback.submittedAt)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedFeedback(feedback);
                                                setShowResponseModal(true);
                                            }}
                                            disabled={actionLoading}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50"
                                        >
                                            💬 Respond
                                        </button>
                                        {feedback.status !== 'resolved' && feedback.status !== 'closed' && (
                                            <button
                                                onClick={() => handleResolveFeedback(feedback._id)}
                                                disabled={actionLoading}
                                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium disabled:opacity-50"
                                            >
                                                ✓ Resolve
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setSelectedFeedback(feedback);
                                                setShowDeleteConfirm(true);
                                            }}
                                            disabled={actionLoading}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Feedback Message */}
                                <div className="mb-4">
                                    <p className="text-gray-700 leading-relaxed">{feedback.message}</p>
                                </div>

                                {/* Admin Response */}
                                {feedback.adminResponse?.message && (
                                    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">👤</div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-1">Admin Response:</h4>
                                                <p className="text-gray-700 mb-2">{feedback.adminResponse.message}</p>
                                                <small className="text-gray-500">
                                                    Responded on: {formatDate(feedback.adminResponse.respondedAt || feedback.responseDate)}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tags */}
                                {feedback.tags && feedback.tags.length > 0 && (
                                    <div className="mt-4 flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Tags:</span>
                                        {feedback.tags.map((tag, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Response Modal */}
            <AnimatePresence>
                {showResponseModal && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !actionLoading && setShowResponseModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Respond to Feedback</h2>

                            {selectedFeedback && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <p className="font-semibold text-gray-900 mb-2">{selectedFeedback.subject}</p>
                                    <p className="text-sm text-gray-600">{selectedFeedback.message}</p>
                                </div>
                            )}

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Response *
                                </label>
                                <textarea
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    placeholder="Enter your response to this feedback..."
                                    rows="6"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={actionLoading}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Minimum 10 characters, maximum 500 characters
                                </p>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setShowResponseModal(false);
                                        setResponseText('');
                                        setSelectedFeedback(null);
                                    }}
                                    disabled={actionLoading}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddResponse}
                                    disabled={actionLoading || !responseText.trim() || responseText.length < 10}
                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading ? 'Sending...' : 'Send Response'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !actionLoading && setShowDeleteConfirm(false)}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">⚠️</div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Feedback?</h2>
                                <p className="text-gray-600">
                                    Are you sure you want to delete this inappropriate feedback? This action cannot be undone.
                                </p>
                            </div>

                            {selectedFeedback && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <p className="font-semibold text-gray-900 text-sm mb-1">{selectedFeedback.subject}</p>
                                    <p className="text-xs text-gray-600 line-clamp-2">{selectedFeedback.message}</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setSelectedFeedback(null);
                                    }}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteFeedback}
                                    disabled={actionLoading}
                                    className="flex-1 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminFeedback;
