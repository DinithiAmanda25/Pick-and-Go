import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FeedbackService from '../../Services/Feedback-service';

const RatingsFeedback = () => {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        category: 'general',
        severity: 'medium',
        tags: [],
        rating: 0
    });

    const [submitting, setSubmitting] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Constants
    const categories = {
        payment: 'Payment Issues',
        booking: 'Booking Process',
        login: 'Login/Authentication',
        vehicle_condition: 'Vehicle Condition',
        driver_service: 'Driver Service',
        general: 'General Feedback'
    };

    const severityOptions = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'critical', label: 'Critical' }
    ];

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear errors
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (errorMessage) setErrorMessage('');
        if (successMessage) setSuccessMessage('');
    };

    // Handle rating change
    const handleRatingChange = (rating) => {
        setFormData(prev => ({ ...prev, rating }));
        if (errors.rating) {
            setErrors(prev => ({ ...prev, rating: '' }));
        }
        if (errorMessage) setErrorMessage('');
        if (successMessage) setSuccessMessage('');
    };

    // Handle tag addition
    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    // Handle tag removal
    const handleRemoveTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        } else if (formData.subject.trim().length < 5) {
            newErrors.subject = 'Subject must be at least 5 characters long';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters long';
        } else if (formData.message.trim().length > 1000) {
            newErrors.message = 'Message must not exceed 1000 characters';
        }

        if (formData.rating === 0) {
            newErrors.rating = 'Please provide a rating';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('✅ Submit button clicked!');
        setErrorMessage('');
        setSuccessMessage('');

        console.log('📊 Form data:', formData);

        // Validation
        if (!validateForm()) {
            console.log('❌ Form validation failed');
            setErrorMessage('Please fill in all required fields correctly.');
            return;
        }

        console.log('🚀 Form validation passed - attempting to save to database...');
        setSubmitting(true);

        try {
            // Prepare feedback data for backend
            const feedbackData = {
                subject: formData.subject.trim(),
                message: formData.message.trim(),
                category: formData.category,
                severity: formData.severity,
                tags: formData.tags,
                rating: formData.rating
            };

            console.log('💾 Sending data to backend:', feedbackData);

            // Call the FeedbackService to save to database
            const result = await FeedbackService.createFeedback(feedbackData, []);

            console.log('🔄 Backend response:', result);

            if (result.success) {
                console.log('✅ Data successfully saved to database!');
                setSuccessMessage('✅ SUCCESS! Feedback submitted and saved to database successfully!');

                // Reset form after successful submission
                setTimeout(() => {
                    setFormData({
                        subject: '',
                        message: '',
                        category: 'general',
                        severity: 'medium',
                        tags: [],
                        rating: 0
                    });
                    setTagInput('');
                    setHoverRating(0);
                    setErrors({});

                    // Navigate back after success
                    navigate(-1);
                }, 2000);
            } else {
                console.log('❌ Backend returned error:', result.message);
                setErrorMessage(result.message || 'Failed to submit feedback. Please try again.');
            }

        } catch (error) {
            console.error('❌ Error saving to database:', error);
            setErrorMessage('Network error occurred while submitting feedback. Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Star Rating Component
    const StarRating = ({ rating, onRatingChange }) => {
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || rating);
                    return (
                        <button
                            key={star}
                            type="button"
                            className={`text-3xl cursor-pointer transition-all duration-200 ${isFilled
                                ? 'text-yellow-400 hover:text-yellow-500 drop-shadow-sm'
                                : 'text-gray-300 hover:text-yellow-300'
                                }`}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => onRatingChange(star)}
                            title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                            {isFilled ? '★' : '☆'}
                        </button>
                    );
                })}
                <span className="ml-3 text-sm text-gray-600 font-medium">
                    {rating > 0 ? `${rating}/5 stars` : 'No rating selected'}
                </span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Submit Feedback & Rating
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                        Share your experience and help us improve our service
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <p className="text-green-800 font-medium">{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            <p className="text-red-800 font-medium">{errorMessage}</p>
                        </div>
                    </div>
                )}

                {/* Feedback Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-4 sm:p-6 space-y-6">
                        {/* Subject */}
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                Subject *
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                placeholder="Brief description of your feedback"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.subject ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.subject && (
                                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                            )}
                        </div>

                        {/* Category and Severity */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {Object.entries(categories).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                                    Severity *
                                </label>
                                <select
                                    id="severity"
                                    name="severity"
                                    value={formData.severity}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {severityOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rating *
                            </label>
                            <StarRating
                                rating={formData.rating}
                                onRatingChange={handleRatingChange}
                            />
                            {errors.rating && (
                                <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
                            )}
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags (Optional)
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    placeholder="Add a tag and press Enter"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                                >
                                    Add Tag
                                </button>
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                Message *
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                rows={6}
                                placeholder="Please provide detailed feedback about your experience..."
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.message && (
                                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                            )}
                            <div className="mt-1 text-xs text-gray-500">
                                {formData.message.length}/1000 characters
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="w-full sm:w-auto px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                            >
                                {submitting && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                )}
                                {submitting ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RatingsFeedback;