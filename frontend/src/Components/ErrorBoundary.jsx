import React from 'react'

export default function ErrorBoundary({ error }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="max-w-xl w-full bg-white rounded-lg shadow p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Unexpected Application Error!</h1>
                <p className="mt-4 text-gray-700">{error?.message || 'Something went wrong.'}</p>
                <div className="mt-6">
                    <a href="/" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md">Go to Home</a>
                </div>
            </div>
        </div>
    )
}
