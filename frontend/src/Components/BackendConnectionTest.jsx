import React, { useState } from 'react';
import FeedbackService from '../Services/Feedback-service';

const BackendConnectionTest = () => {
    const [connectionStatus, setConnectionStatus] = useState('Not tested');
    const [loading, setLoading] = useState(false);
    const [testResults, setTestResults] = useState([]);

    const runConnectionTest = async () => {
        setLoading(true);
        setTestResults([]);
        const results = [];

        try {
            // Test 1: Get all feedback
            results.push('🔄 Testing: GET /api/feedback');
            try {
                const feedbackResult = await FeedbackService.getFeedback();
                if (feedbackResult.success) {
                    results.push('✅ GET /api/feedback - SUCCESS');
                    results.push(`   📊 Found ${feedbackResult.data?.length || 0} feedback entries`);
                } else {
                    results.push('❌ GET /api/feedback - FAILED');
                    results.push(`   💬 ${feedbackResult.message}`);
                }
            } catch (error) {
                results.push('❌ GET /api/feedback - ERROR');
                results.push(`   🐛 ${error.message}`);
            }

            // Test 2: Try to get a specific feedback (this might fail, but shows the connection)
            results.push('\n🔄 Testing: GET /api/feedback/:id');
            try {
                const singleResult = await FeedbackService.getFeedbackById('507f1f77bcf86cd799439011');
                if (singleResult.success) {
                    results.push('✅ GET /api/feedback/:id - SUCCESS');
                } else {
                    results.push('⚠️ GET /api/feedback/:id - Expected failure (no data)');
                    results.push(`   💬 ${singleResult.message}`);
                }
            } catch (error) {
                results.push('⚠️ GET /api/feedback/:id - Expected failure');
                results.push(`   🐛 ${error.message}`);
            }

            // Test 3: Check if user is authenticated
            const user = localStorage.getItem('user');
            results.push('\n🔄 Testing: Authentication status');
            if (user) {
                try {
                    const userData = JSON.parse(user);
                    results.push('✅ User authentication - SUCCESS');
                    results.push(`   👤 User: ${userData.firstName || userData.name || 'Unknown'}`);
                    results.push(`   🔑 Role: ${userData.role || 'Unknown'}`);
                } catch (error) {
                    results.push('⚠️ User authentication - Invalid user data');
                    console.warn('User data parse error:', error);
                }
            } else {
                results.push('⚠️ User authentication - No user logged in');
                results.push('   💡 Tip: Login first for full functionality');
            }

            setConnectionStatus('Tests completed');
            
        } catch (error) {
            results.push('\n❌ Connection test failed');
            results.push(`🐛 ${error.message}`);
            setConnectionStatus('Connection failed');
        }

        setTestResults(results);
        setLoading(false);
    };

    const clearResults = () => {
        setTestResults([]);
        setConnectionStatus('Not tested');
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    🔗 Backend Connection Test
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Test the connection between frontend and backend API endpoints.
                </p>

                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={runConnectionTest}
                        disabled={loading}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                            loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {loading ? '🔄 Testing...' : '🚀 Run Connection Test'}
                    </button>
                    
                    <button
                        onClick={clearResults}
                        className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    >
                        🗑️ Clear Results
                    </button>
                </div>

                {/* Status */}
                <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status: 
                    </span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                        connectionStatus === 'Tests completed' 
                            ? 'bg-green-100 text-green-800' 
                            : connectionStatus === 'Connection failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                        {connectionStatus}
                    </span>
                </div>

                {/* Test Results */}
                {testResults.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            📋 Test Results
                        </h3>
                        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                            <pre className="whitespace-pre-wrap">
                                {testResults.join('\n')}
                            </pre>
                        </div>
                    </div>
                )}

                {/* API Information */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                        ℹ️ API Information
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                        <li>• Base URL: {import.meta.env.VITE_API_URL || 'http://localhost:9000/api'}</li>
                        <li>• Endpoints: /feedback, /auth, /upload, /vehicles, /rating</li>
                        <li>• Authentication: Session-based (user data in localStorage)</li>
                        <li>• CORS: Enabled for all origins</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BackendConnectionTest;