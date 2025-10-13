// Components/Business-owner/Drivers.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BusinessOwnerDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const { user, isAuthenticated, getToken } = useAuth();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getToken();
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.get('http://localhost:9000/api/drivers/all', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setDrivers(response.data.drivers || []);
      } else {
        setError(response.data.message || 'Failed to fetch drivers');
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
      if (err.response?.status === 401) {
        setError('Unauthorized access. Please check your permissions.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Error loading drivers data');
      }
    } finally {
      setLoading(false);
    }
  };

  const approveDriver = async (driverId) => {
    try {
      const token = getToken();
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.put(
        `http://localhost:9000/api/drivers/approve/${driverId}`, 
        { status: 'approved' },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        // Update local state
        setDrivers(drivers.map(driver => 
          driver._id === driverId ? { ...driver, status: 'approved' } : driver
        ));
        alert('Driver approved successfully!');
      } else {
        alert(response.data.message || 'Failed to approve driver');
      }
    } catch (err) {
      console.error('Error approving driver:', err);
      if (err.response?.status === 401) {
        alert('Unauthorized access. Please check your permissions.');
      } else {
        alert(err.response?.data?.message || 'Failed to approve driver');
      }
    }
  };

  const rejectDriver = async (driverId) => {
    try {
      const token = getToken();
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.put(
        `http://localhost:9000/api/drivers/approve/${driverId}`, 
        { status: 'rejected' },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        // Update local state
        setDrivers(drivers.map(driver => 
          driver._id === driverId ? { ...driver, status: 'rejected' } : driver
        ));
        alert('Driver rejected successfully!');
      } else {
        alert(response.data.message || 'Failed to reject driver');
      }
    } catch (err) {
      console.error('Error rejecting driver:', err);
      alert(err.response?.data?.message || 'Failed to reject driver');
    }
  };

  const viewDriverDetails = (driver) => {
    setSelectedDriver(driver);
    setShowDetails(true);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'suspended':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const downloadPDFReport = () => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Driver Management Report', 14, 22);
      
      // Add report date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Add summary statistics
      const pendingCount = drivers.filter(d => d.status === 'pending').length;
      const approvedCount = drivers.filter(d => d.status === 'approved').length;
      const rejectedCount = drivers.filter(d => d.status === 'rejected').length;
      const suspendedCount = drivers.filter(d => d.status === 'suspended').length;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Statistics', 14, 45);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Drivers: ${drivers.length}`, 14, 55);
      doc.text(`Pending: ${pendingCount}`, 14, 62);
      doc.text(`Approved: ${approvedCount}`, 14, 69);
      doc.text(`Rejected: ${rejectedCount}`, 14, 76);
      doc.text(`Suspended: ${suspendedCount}`, 14, 83);
      
      // Prepare table data
      const tableData = drivers.map(driver => [
        driver.driverId || 'N/A',
        driver.fullName || 'N/A',
        driver.phone || 'N/A',
        driver.email || 'N/A',
        driver.vehicleInfo?.type ? `${driver.vehicleInfo.type} - ${driver.vehicleInfo.model || 'N/A'}` : 'N/A',
        driver.vehicleInfo?.plateNumber || 'N/A',
        driver.status || 'Unknown',
        driver.rating ? `${driver.rating}/5` : 'N/A',
        formatDate(driver.createdAt)
      ]);
      
      // Add table
      autoTable(doc, {
        head: [['Driver ID', 'Name', 'Phone', 'Email', 'Vehicle', 'Plate No.', 'Status', 'Rating', 'Joined Date']],
        body: tableData,
        startY: 90,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 20 }, // Driver ID
          1: { cellWidth: 25 }, // Name
          2: { cellWidth: 20 }, // Phone
          3: { cellWidth: 30 }, // Email
          4: { cellWidth: 25 }, // Vehicle
          5: { cellWidth: 20 }, // Plate No.
          6: { cellWidth: 15 }, // Status
          7: { cellWidth: 15 }, // Rating
          8: { cellWidth: 20 }, // Joined Date
        },
        margin: { top: 90, left: 14, right: 14 },
        didDrawPage: (data) => {
          // Add page numbers
          const pageCount = doc.internal.getNumberOfPages();
          const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
          doc.setFontSize(8);
          doc.text(`Page ${currentPage} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
        }
      });
      
      // Add footer with business info
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Pick and Go - Driver Management System', 14, pageHeight - 20);
      doc.text('Report generated by Business Owner Dashboard', 14, pageHeight - 15);
      
      // Save the PDF
      const fileName = `Driver_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading drivers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p className="text-red-500 font-medium">{error}</p>
          <button 
            onClick={fetchDrivers}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Driver Management</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Total Drivers: {drivers.length}
          </span>
          <button 
            onClick={downloadPDFReport}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center space-x-2"
            title="Download PDF Report"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>Download PDF</span>
          </button>
          <button 
            onClick={fetchDrivers}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {['pending', 'approved', 'rejected', 'suspended'].map(status => {
          const count = drivers.filter(driver => driver.status === status).length;
          return (
            <div key={status} className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{status}</div>
            </div>
          );
        })}
      </div>
      
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
                Joined Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {drivers.map((driver) => (
              <tr key={driver._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {driver.driverId || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {driver.fullName || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {driver.phone || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {driver.email || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {driver.vehicleInfo?.type ? (
                      <>
                        <span className="capitalize">{driver.vehicleInfo.type}</span>
                        {driver.vehicleInfo.model && ` - ${driver.vehicleInfo.model}`}
                      </>
                    ) : 'N/A'}
                  </div>
                  {driver.vehicleInfo?.plateNumber && (
                    <div className="text-sm text-gray-500">
                      {driver.vehicleInfo.plateNumber}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(driver.status)}`}>
                    {driver.status || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {driver.rating ? `${driver.rating}/5` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(driver.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {driver.status === 'pending' && (
                      <>
                        <button
                          onClick={() => approveDriver(driver._id)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                          title="Approve Driver"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectDriver(driver._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                          title="Reject Driver"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => viewDriverDetails(driver)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                      title="View Details"
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {drivers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No drivers found</h3>
            <p className="text-gray-500">No drivers have registered yet or there was an error loading the data.</p>
          </div>
        )}
      </div>

      {/* Driver Details Modal */}
      {showDetails && selectedDriver && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Driver Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDriver.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Driver ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDriver.driverId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDriver.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDriver.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(selectedDriver.status)}`}>
                      {selectedDriver.status || 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDriver.rating ? `${selectedDriver.rating}/5` : 'N/A'}</p>
                  </div>
                </div>

                {/* Vehicle Information */}
                {selectedDriver.vehicleInfo && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Vehicle Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <p className="mt-1 text-sm text-gray-900 capitalize">{selectedDriver.vehicleInfo.type || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Model</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedDriver.vehicleInfo.model || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Plate Number</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedDriver.vehicleInfo.plateNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Color</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedDriver.vehicleInfo.color || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Address Information */}
                {selectedDriver.address && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-2">Address</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-900">
                        {[
                          selectedDriver.address.street,
                          selectedDriver.address.city,
                          selectedDriver.address.state,
                          selectedDriver.address.zipCode,
                          selectedDriver.address.country
                        ].filter(Boolean).join(', ') || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  {selectedDriver.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          approveDriver(selectedDriver._id);
                          setShowDetails(false);
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          rejectDriver(selectedDriver._id);
                          setShowDetails(false);
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessOwnerDrivers;