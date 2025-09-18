import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FeedbackService from '../../Services/Feedback-service';

const FeedbackDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adminResponse, setAdminResponse] = useState('');
    const [submittingResponse, setSubmittingResponse] = useState(false);
    
    // New state for enhanced features
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFeedback, setFilteredFeedback] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [backendConnected, setBackendConnected] = useState(null);

    // Mock user for demo purposes - replace with actual auth context
    const user = JSON.parse(localStorage.getItem('user') || '{}') || { role: 'admin', _id: 'admin123' };

    // Constants
    const categories = {
        payment: 'Payment Issues',
        booking: 'Booking Process',
        login: 'Login/Authentication',
        vehicle_condition: 'Vehicle Condition',
        driver_service: 'Driver Service',
        general: 'General Feedback'
    };

    const severityColors = {
        low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };

    const statusColors = {
        open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };

    // Fetch feedback from backend
    const fetchFeedback = async () => {
        setLoading(true);
        
        // Create mock data first as fallback
        const mockData = {
            _id: id || '1',
            subject: 'Vehicle Condition Issue',
            message: 'The vehicle had some cleanliness issues and the air conditioning was not working properly during my trip.',
            category: 'vehicle_condition',
            severity: 'medium',
            status: 'open',
            tags: ['cleanliness', 'air-conditioning'],
            user: {
                _id: 'user123',
                name: 'John Doe',
                email: 'john.doe@email.com'
            },
            booking: {
                bookingNumber: 'BK-2024-001',
                vehicle: {
                    carNumber: 'CAR-123',
                    make: 'Toyota',
                    model: 'Corolla'
                }
            },
            adminResponses: [
                {
                    message: 'Thank you for reporting this issue. We will investigate and take necessary actions.',
                    createdAt: new Date(Date.now() - 86400000), // 1 day ago
                    admin: { name: 'Admin User' }
                }
            ],
            createdAt: new Date(Date.now() - 172800000), // 2 days ago
            updatedAt: new Date(Date.now() - 86400000), // 1 day ago
            rating: 4,
            images: [],
            attachments: []
        };

        try {
            // Try backend first with timeout
            const result = await Promise.race([
                FeedbackService.getFeedbackById(id),
                new Promise(resolve => setTimeout(() => resolve({ success: false, message: 'Timeout' }), 3000))
            ]);
            
            if (result.success && result.data) {
                // Use backend data if available
                setFeedback(result.data);
                setFilteredFeedback(result.data);
                setRating(result.data.rating || 0);
                setBackendConnected(true);
                console.log('✅ Using backend data');
            } else {
                throw new Error(result.message || 'Backend not available');
            }
        } catch (error) {
            // Always fall back to mock data
            console.warn('⚠️ Backend connection failed, using mock data:', error.message);
            setFeedback(mockData);
            setFilteredFeedback(mockData);
            setRating(mockData.rating || 0);
            setBackendConnected(false);
        } finally {
            // Always stop loading after maximum 4 seconds
            setTimeout(() => setLoading(false), 100);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Star Rating Component
    const StarRating = ({ rating, onRatingChange, readOnly = false }) => {
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`text-2xl ${
                            star <= (hoverRating || rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                        } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:text-yellow-400'} transition-colors`}
                        onMouseEnter={() => !readOnly && setHoverRating(star)}
                        onMouseLeave={() => !readOnly && setHoverRating(0)}
                        onClick={() => !readOnly && onRatingChange && onRatingChange(star)}
                        disabled={readOnly}
                    >
                        ★
                    </button>
                ))}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    ({rating}/5)
                </span>
            </div>
        );
    };

    // Image Upload Handler
    const handleImageUpload = async (event) => {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) return;
        
        setUploadingImages(true);
        
        try {
            // Try to upload to backend first
            const result = await FeedbackService.uploadAttachments(id, files);
            
            if (result.success) {
                alert('Images uploaded successfully');
                fetchFeedback(); // Refresh to get updated feedback with new images
            } else {
                // Fallback to local preview if backend upload fails
                console.log('Backend upload failed, using local preview:', result.message);
                handleLocalImageUpload(files);
            }
        } catch (error) {
            console.error('Upload error:', error);
            // Fallback to local preview
            handleLocalImageUpload(files);
        } finally {
            setUploadingImages(false);
            // Reset the input
            event.target.value = '';
        }
    };

    // Local image upload fallback
    const handleLocalImageUpload = (files) => {
        files.forEach(file => {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image file`);
                return;
            }
            
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} is too large. Maximum size is 5MB`);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const newImage = {
                    id: Date.now() + Math.random(),
                    file,
                    url: e.target.result,
                    name: file.name,
                    size: file.size,
                    type: file.type
                };
                
                setUploadedImages(prev => [...prev, newImage]);
            };
            
            reader.onerror = () => {
                alert(`Error reading ${file.name}`);
            };
            
            reader.readAsDataURL(file);
        });
    };

    // Remove uploaded image
    const removeImage = (imageId) => {
        setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    };

    // Search functionality
    const handleSearch = async (term) => {
        setSearchTerm(term);
        if (!term.trim()) {
            setFilteredFeedback(feedback);
            return;
        }
        
        try {
            // Try to search using backend
            const result = await FeedbackService.searchFeedback(term);
            if (result.success && result.data.length > 0) {
                // Find the current feedback in search results
                const currentFeedback = result.data.find(f => f._id === id);
                setFilteredFeedback(currentFeedback || null);
            } else {
                // Fallback to local search if backend search fails or returns no results
                const searchLower = term.toLowerCase();
                const matches = feedback && (
                    feedback.subject.toLowerCase().includes(searchLower) ||
                    feedback.message.toLowerCase().includes(searchLower) ||
                    feedback.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
                    feedback.category.toLowerCase().includes(searchLower)
                );
                
                setFilteredFeedback(matches ? feedback : null);
            }
        } catch (error) {
            console.error('Search error:', error);
            // Fallback to local search
            const searchLower = term.toLowerCase();
            const matches = feedback && (
                feedback.subject.toLowerCase().includes(searchLower) ||
                feedback.message.toLowerCase().includes(searchLower) ||
                feedback.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
                feedback.category.toLowerCase().includes(searchLower)
            );
            
            setFilteredFeedback(matches ? feedback : null);
        }
    };

    // Generate Report
    const generateReport = () => {
        const report = {
            feedbackId: feedback?._id,
            subject: feedback?.subject,
            category: feedback?.category,
            severity: feedback?.severity,
            status: feedback?.status,
            rating: feedback?.rating || rating,
            submittedDate: feedback?.createdAt,
            resolvedDate: feedback?.status === 'resolved' ? new Date() : null,
            responseTime: feedback?.adminResponses?.length > 0 
                ? Math.ceil((new Date(feedback.adminResponses[0].createdAt) - new Date(feedback.createdAt)) / (1000 * 60 * 60 * 24)) + ' days'
                : 'N/A',
            totalResponses: feedback?.adminResponses?.length || 0,
            attachmentCount: (feedback?.images?.length || 0) + uploadedImages.length,
            generatedAt: new Date()
        };
        
        setReportData(report);
        setShowReportModal(true);
    };

    // Download Report as JSON
    const downloadReport = () => {
        if (!reportData) return;
        
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `feedback-report-${reportData.feedbackId}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this feedback?')) return;

        try {
            if (backendConnected) {
                const result = await Promise.race([
                    FeedbackService.deleteFeedback(id),
                    new Promise(resolve => setTimeout(() => resolve({ success: false }), 2000))
                ]);
                
                if (result.success) {
                    alert('Feedback deleted successfully');
                    navigate(-1);
                    return;
                }
            }
            
            // Fallback for offline mode
            alert('Demo: Feedback would be deleted (Backend offline)');
            navigate(-1);
            
        } catch (error) {
            console.error('Error deleting feedback:', error);
            alert('Demo: Feedback would be deleted (Backend offline)');
            navigate(-1);
        }
    };

    const handleAdminResponse = async () => {
        if (!adminResponse.trim()) {
            alert('Please enter a response');
            return;
        }

        setSubmittingResponse(true);
        
        try {
            if (backendConnected) {
                const result = await Promise.race([
                    FeedbackService.addAdminResponse(id, adminResponse),
                    new Promise(resolve => setTimeout(() => resolve({ success: false }), 2000))
                ]);
                
                if (result.success) {
                    alert('Response added successfully');
                    setAdminResponse('');
                    fetchFeedback(); // Refresh data
                    return;
                }
            }
            
            // Fallback for offline mode
            const newResponse = {
                message: adminResponse,
                createdAt: new Date(),
                admin: { name: 'Current Admin (Demo)' }
            };
            
            setFeedback(prev => ({
                ...prev,
                adminResponses: [...(prev.adminResponses || []), newResponse]
            }));
            
            setAdminResponse('');
            alert('Demo: Response added locally (Backend offline)');
            
        } catch (error) {
            console.error('Error adding admin response:', error);
            alert('Demo: Response would be added (Backend offline)');
        } finally {
            setSubmittingResponse(false);
        }
    };

    const handleResolve = async () => {
        try {
            if (backendConnected) {
                const result = await Promise.race([
                    FeedbackService.resolveFeedback(id),
                    new Promise(resolve => setTimeout(() => resolve({ success: false }), 2000))
                ]);
                
                if (result.success) {
                    alert('Feedback resolved successfully');
                    fetchFeedback(); // Refresh data
                    return;
                }
            }
            
            // Fallback for offline mode
            setFeedback(prev => ({ ...prev, status: 'resolved' }));
            setFilteredFeedback(prev => prev ? { ...prev, status: 'resolved' } : null);
            alert('Demo: Feedback marked as resolved (Backend offline)');
            
        } catch (error) {
            console.error('Error resolving feedback:', error);
            alert('Demo: Feedback would be resolved (Backend offline)');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!feedback) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Feedback not found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">The feedback you're looking for doesn't exist.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    // Show "no results" message if search term exists but no filtered results
    if (searchTerm && !filteredFeedback) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 p-6">
                {/* Search Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <input
                            type="text"
                            placeholder="Search in feedback content..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <button
                            onClick={() => navigate(-1)}
                            className="ml-4 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ← Back
                        </button>
                    </div>
                </div>
                
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No matching results</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        No feedback found matching "{searchTerm}". Try different keywords.
                    </p>
                    <button
                        onClick={() => handleSearch('')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        Clear Search
                    </button>
                </div>
            </div>
        );
    }

    // Use filteredFeedback for display
    const displayFeedback = filteredFeedback || feedback;

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6">
            {/* Backend Connection Status */}
            {backendConnected === false && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Backend Offline - Demo Mode
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>Using mock data. Start backend server for full functionality.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Actions Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 max-w-md">
                        <label htmlFor="search" className="sr-only">Search feedback</label>
                        <div className="relative">
                            <input
                                type="text"
                                id="search"
                                placeholder="Search in feedback content..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={generateReport}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span>Generate Report</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        ← Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback Details</h1>
                </div>

                <div className="flex items-center space-x-2">
                    {user?.role === 'admin' && displayFeedback.status !== 'resolved' && (
                        <button
                            onClick={handleResolve}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Mark Resolved
                        </button>
                    )}
                    {(user?.role === 'admin' || displayFeedback.user?._id === user?._id) && (
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                {/* Header Section */}
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[displayFeedback.status]}`}>
                                {displayFeedback.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${severityColors[displayFeedback.severity]}`}>
                                {displayFeedback.severity.toUpperCase()}
                            </span>
                            <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-600 dark:text-gray-300">
                                {categories[displayFeedback.category]}
                            </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            ID: {displayFeedback._id}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Subject and Rating */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                            {displayFeedback.subject}
                        </h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Rating:
                            </label>
                            <StarRating 
                                rating={rating} 
                                onRatingChange={setRating}
                                readOnly={user?.role !== 'admin' && displayFeedback.user?._id !== user?._id}
                            />
                        </div>
                    </div>

                    {/* Meta Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Submitted by:</span>
                            <p className="text-gray-900 dark:text-white">{displayFeedback.user?.name || 'Unknown'}</p>
                            <p className="text-gray-600 dark:text-gray-400">{displayFeedback.user?.email}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                            <p className="text-gray-900 dark:text-white">{formatDate(displayFeedback.createdAt)}</p>
                        </div>
                        {displayFeedback.booking && (
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Related Booking:</span>
                                <p className="text-blue-600 dark:text-blue-400">{displayFeedback.booking.bookingNumber}</p>
                                {displayFeedback.booking.vehicle && (
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {displayFeedback.booking.vehicle.carNumber} - {displayFeedback.booking.vehicle.make} {displayFeedback.booking.vehicle.model}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    {displayFeedback.tags && displayFeedback.tags.length > 0 && (
                        <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300 block mb-2">Tags:</span>
                            <div className="flex flex-wrap gap-2">
                                {displayFeedback.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-300"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Message */}
                    <div>
                        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Message:</h3>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{displayFeedback.message}</p>
                        </div>
                    </div>

                    {/* Images Section */}
                    <div>
                        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Images:</h3>
                        
                        {/* Existing Images */}
                        {(displayFeedback.images || displayFeedback.attachments) && 
                         (displayFeedback.images?.length > 0 || displayFeedback.attachments?.length > 0) && (
                            <div className="mb-4">
                                <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Existing Images:</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {/* Display images array */}
                                    {displayFeedback.images?.map((image, index) => (
                                        <div key={`img-${index}`} className="relative group">
                                            <img
                                                src={image.url || image.path || '/api/placeholder/150/150'}
                                                alt={`Feedback image ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im05Ni40IDQ2LjRjMCAxNy43LTEyLjYgMzItMjguMSAzMnMtMjguMS0xNC4zLTI4LjEtMzIgMTIuNi0zMiAyOC4xLTMyIDI4LjEgMTQuMyAyOC4xIDMyek0xMTEuMiA5Ni40SDM4LjhsLTcuMiAxNy42aDg3LjJsLTcuNi0xNy42eiIgZmlsbD0iIzllYTNhOCIvPgo8L3N2Zz4=';
                                                    e.target.classList.add('opacity-50');
                                                }}
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                                                <button
                                                    onClick={() => {
                                                        const newWindow = window.open();
                                                        newWindow.document.write(`<img src="${image.url || image.path}" style="max-width:100%;height:auto;" alt="Feedback image">`);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 text-white text-sm bg-blue-600 px-2 py-1 rounded transition-opacity"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Display attachments array (filter for images) */}
                                    {displayFeedback.attachments?.filter(att => att.mimetype?.startsWith('image/')).map((attachment, index) => (
                                        <div key={`att-${index}`} className="relative group">
                                            <img
                                                src={attachment.url || `/api/files/${attachment.filename}` || '/api/placeholder/150/150'}
                                                alt={attachment.originalname || `Attachment ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im05Ni40IDQ2LjRjMCAxNy43LTEyLjYgMzItMjguMSAzMnMtMjguMS0xNC4zLTI4LjEtMzIgMTIuNi0zMiAyOC4xLTMyIDI4LjEgMTQuMyAyOC4xIDMyek0xMTEuMiA5Ni40SDM4LjhsLTcuMiAxNy42aDg3LjJsLTcuNi0xNy42eiIgZmlsbD0iIzllYTNhOCIvPgo8L3N2Zz4=';
                                                    e.target.classList.add('opacity-50');
                                                }}
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                                                <button
                                                    onClick={() => {
                                                        const newWindow = window.open();
                                                        newWindow.document.write(`<img src="${attachment.url || `/api/files/${attachment.filename}`}" style="max-width:100%;height:auto;" alt="${attachment.originalname}">`);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 text-white text-sm bg-blue-600 px-2 py-1 rounded transition-opacity"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload New Images */}
                        {(user?.role === 'admin' || displayFeedback.user?._id === user?._id) && (
                            <div className="mb-4">
                                <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload Additional Images:</h4>
                                <div className="flex items-center space-x-3">
                                    <label className={`cursor-pointer bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg p-4 transition-colors dark:bg-gray-700 dark:border-gray-500 dark:hover:bg-gray-600 ${uploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <div className="flex flex-col items-center space-y-2">
                                            {uploadingImages ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                                    <span className="text-sm text-blue-600 dark:text-blue-400">Processing...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                                    </svg>
                                                    <span className="text-sm text-blue-600 dark:text-blue-400">Add Images</span>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploadingImages}
                                        />
                                    </label>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        <p>Max 5MB per image</p>
                                        <p>Supported: JPG, PNG, GIF</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Newly Uploaded Images */}
                        {uploadedImages.length > 0 && (
                            <div>
                                <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Newly Added Images:</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {uploadedImages.map((image) => (
                                        <div key={image.id} className="relative group">
                                            <div className="relative">
                                                <img
                                                    src={image.url}
                                                    alt={image.name}
                                                    className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                                    onError={(e) => {
                                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im05Ni40IDQ2LjRjMCAxNy43LTEyLjYgMzItMjguMSAzMnMtMjguMS0xNC4zLTI4LjEtMzIgMTIuNi0zMiAyOC4xLTMyIDI4LjEgMTQuMyAyOC4xIDMyek0xMTEuMiA5Ni40SDM4LjhsLTcuMiAxNy42aDg3LjJsLTcuNi0xNy42eiIgZmlsbD0iIzllYTNhOCIvPgo8L3N2Zz4=';
                                                        e.target.classList.add('opacity-50');
                                                    }}
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                // Open image in new tab
                                                                const newWindow = window.open();
                                                                newWindow.document.write(`<img src="${image.url}" style="max-width:100%;height:auto;" alt="${image.name}">`);
                                                            }}
                                                            className="text-white text-xs bg-blue-600 px-2 py-1 rounded transition-opacity hover:bg-blue-700"
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            onClick={() => removeImage(image.id)}
                                                            className="text-white text-xs bg-red-600 px-2 py-1 rounded transition-opacity hover:bg-red-700"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                                                    New
                                                </div>
                                                <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 py-0.5 rounded">
                                                    {(image.size / 1024).toFixed(0)}KB
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate" title={image.name}>
                                                {image.name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Admin Responses */}
                    {displayFeedback.adminResponses && displayFeedback.adminResponses.length > 0 && (
                        <div>
                            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Admin Responses:</h3>
                            <div className="space-y-4">
                                {displayFeedback.adminResponses.map((response, index) => (
                                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                Admin Response
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDate(response.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-gray-900 dark:text-white">{response.message}</p>
                                        {response.admin && (
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                by {response.admin.name}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Admin Response Form */}
                    {user?.role === 'admin' && displayFeedback.status !== 'resolved' && (
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Add Admin Response:</h4>
                            <div className="space-y-4">
                                <textarea
                                    value={adminResponse}
                                    onChange={(e) => setAdminResponse(e.target.value)}
                                    rows={4}
                                    placeholder="Enter your response to this feedback..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    disabled={submittingResponse}
                                />
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleAdminResponse}
                                        disabled={submittingResponse}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        {submittingResponse ? 'Submitting...' : 'Submit Response'}
                                    </button>
                                    <button
                                        onClick={() => setAdminResponse('')}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                        disabled={submittingResponse}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && reportData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Feedback Report
                                </h3>
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Feedback ID:</span>
                                        <p className="text-gray-900 dark:text-white">{reportData.feedbackId}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Subject:</span>
                                        <p className="text-gray-900 dark:text-white">{reportData.subject}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                                        <p className="text-gray-900 dark:text-white">{categories[reportData.category]}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Severity:</span>
                                        <p className="text-gray-900 dark:text-white capitalize">{reportData.severity}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                                        <p className="text-gray-900 dark:text-white capitalize">{reportData.status.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Rating:</span>
                                        <p className="text-gray-900 dark:text-white">{reportData.rating}/5 ⭐</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Response Time:</span>
                                        <p className="text-gray-900 dark:text-white">{reportData.responseTime}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Total Responses:</span>
                                        <p className="text-gray-900 dark:text-white">{reportData.totalResponses}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Attachments:</span>
                                        <p className="text-gray-900 dark:text-white">{reportData.attachmentCount}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Submitted:</span>
                                        <p className="text-gray-900 dark:text-white">{formatDate(reportData.submittedDate)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={downloadReport}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Download Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackDetail;