import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const SessionInfo = () => {
    const {
        user,
        getCurrentUserId,
        getSessionData,
        getSessionId
    } = useAuth();

    const sessionData = getSessionData();
    const userId = getCurrentUserId();
    const sessionId = getSessionId();

    if (!user) {
        return null;
    }

    return (
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Session Information</h3>
            <div className="space-y-1 text-sm">
                <div><strong>User ID (MongoDB):</strong> {userId}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Role:</strong> {user.role}</div>
                <div><strong>Session ID:</strong> {sessionId}</div>
                {sessionData && (
                    <>
                        <div><strong>Login Time:</strong> {new Date(sessionData.loginTime).toLocaleString()}</div>
                        <div><strong>Dashboard Route:</strong> {sessionData.dashboardRoute}</div>
                    </>
                )}
                {user.fullName && <div><strong>Full Name:</strong> {user.fullName}</div>}
                {user.username && <div><strong>Username:</strong> {user.username}</div>}
                {user.driverId && <div><strong>Driver ID:</strong> {user.driverId}</div>}
            </div>
        </div>
    );
};

export default SessionInfo;
