import React, { useState } from 'react'

function VehicleOwnerFeedback({ feedback, vehicleRatings }) {
    const [feedbackData, setFeedbackData] = useState(feedback)
    const [showFeedbackForm, setShowFeedbackForm] = useState(false)
    const [editingFeedback, setEditingFeedback] = useState(null)
    const [filter, setFilter] = useState('all')

    const [newFeedback, setNewFeedback] = useState({
        type: 'system',
        subject: '',
        message: '',
        priority: 'medium',
        category: 'general'
    })

    const [proofDocuments, setProofDocuments] = useState([])

    const handleSubmitFeedback = () => {
        if (!newFeedback.subject || !newFeedback.message) {
            alert('Please fill in all required fields')
            return
        }

        const feedback = {
            id: Date.now(),
            ...newFeedback,
            date: new Date().toISOString().split('T')[0],
            status: 'Submitted',
            response: null,
            proofDocuments: proofDocuments,
            isEditable: true
        }

        setFeedbackData([feedback, ...feedbackData])
        setNewFeedback({
            type: 'system',
            subject: '',
            message: '',
            priority: 'medium',
            category: 'general'
        })
        setProofDocuments([])
        setShowFeedbackForm(false)
        alert('Feedback submitted successfully!')
    }

    const handleEditFeedback = (feedbackId) => {
        const feedbackToEdit = feedbackData.find(f => f.id === feedbackId)
        if (feedbackToEdit && feedbackToEdit.isEditable) {
            setEditingFeedback(feedbackToEdit)
            setNewFeedback({
                type: feedbackToEdit.type,
                subject: feedbackToEdit.subject,
                message: feedbackToEdit.message,
                priority: feedbackToEdit.priority,
                category: feedbackToEdit.category
            })
            setProofDocuments(feedbackToEdit.proofDocuments || [])
            setShowFeedbackForm(true)
        } else {
            alert('This feedback cannot be edited anymore')
        }
    }

    const handleUpdateFeedback = () => {
        if (editingFeedback) {
            const updatedFeedback = feedbackData.map(f =>
                f.id === editingFeedback.id
                    ? {
                        ...f,
                        ...newFeedback,
                        proofDocuments: proofDocuments,
                        lastModified: new Date().toISOString().split('T')[0]
                    }
                    : f
            )
            setFeedbackData(updatedFeedback)
            setEditingFeedback(null)
            setNewFeedback({
                type: 'system',
                subject: '',
                message: '',
                priority: 'medium',
                category: 'general'
            })
            setProofDocuments([])
            setShowFeedbackForm(false)
            alert('Feedback updated successfully!')
        }
    }

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files)
        const newDocuments = files.map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            uploadDate: new Date().toISOString().split('T')[0]
        }))
        setProofDocuments([...proofDocuments, ...newDocuments])
    }

    const removeDocument = (docId) => {
        setProofDocuments(proofDocuments.filter(doc => doc.id !== docId))
    }

    const filteredFeedback = feedbackData.filter(f => {
        if (filter === 'submitted') return f.status === 'Submitted'
        if (filter === 'responded') return f.status === 'Responded'
        if (filter === 'resolved') return f.status === 'Resolved'
        if (filter === 'client') return f.type === 'client'
        if (filter === 'system') return f.type === 'system'
        return true
    })

    const getStatusColor = (status) => {
        switch (status) {
            case 'Submitted': return 'bg-blue-100 text-blue-800'
            case 'Responded': return 'bg-yellow-100 text-yellow-800'
            case 'Resolved': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800'
            case 'medium': return 'bg-yellow-100 text-yellow-800'
            case 'low': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getAverageRating = () => {
        if (vehicleRatings.length === 0) return 0
        const total = vehicleRatings.reduce((sum, rating) => sum + rating.rating, 0)
        return (total / vehicleRatings.length).toFixed(1)
    }

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <svg
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Feedback & Ratings</h2>
                    <p className="text-gray-600">Submit feedback and view vehicle ratings</p>
                </div>
                <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                    Submit Feedback
                </button>
            </div>

            {/* Vehicle Ratings Overview */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Vehicle Ratings Overview</h3>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{getAverageRating()}</div>
                        <div className="flex justify-end mb-1">{renderStars(Math.round(getAverageRating()))}</div>
                        <div className="text-sm text-gray-600">Average Rating</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {vehicleRatings.map((rating) => (
                        <div key={rating.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{rating.vehicle}</h4>
                                    <p className="text-sm text-gray-600">Customer: {rating.customer}</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                    {renderStars(rating.rating)}
                                    <span className="ml-2 font-semibold text-gray-900">{rating.rating}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{rating.comment}</p>
                            <p className="text-xs text-gray-500">Date: {new Date(rating.date).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feedback Form Modal */}
            {showFeedbackForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingFeedback ? 'Edit Feedback' : 'Submit New Feedback'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowFeedbackForm(false)
                                    setEditingFeedback(null)
                                    setNewFeedback({
                                        type: 'system',
                                        subject: '',
                                        message: '',
                                        priority: 'medium',
                                        category: 'general'
                                    })
                                    setProofDocuments([])
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
                                    <select
                                        value={newFeedback.type}
                                        onChange={(e) => setNewFeedback({ ...newFeedback, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="system">System/Platform</option>
                                        <option value="client">Client/Customer</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                                    <select
                                        value={newFeedback.priority}
                                        onChange={(e) => setNewFeedback({ ...newFeedback, priority: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={newFeedback.category}
                                    onChange={(e) => setNewFeedback({ ...newFeedback, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                >
                                    <option value="general">General</option>
                                    <option value="technical">Technical Issue</option>
                                    <option value="payment">Payment Issue</option>
                                    <option value="customer">Customer Complaint</option>
                                    <option value="damage">Vehicle Damage</option>
                                    <option value="suggestion">Suggestion</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                                <input
                                    type="text"
                                    value={newFeedback.subject}
                                    onChange={(e) => setNewFeedback({ ...newFeedback, subject: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder="Brief description of your concern"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                                <textarea
                                    value={newFeedback.message}
                                    onChange={(e) => setNewFeedback({ ...newFeedback, message: e.target.value })}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    placeholder="Detailed description of your feedback or concern"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Proof Documents (Optional)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                    onChange={handleFileUpload}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Upload images or documents to support your feedback (damages, receipts, etc.)
                                </p>
                            </div>

                            {proofDocuments.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents:</h4>
                                    <div className="space-y-2">
                                        {proofDocuments.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                <span className="text-sm text-gray-700">{doc.name}</span>
                                                <button
                                                    onClick={() => removeDocument(doc.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={() => {
                                    setShowFeedbackForm(false)
                                    setEditingFeedback(null)
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={editingFeedback ? handleUpdateFeedback : handleSubmitFeedback}
                                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300"
                            >
                                {editingFeedback ? 'Update Feedback' : 'Submit Feedback'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('submitted')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${filter === 'submitted' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Submitted
                </button>
                <button
                    onClick={() => setFilter('responded')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${filter === 'responded' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Responded
                </button>
                <button
                    onClick={() => setFilter('resolved')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${filter === 'resolved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Resolved
                </button>
                <button
                    onClick={() => setFilter('client')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${filter === 'client' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Client Issues
                </button>
                <button
                    onClick={() => setFilter('system')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${filter === 'system' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    System Issues
                </button>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
                {filteredFeedback.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-4 mb-2">
                                    <h4 className="font-semibold text-gray-900">{item.subject}</h4>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                                        {item.priority} priority
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">Type: {item.type} | Category: {item.category}</p>
                                <p className="text-sm text-gray-600">Date: {new Date(item.date).toLocaleDateString()}</p>
                            </div>
                            {item.isEditable && (
                                <button
                                    onClick={() => handleEditFeedback(item.id)}
                                    className="text-blue-600 hover:text-blue-800 p-2"
                                    title="Edit Feedback"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <p className="text-gray-700 mb-4">{item.message}</p>

                        {item.proofDocuments && item.proofDocuments.length > 0 && (
                            <div className="mb-4">
                                <h5 className="text-sm font-medium text-gray-700 mb-2">Attached Documents:</h5>
                                <div className="flex flex-wrap gap-2">
                                    {item.proofDocuments.map((doc) => (
                                        <span key={doc.id} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                                            {doc.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {item.response && (
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h5 className="text-sm font-medium text-green-900 mb-2">Platform Response:</h5>
                                <p className="text-green-800">{item.response}</p>
                                <p className="text-xs text-green-600 mt-2">
                                    Responded on {new Date(item.responseDate).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredFeedback.length === 0 && (
                <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-500">No feedback found for the selected filter.</p>
                </div>
            )}
        </div>
    )
}

export default VehicleOwnerFeedback
