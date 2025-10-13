import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, filterProps } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import FeedbackService from '../../Services/Feedback-service';

// Star Rating Component
const StarRating = ({ rating, onRatingChange, size = 'large', readonly = false }) => {
    const [hoveredStar, setHoveredStar] = useState(0);

    const handleClick = (star) => {
        if (!readonly && onRatingChange) {
            onRatingChange(star);
        }
    };

    const handleMouseEnter = (star) => {
        if (!readonly) {
            setHoveredStar(star);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoveredStar(0);
        }
    };

    const displayRating = hoveredStar || rating;
    const starSize = size === 'large' ? 'text-4xl' : size === 'medium' ? 'text-2xl' : 'text-xl';

    const StarArray = [1, 2, 3, 4, 5];
    return (
        <div className="flex items-center gap-2">
            <div className="flex gap-1">
                {StarArray.map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => handleMouseEnter(star)}
                        onMouseLeave={handleMouseLeave}
                        disabled={readonly}
                        className={`transition-all duration-200 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                            }`}
                    >
                        <span
                            className={`${starSize} ${star <= displayRating
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                        >
                            {star <= displayRating ? '★' : '☆'}
                        </span>
                    </button>
                ))}
            </div>
            {rating > 0 && (
                <span className="text-sm font-semibold text-gray-700">
                    {rating}/{StarArray.length}
                </span>
            )}
        </div>
    );
};

const ClientFeedback = () => {
    const { getCurrentUserId } = useAuth();
    const userId = getCurrentUserId();

    // State management
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [Error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'history'

    // Form state
    const [formData, setFormData] = useState({
        _id: null,      
        booking: '',
        category: 'general',
        subject: '',
        message: '',
        severity: 'low',
        rating: 0,
        tags: []
    });
    const [submitting, setSubmitting] = useState(false);

    // Edit state
    const [editingFeedback, setEditingFeedback] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Filter state for history
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    // UI state
    const [submissionSuccess, setSubmissionSuccess] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
    };

    useEffect(() => {
        if (userId) {
            fetchUserFeedbacks();
        }
    }, [userId]);

    const fetchUserFeedbacks = async () => {
        try {
            setLoading(true);
            const result = await FeedbackService.getFeedback(); //Getting Feedbacks of all users

            if (result.success) {
                // Filter to show only current user's feedback
                const userFeedbacks = result.data || [];
                setFeedbacks(userFeedbacks);
                setError(null);
            } else {
                setError(result.message || 'Failed to fetch feedbacks');
            }
        } catch (err) {
            console.error('Error fetching feedbacks:', err);
            setError('Failed to load your feedback history');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const deleteFeedback = async (feedbackId) => {
        try {
            const result = await FeedbackService.deleteFeedback(_id);
            return result;
        } catch (err) {
            console.error('Error deleting feedback:', err);

            alert('Failed to delete feedback. Please try again.');
        }
    };  

    const handleDeleteFeedback = async (_id) => {
        console.log('Feedback ID:', _id);

        if (!_id) {
            console.warn('Invalid feedback ID');
            alert('Cannot delete: Invalid feedback ID');
            return;
        }

        const confirmDelete = window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            const result = await FeedbackService.deleteFeedback(_id);
            console.log('Delete result:', result);

            if (result.success) {
                await fetchUserFeedbacks(); // Refresh the list
                alert('Feedback deleted successfully');
            } else {
                console.error('Delete failed:', result);
                alert(result.message || 'Failed to delete feedback');
            }
        } catch (error) {
            console.error('Error deleting feedback:', error);
            alert('Failed to delete feedback. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.subject.trim() || formData.subject.length < 5) {
            alert('Subject must be at least 5 characters');
            return;
        }

        if (!formData.message.trim() || formData.message.length < 10) {
            alert('Message must be at least 10 characters');
            return;
        }

        // Validate rating
        if (formData.rating === 0) {
            alert('Please provide a rating (1-5 stars)');
            return;
        }

        try {
            setSubmitting(true);

            // If booking is not provided, use a placeholder
            const submissionData = {
                ...formData,
                booking: formData.booking || '000000000000000000000000' // Placeholder if no booking selected
            };

            const result = await FeedbackService.createFeedback(submissionData, attachments);

            if (result.success) {
                // show success banner briefly and refresh
                setSubmissionSuccess(true);
                setTimeout(() => setSubmissionSuccess(false), 4000);
                // Reset form
                setFormData({
                    _id: null,  
                    booking: '',
                    category: 'general',
                    subject: '',
                    message: '',
                    severity: 'low',
                    rating: 0,
                    tags: []
                });
                setAttachments([]);
                setAttachmentPreviews([]);

                // Refresh feedback list
                await fetchUserFeedbacks();

                // Switch to history tab
                setActiveTab('history');
            } else {
                alert(result.message || 'Failed to submit feedback');
            }
        } catch (err) {
            console.error('Error submitting feedback:', err);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (feedback) => {
        // Only allow editing if no admin response
        if (feedback.adminResponse?.message) {
            alert('Cannot edit feedback after admin has responded');
            return;
        }

        setEditingFeedback(feedback);
        setFormData({   
            _id: feedback._id,
            booking: feedback.booking?._id || '',
            category: feedback.category,
            subject: feedback.subject,
            message: feedback.message,
            severity: feedback.severity,
            tags: feedback.tags || []
        });
        setShowEditModal(true);
    };

    const handleUpdateFeedback = async (e) => {
        e.preventDefault();

        if (!editingFeedback) return;

        try {
            setSubmitting(true);

            const updateData = {
                _id: editingFeedback._id,
                booking: formData.booking || '000000000000000000000000', // Placeholder if no booking selected
                category: formData.category,
                subject: formData.subject,
                message: formData.message,
                severity: formData.severity,
                tags: formData.tags
            };

            const result = await FeedbackService.updateFeedback(
                editingFeedback._id,
                updateData,
                attachments
            );

            if (result.success) {
                alert('Feedback updated successfully!');
                setShowEditModal(false);
                setEditingFeedback(null);
                setAttachments([]);
                setAttachmentPreviews([]);

                // Refresh feedback list
                await fetchUserFeedbacks();
            } else {
                alert(result.message || 'Failed to update feedback');
            }
        } catch (err) {
            console.error('Error updating feedback:', err);
            alert('Failed to update feedback. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            payment: 'bg-blue-100 text-blue-800 border-blue-200',
            booking: 'bg-purple-100 text-purple-800 border-purple-200',
            login: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            vehicle_condition: 'bg-orange-100 text-orange-800 border-orange-200',
            driver_service: 'bg-green-100 text-green-800 border-green-200',
            general: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[category] || colors.general;
    };

    const getSeverityBadge = (severity) => {
        const badges = {
            low: 'bg-green-500 text-white',
            medium: 'bg-yellow-500 text-white',
            high: 'bg-orange-500 text-white',
            critical: 'bg-red-500 text-white'
        };
        return badges[severity] || badges.low;
    };

    const getStatusBadge = (status) => {
        const badges = {
            open: 'bg-red-100 text-red-800 border-red-200',
            in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            resolved: 'bg-green-100 text-green-800 border-green-200',
            closed: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return badges[status] || badges.open;
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

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const filteredFeedbacks = feedbacks.filter(feedback => {
        const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || feedback.category === categoryFilter;
        return matchesStatus && matchesCategory;
    });

    if (loading && activeTab === 'history') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading your feedback...</p>
                </div>
            </div>
        );
    }
    return (
        <motion.div className="min-h-screen bg-gray-50 p-6" variants={containerVariants} initial="hidden" animate="visible">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <motion.div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-6 rounded-lg shadow-lg" variants={itemVariants}>
                    <h1 className="text-3xl font-bold text-white mb-1">Feedback Center</h1>
                    <p className="text-sky-100">Share your experience and track your submissions</p>
                </motion.div>

                {/* Submission success banner */}
                {submissionSuccess && (
                    <motion.div className="bg-white rounded-lg p-4 border border-green-100 shadow-sm flex items-center gap-4" variants={itemVariants} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="text-3xl">✅</div>
                        <div>
                            <p className="font-semibold text-gray-900">Feedback submitted</p>
                            <p className="text-sm text-gray-600">Thanks — your feedback was received and will be reviewed.</p>
                        </div>
                    </motion.div>
                )}

                {/* Tabs */}
                <motion.div className="bg-white rounded-lg shadow-md" variants={itemVariants}>
                    <div className="flex border-b border-gray-200">
                        <button onClick={() => setActiveTab('submit')} className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'submit' ? 'border-b-2 border-sky-600 text-sky-600 bg-sky-50' : 'text-gray-600 hover:text-gray-800'}`}>
                            📝 Submit Feedback
                        </button>
                        <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'history' ? 'border-b-2 border-sky-600 text-sky-600 bg-sky-50' : 'text-gray-600 hover:text-gray-800'}`}>
                            📋 My Feedback ({feedbacks.length})
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Submit tab */}
                        {activeTab === 'submit' && (
                            <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Submit New Feedback</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                            <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                                                <option value="general">General</option>
                                                <option value="payment">Payment</option>
                                                <option value="booking">Booking</option>
                                                <option value="login">Login/Account</option>
                                                <option value="vehicle_condition">Vehicle Condition</option>
                                                <option value="driver_service">Driver Service</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Severity *</label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {['low', 'medium', 'high', 'critical'].map(severity => (
                                                    <button key={severity} type="button" onClick={() => setFormData(prev => ({ ...prev, severity }))} className={`px-4 py-3 rounded-lg font-semibold transition-all ${formData.severity === severity ? getSeverityBadge(severity) + ' ring-2 ring-offset-2 ring-sky-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2"> Overall Rating *</label>
                                        <div className="flex items-center gap-4">
                                            <StarRating rating={formData.rating} onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))} size="large" />
                                            {formData.rating === 0 ? <span className="text-sm text-gray-500">Click to rate</span> : <span className="text-sm font-medium text-green-600">{formData.rating}/5</span>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                                        <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="Brief description of your feedback" required minLength={5} maxLength={100} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                                        <p className="text-xs text-gray-500 mt-1">{formData.subject.length}/100 characters</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                                        <textarea name="message" value={formData.message} onChange={handleInputChange} placeholder="Please provide detailed feedback..." required minLength={10} maxLength={1000} rows={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                                        <p className="text-xs text-gray-500 mt-1">{formData.message.length}/1000 characters</p>
                                    </div>

                                 

                                    <div className="flex gap-4">
                                        <button type="submit" disabled={submitting} className="flex-1 px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? 'Submitting...' : '📤 Submit Feedback'}</button>
                                        <button type="button" onClick={() => { setFormData({ booking: '', category: 'general', subject: '', message: '', severity: 'low', tags: [] }); setAttachments([]); setAttachmentPreviews([]); }} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold">Clear</button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* History tab */}
                        {activeTab === 'history' && (
                            <motion.div variants={itemVariants}>
                                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                                                <option value="all">All Statuses</option>
                                                <option value="open">Open</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                                            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                                                <option value="all">All Categories</option>
                                                <option value="general">General</option>
                                                <option value="payment">Payment</option>
                                                <option value="booking">Booking</option>
                                                <option value="login">Login/Account</option>
                                                <option value="vehicle_condition">Vehicle Condition</option>
                                                <option value="driver_service">Driver Service</option>
                                            </select>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-4">Showing {filteredFeedbacks.length} of {feedbacks.length} feedback items</p>
                                </div>

                                <div className="space-y-4">
                                    {filteredFeedbacks.length === 0 ? (
                                        <div className="bg-white p-12 rounded-lg shadow-md border border-gray-100 text-center">
                                            <div className="text-6xl mb-4">📭</div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Feedback Yet</h3>
                                            <p className="text-gray-600 mb-4">You haven't submitted any feedback yet.</p>
                                            <button onClick={() => setActiveTab('submit')} className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">Submit Your First Feedback</button>
                                        </div>
                                    ) : (
                                        filteredFeedbacks.map((feedback, index) => (
                                            <motion.div key={feedback._id} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(feedback.category)}`}>{feedback.category?.replace('_', ' ').toUpperCase()}</span>
                                                            <span className={`px-3 py-1 rounded text-xs font-semibold ${getSeverityBadge(feedback.severity)}`}>{feedback.severity?.toUpperCase()}</span>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(feedback.status)}`}>{feedback.status?.replace('_', ' ').toUpperCase()}</span>
                                                        </div>
                                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{feedback.subject}</h3>
                                                        <p className="text-sm text-gray-600">Submitted {formatDate(feedback.createdAt || feedback.submittedAt)}</p>
                                                    </div>
                                                    { (
                                                        <div className="flex flex-col gap-2">
                                                            <button onClick={() => handleEdit(feedback)} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium">✏️ Edit</button>
                                                            <button onClick={() => handleDeleteFeedback(feedback._id)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">🗑️ Delete</button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mb-4"><p className="text-gray-700 leading-relaxed">{feedback.message}</p></div>

                                                {feedback.adminResponse?.message && (
                                                    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                                                        <div className="flex items-start gap-3">
                                                            <div className="text-2xl">👨‍💼</div>
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-blue-900 mb-1">Admin Response:</h4>
                                                                <p className="text-gray-700 mb-2">{feedback.adminResponse.message}</p>
                                                                <small className="text-gray-600">Responded on: {formatDate(feedback.adminResponse.respondedAt)}</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {feedback.status === 'resolved' && (<div className="mt-4 p-3 bg-green-50 border border-green-200 rounded flex items-center gap-2"><span className="text-2xl">✅</span><p className="text-sm text-green-800 font-medium">This feedback has been resolved</p></div>)}
                                                {feedback.status === 'in_progress' && (<div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-center gap-2"><span className="text-2xl">⏳</span><p className="text-sm text-yellow-800 font-medium">Your feedback is being reviewed</p></div>)}
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Edit Modal (unchanged behaviour) */}
                <AnimatePresence>
                    {showEditModal && editingFeedback && (
                        <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !submitting && setShowEditModal(false)}>
                            <motion.div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Feedback</h2>

                                <form onSubmit={handleUpdateFeedback} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                        <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                                            <option value="general">General</option>
                                            <option value="payment">Payment</option>
                                            <option value="booking">Booking</option>
                                            <option value="login">Login/Account</option>
                                            <option value="vehicle_condition">Vehicle Condition</option>
                                            <option value="driver_service">Driver Service</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Severity *</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {['low', 'medium', 'high', 'critical'].map(severity => (
                                                <button key={severity} type="button" onClick={() => setFormData(prev => ({ ...prev, severity }))} className={`px-4 py-3 rounded-lg font-semibold transition-all ${formData.severity === severity ? getSeverityBadge(severity) + ' ring-2 ring-offset-2 ring-sky-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                                        <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} required minLength={5} maxLength={100} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                                        <textarea name="message" value={formData.message} onChange={handleInputChange} required minLength={10} maxLength={1000} rows="6" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                                    </div>

                                    <div className="flex gap-3 justify-end">
                                        <button type="button" onClick={() => { setShowEditModal(false); setEditingFeedback(null); setAttachments([]); setAttachmentPreviews([]); }} disabled={submitting} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
                                        <button type="button" onClick={() => { setAttachments([]); setAttachmentPreviews([]); }} disabled={submitting} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Clear Attachments</button>
                                        <button type="button" onClick={() => document.getElementById('file-upload-edit').click()} disabled={submitting} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Add Attachments</button>
                                        <input type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleFileChange} className="hidden" id="file-upload-edit" />
                                        {editingFeedback?.attachments?.length > 0 && (
                                            <button type="button" onClick={() => handleDeleteFeedback(editingFeedback._id)} disabled={submitting} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">Delete Attachment</button>
                                        )}
                                 </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default ClientFeedback;
