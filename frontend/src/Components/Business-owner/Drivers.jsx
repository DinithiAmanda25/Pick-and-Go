// Components/Business-owner/Drivers.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const BusinessOwnerDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { getToken } = useAuth();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get('http://localhost:9000/api/drivers/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDrivers(response.data.drivers);
      } else {
        setError('Failed to fetch drivers');
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Error loading drivers data');
    } finally {
      setLoading(false);
    }
  };

  const approveDriver = async (driverId) => {
    try {
      const token = getToken();
      const response = await axios.put(`/api/drivers/approve/${driverId}`, 
        { status: 'approved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        // Update local state
        setDrivers(drivers.map(driver => 
          driver._id === driverId ? response.data.driver : driver
        ));
      }
    } catch (err) {
      console.error('Error approving driver:', err);
      alert('Failed to approve driver');
    }
  };

  if (loading) return <div className="text-center py-8">Loading drivers...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Driver Management</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Driver ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {drivers.map((driver) => (
              <tr key={driver._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {driver.driverId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {driver.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {driver.phone}<br/>
                  {driver.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {driver.vehicleInfo?.type} - {driver.vehicleInfo?.model}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    driver.status === 'approved' ? 'bg-green-100 text-green-800' :
                    driver.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    driver.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {driver.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {driver.rating || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {driver.status === 'pending' && (
                    <button
                      onClick={() => approveDriver(driver._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Approve
                    </button>
                  )}
                  <button className="bg-blue-500 text-white px-3 py-1 rounded">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {drivers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No drivers found
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessOwnerDrivers;