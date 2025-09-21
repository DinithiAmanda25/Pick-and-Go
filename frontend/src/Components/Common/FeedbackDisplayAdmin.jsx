import React, { useState, useEffect } from 'react';
import './FeedbackDisplay.css';
import FeedbackService from '../../Services/Feedback-service';
import jsPDF from 'jspdf'; {/* npm install jspdf */}
import autoTable from 'jspdf-autotable'; {/* For Table Generation - autoTable*/ }

const FeedbackDisplay = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const generatePDFReport = () => {
        if (feedbacks.length === 0) {
            alert('No feedback data available to generate report.'); // Of there is no feedbak data Alertbox ---> Shows Msg
            return;
        } // 

        const doc = new jsPDF();

        // Add header
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40); //RGB Color Value
        doc.text('Customer Feedback Report', 20, 20);

        // Add generation date
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`, 20, 30);

        // Add summary statistics
        const totalFeedbacks = feedbacks.length;
        const avgRating = (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks).toFixed(1);
        const statusCounts = feedbacks.reduce((acc, f) => {
            acc[f.status] = (acc[f.status] || 0) + 1;
            return acc;
        }, {});

        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Summary Statistics:', 20, 45);

        doc.setFontSize(10);
        doc.text(`Total Feedbacks: ${totalFeedbacks}`, 20, 55);
        doc.text(`Average Rating: ${avgRating}/5.0`, 20, 62);
        doc.text(`Status Distribution:`, 20, 69);

        let yPos = 76;
        Object.entries(statusCounts).forEach(([status, count]) => {
            doc.text(`  • ${status.replace('_', ' ').toUpperCase()}: ${count}`, 25, yPos);
            yPos += 7;
        });

        // Prepare data for the table
        const tableData = feedbacks.map((feedback, index) => [
            index + 1,
            feedback.subject.substring(0, 30) + (feedback.subject.length > 30 ? '...' : ''),
            feedback.category.replace('_', ' ').toUpperCase(),
            `${feedback.rating}/5`,
            feedback.status.replace('_', ' ').toUpperCase(),
            feedback.severity.toUpperCase(),
            formatDate(feedback.submittedAt),
            feedback.message.substring(0, 50) + (feedback.message.length > 50 ? '...' : '')
        ]);

        // Add table
        autoTable(doc, {
            startY: yPos + 10,
            head: [['#', 'Subject', 'Category', 'Rating', 'Status', 'Severity', 'Date', 'Message']],
            body: tableData,
            styles: {
                fontSize: 8,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [102, 126, 234],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                1: { cellWidth: 35 },
                2: { cellWidth: 25 },
                3: { halign: 'center', cellWidth: 15 },
                4: { cellWidth: 20 },
                5: { cellWidth: 18 },
                6: { cellWidth: 25 },
                7: { cellWidth: 40 }
            }
        });

        // Add footer with page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
            doc.text('Pick and Go - Customer Feedback Report', 20, doc.internal.pageSize.height - 10);
        }

        // Save the PDF
        const fileName = `feedback-report-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    };

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

    const handleEditFeedback = async (feedbackId, updatedData) => {
        try {
            const response = await fetch(`http://localhost:9000/api/feedback/update/${feedbackId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });

            let data = {};
            try {
                data = await response.json();
            } catch { }

            if (!response.ok || data.success === false) {
                throw new Error(data.error || 'Failed to update feedback');
            }

            // Update the feedback in the local state
            setFeedbacks(prev => prev.map(feedback =>
                feedback.id === feedbackId
                    ? { ...feedback, ...updatedData }
                    : feedback
            ));

            alert('Feedback updated successfully!');
        } catch (error) {
            alert('Error: ' + (error.message || 'Failed to update feedback'));
            console.error('Error updating feedback:', error);
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
                {feedbacks.length === 0 ? null :
                    <button
                        style={{ marginLeft: '10px' }}
                        className="refresh-btn"
                        onClick={() => generatePDFReport()}
                    >
                        📄 Export as PDF
                    </button>
                }
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

                            <div className="feedback-actions">
                                <button
                                    className="delete-btn"
                                    onClick={async () => {
                                        if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) return;
                                        try {
                                            await FeedbackService.deleteFeedback(feedback.id);
                                            setFeedbacks(prev => prev.filter(fb => fb.id !== feedback.id));
                                            alert('Feedback deleted successfully!');
                                        } catch (e) {
                                            alert('Error: ' + (e.message || 'Failed to delete feedback'));
                                        }
                                    }}
                                    title="Delete this feedback"
                                >
                                    <span className="delete-icon">🗑️</span>
                                    Delete
                                </button>
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