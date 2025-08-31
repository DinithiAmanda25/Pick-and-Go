import React from 'react'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="max-w-xl w-full bg-white rounded-lg shadow p-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900">404</h1>
                <p className="mt-4 text-gray-700">Page not found</p>
                <div className="mt-6">
                    <a href="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md">Go to Home</a>
                </div>
            </div>
        </div>
    )
}
