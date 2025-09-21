import React from 'react';
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './FeedbackDisplay.css';

const FeedbackDisplay = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:9000/api/feedback/display');
            const data = await response.json();

            if (data.success) {
                setFeedbacks(data.data);
            } else {
                throw new Error(data.error || 'Failed to fetch feedbacks');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching feedbacks:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'low': return '#28a745';
            case 'medium': return '#ffc107';
            case 'high': return '#fd7e14';
            case 'critical': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return '#dc3545';
            case 'in_progress': return '#ffc107';
            case 'resolved': return '#28a745';
            case 'closed': return '#6c757d';
            default: return '#6c757d';
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span
                key={index}
                className={`star ${index < rating ? 'filled' : ''}`}
            >
                ★
            </span>
        ));
    };


    if (loading) {
        return (
            <div className="feedback-display">
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading feedbacks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="feedback-display">
                <div className="error">
                    <h3>Error Loading Feedbacks</h3>
                    <p>{error}</p>
                    <button onClick={fetchFeedbacks} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="feedback-display">
            <div className="feedback-header">
                <h2>Customer Feedback</h2>
                <p>Recent feedback from our customers ({feedbacks.length} items)</p>
                <button onClick={fetchFeedbacks} className="refresh-btn">
                    🔄 Refresh
                </button>
            </div>

            {feedbacks.length === 0 ? (
                <div className="no-feedback">
                    <h3>No Feedback Available</h3>
                    <p>No customer feedback has been submitted yet.</p>
                </div>
            ) : (
                <div className="feedback-grid">
                    {feedbacks.map((feedback) => (
                        <div key={feedback.id} className="feedback-card">
                            <div className="feedback-header-card">
                                <div className="category-badge" data-category={feedback.category}>
                                    {feedback.category.replace('_', ' ').toUpperCase()}
                                </div>
                                <div className="rating">
                                    {renderStars(feedback.rating)}
                                    <span className="rating-number">({feedback.rating}/5)</span>
                                </div>
                            </div>

                            <h3 className="feedback-subject">{feedback.subject}</h3>

                            <p className="feedback-message">{feedback.message}</p>

                            <div className="feedback-meta">
                                <div className="status-severity">
                                    <span
                                        className="status-badge"
                                        style={{ backgroundColor: getStatusColor(feedback.status) }}
                                    >
                                        {feedback.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <span
                                        className="severity-badge"
                                        style={{ backgroundColor: getSeverityColor(feedback.severity) }}
                                    >
                                        {feedback.severity.toUpperCase()}
                                    </span>
                                </div>
                                <div className="date">
                                    {formatDate(feedback.submittedAt)}
                                </div>
                            </div>


                            {feedback.adminResponse && (
                                <div className="admin-response">
                                    <h4>Admin Response:</h4>
                                    <p>{feedback.adminResponse}</p>
                                    <small>Responded on: {formatDate(feedback.responseDate)}</small>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeedbackDisplay;