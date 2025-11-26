import React, { useState, useEffect } from 'react';
import { Users, UserCheck, School, Settings, MapPin, Hash, Plus, Package, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/UserContext';
import { api } from '../axios.config';

const CoordinatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [aanganwadiInfo, setAanganwadiInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [volunteerDoctors, setVolunteerDoctors] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [showAanganwadiForm, setShowAanganwadiForm] = useState(false);
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [showAppealDetails, setShowAppealDetails] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [appealFormData, setAppealFormData] = useState({
    requestedQuantity: 1,
    urgency: 'medium',
    title: '',
    description: '',
    justification: '',
    expectedUsage: '',
    additionalNotes: ''
  });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    code: '',
    staffCapacity: 10
  });
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchCoordinatorData();
  }, []);

  const fetchCoordinatorData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/coordinator/dashboard');
      const { aanganwadi, students, volunteers, staff } = response.data;
      
      setAanganwadiInfo(aanganwadi);
      setStudents(students || []);
      setVolunteerDoctors(volunteers || []);
      setStaffMembers(staff || []);
      
      // If no aanganwadi is assigned, show form
      if (!aanganwadi) {
        setShowAanganwadiForm(true);
      }
    } catch (error) {
      console.error('Error fetching coordinator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAanganwadiSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coordinator/aanganwadi', formData);
      setShowAanganwadiForm(false);
      fetchCoordinatorData();
    } catch (error) {
      console.error('Error creating aanganwadi:', error);
      alert(error.response?.data?.message || 'Failed to create aanganwadi');
    }
  };

  const handleViewProfile = (studentId) => {
    navigate(`/child/${studentId}`);
  };

  // Fetch inventory items
  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  // Process donations to inventory
  const processDonationsToInventory = async () => {
    try {
      const response = await api.post('/donations/process-to-inventory');
      alert(`${response.data.message}\nProcessed: ${response.data.processedCount} donations`);
      fetchInventory(); // Refresh inventory after processing
    } catch (error) {
      console.error('Error processing donations:', error);
      alert('Failed to process donations to inventory');
    }
  };

  // Fetch coordinator's appeals
  const fetchAppeals = async () => {
    try {
      const response = await api.get('/appeals/my-appeals');
      setAppeals(response.data);
    } catch (error) {
      console.error('Error fetching appeals:', error);
    }
  };

  // Open appeal form for specific item
  const openAppealForm = (item) => {
    setSelectedInventoryItem(item);
    setAppealFormData({
      requestedQuantity: 1,
      urgency: 'medium',
      title: `Request for ${item.itemDescription}`,
      description: `Request for ${item.itemDescription} items from inventory`,
      justification: '',
      expectedUsage: '',
      additionalNotes: ''
    });
    setShowAppealForm(true);
  };

  // Handle appeal form submission
  const handleAppealSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestedItem = {
        itemType: selectedInventoryItem.itemType,
        itemName: selectedInventoryItem.itemDescription,
        specification: selectedInventoryItem.condition,
        reason: appealFormData.justification,
        priority: appealFormData.urgency === 'urgent' ? 'high' : appealFormData.urgency === 'high' ? 'medium' : 'low'
      };

      // Add quantity or amount based on item type
      if (selectedInventoryItem.itemType === 'money') {
        requestedItem.amount = parseInt(appealFormData.requestedQuantity);
        requestedItem.purpose = appealFormData.expectedUsage;
      } else {
        requestedItem.quantity = parseInt(appealFormData.requestedQuantity);
      }

      const appealData = {
        title: appealFormData.title,
        description: appealFormData.description,
        urgency: appealFormData.urgency,
        justification: appealFormData.justification,
        currentSituation: appealFormData.expectedUsage,
        requestedItems: [requestedItem]
      };

      await api.post('/appeals/create', appealData);
      alert('Appeal submitted successfully!');
      setShowAppealForm(false);
      setSelectedInventoryItem(null);
      fetchAppeals(); // Refresh appeals list
    } catch (error) {
      console.error('Error submitting appeal:', error);
      alert(`Failed to submit appeal: ${error.response?.data?.message || error.message}`);
    }
  };

  // View appeal details
  const viewAppealDetails = (appeal) => {
    setSelectedAppeal(appeal);
    setShowAppealDetails(true);
  };

  // Load inventory and appeals when tabs are accessed
  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventory();
    } else if (activeTab === 'appeals') {
      fetchAppeals();
    }
  }, [activeTab]);

  // Auto-refresh appeals every 30 seconds when appeals tab is active
  useEffect(() => {
    let interval;
    if (activeTab === 'appeals') {
      interval = setInterval(() => {
        fetchAppeals();
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Coordinator Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
            </div>
            
            {/* Aanganwadi Info Header */}
            {aanganwadiInfo && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <School className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">{aanganwadiInfo.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-blue-700">
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {aanganwadiInfo.code}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {aanganwadiInfo.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!aanganwadiInfo && (
              <button
                onClick={() => setShowAanganwadiForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Setup Aanganwadi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Aanganwadi Setup Form Modal */}
      {showAanganwadiForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Setup Your Aanganwadi</h2>
            <form onSubmit={handleAanganwadiSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aanganwadi Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter aanganwadi name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                  placeholder="Enter full address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aanganwadi Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter unique code (e.g., AWD001)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.staffCapacity}
                  onChange={(e) => setFormData({...formData, staffCapacity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Create Aanganwadi
                </button>
                <button
                  type="button"
                  onClick={() => setShowAanganwadiForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {aanganwadiInfo ? (
          <>
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: Settings },
                    { id: 'students', label: 'Students', icon: Users },
                    { id: 'volunteers', label: 'Volunteer Doctors', icon: UserCheck },
                    { id: 'staff', label: 'Staff Members', icon: School },
                    { id: 'inventory', label: 'Inventory', icon: Package },
                    { id: 'appeals', label: 'Appeals', icon: FileText }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`${
                        activeTab === id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Overview</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                        <div className="flex items-center">
                          <Users className="h-8 w-8 text-blue-600" />
                          <div className="ml-4">
                            <p className="text-2xl font-bold text-blue-900">{students.length}</p>
                            <p className="text-blue-700">Total Students</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                        <div className="flex items-center">
                          <UserCheck className="h-8 w-8 text-green-600" />
                          <div className="ml-4">
                            <p className="text-2xl font-bold text-green-900">{volunteerDoctors.length}</p>
                            <p className="text-green-700">Volunteer Doctors</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                        <div className="flex items-center">
                          <School className="h-8 w-8 text-purple-600" />
                          <div className="ml-4">
                            <p className="text-2xl font-bold text-purple-900">{staffMembers.length}</p>
                            <p className="text-purple-700">Staff Members</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Students Tab */}
                {activeTab === 'students' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Students ({students.length})</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Age
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Parent Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Health Records
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map((student) => {
                            const age = new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear();
                            return (
                            <tr key={student._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">DOB: {new Date(student.dateOfBirth).toLocaleDateString()}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {age} years
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {student.parentPhone || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {student.healthRecords?.length || 0} records
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleViewProfile(student._id)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      
                      {students.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No students found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Volunteer Doctors Tab */}
                {activeTab === 'volunteers' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Volunteer Doctors ({volunteerDoctors.length})</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {volunteerDoctors.map((doctor) => (
                        <div key={doctor._id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">Dr. {doctor.name}</h3>
                              <p className="text-sm text-gray-600">{doctor.specialization || 'General Medicine'}</p>
                              <p className="text-sm text-gray-500 mt-1">{doctor.email}</p>
                              {doctor.phone && (
                                <p className="text-sm text-gray-500">{doctor.phone}</p>
                              )}
                            </div>
                            <div className="ml-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Volunteer
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {volunteerDoctors.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No volunteer doctors available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Staff Tab */}
                {activeTab === 'staff' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Staff Members ({staffMembers.length})</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Phone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Staff ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Joined
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {staffMembers.map((staff) => (
                            <tr key={staff._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {staff.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {staff.phone || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {staff.staffId || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(staff.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {staffMembers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <School className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No staff members found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Inventory Tab */}
                {activeTab === 'inventory' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Available Inventory</h2>
                      <div className="flex gap-2">
                        <button
                          onClick={() => processDonationsToInventory()}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Process Donations
                        </button>
                        <button
                          onClick={() => fetchInventory()}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Package className="h-4 w-4" />
                          Refresh
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-white border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Item
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Available
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Condition
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {inventory.map((item) => (
                            <tr key={item._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{item.itemDescription}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {item.itemType || item.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.itemType === 'money' 
                                  ? `₹${item.availableAmount || item.totalAmount}` 
                                  : (item.availableQuantity || (item.totalQuantity - item.allocatedQuantity))
                                }
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.condition || 'Good'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => openAppealForm(item)}
                                  className={`${
                                    (item.itemType === 'money' 
                                      ? (item.availableAmount || item.totalAmount) <= 0
                                      : (item.availableQuantity || (item.totalQuantity - item.allocatedQuantity)) <= 0
                                    )
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : 'text-green-600 hover:text-green-900'
                                  }`}
                                  disabled={
                                    item.itemType === 'money' 
                                      ? (item.availableAmount || item.totalAmount) <= 0
                                      : (item.availableQuantity || (item.totalQuantity - item.allocatedQuantity)) <= 0
                                  }
                                >
                                  Request
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {inventory.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No inventory items available</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Appeals Tab */}
                {activeTab === 'appeals' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">My Appeals</h2>
                      <button
                        onClick={() => setShowAppealForm(true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        New Appeal
                      </button>
                    </div>
                    
                    <div className="bg-white border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Appeal ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Items Requested
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {appeals.map((appeal) => (
                            <tr key={appeal._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                #{appeal._id.slice(-6)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {appeal.requestedItems.map(item => 
                                    `${item.itemName} (${item.quantity || item.amount || 'N/A'}${item.itemType === 'money' ? ' ₹' : ''})`
                                  ).join(', ')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  appeal.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  appeal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  appeal.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {appeal.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(appeal.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => viewAppealDetails(appeal)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {appeals.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No appeals submitted yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <School className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Aanganwadi Assigned</h2>
            <p className="text-gray-600 mb-6">You need to set up your aanganwadi first to access the dashboard.</p>
            <button
              onClick={() => setShowAanganwadiForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Setup Aanganwadi
            </button>
          </div>
        )}
      </div>

      {/* Appeal Form Modal */}
      {showAppealForm && selectedInventoryItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Request: {selectedInventoryItem.itemDescription}
              </h3>
              
              <form onSubmit={handleAppealSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appeal Title *
                  </label>
                  <input
                    type="text"
                    value={appealFormData.title}
                    onChange={(e) => setAppealFormData({...appealFormData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={appealFormData.description}
                    onChange={(e) => setAppealFormData({...appealFormData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="Brief description of your need"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedInventoryItem.itemType === 'money' ? 'Requested Amount *' : 'Requested Quantity *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedInventoryItem.itemType === 'money' 
                      ? (selectedInventoryItem.availableAmount || selectedInventoryItem.totalAmount)
                      : (selectedInventoryItem.availableQuantity || (selectedInventoryItem.totalQuantity - selectedInventoryItem.allocatedQuantity))
                    }
                    value={appealFormData.requestedQuantity}
                    onChange={(e) => setAppealFormData({...appealFormData, requestedQuantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {selectedInventoryItem.itemType === 'money' 
                      ? `₹${selectedInventoryItem.availableAmount || selectedInventoryItem.totalAmount}`
                      : (selectedInventoryItem.availableQuantity || (selectedInventoryItem.totalQuantity - selectedInventoryItem.allocatedQuantity))
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level *
                  </label>
                  <select
                    value={appealFormData.urgency}
                    onChange={(e) => setAppealFormData({...appealFormData, urgency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="low">Low - Can wait</option>
                    <option value="medium">Medium - Regular need</option>
                    <option value="high">High - Needed soon</option>
                    <option value="urgent">Urgent - Immediate need</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Justification *
                  </label>
                  <textarea
                    value={appealFormData.justification}
                    onChange={(e) => setAppealFormData({...appealFormData, justification: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Why do you need these items?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Usage
                  </label>
                  <textarea
                    value={appealFormData.expectedUsage}
                    onChange={(e) => setAppealFormData({...appealFormData, expectedUsage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="How will these items be used?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supporting Documents
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload supporting documents (PDF, DOC, JPG, PNG) - Max 5MB each
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                  >
                    Submit Appeal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAppealForm(false);
                      setSelectedInventoryItem(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Appeal Details Modal */}
      {showAppealDetails && selectedAppeal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-2xl max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Appeal Details #{selectedAppeal._id.slice(-6)}
                </h3>
                <button
                  onClick={() => setShowAppealDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                      selectedAppeal.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedAppeal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      selectedAppeal.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedAppeal.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Urgency</label>
                    <span className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                      selectedAppeal.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                      selectedAppeal.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                      selectedAppeal.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedAppeal.urgency.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <p className="text-sm text-gray-900">{selectedAppeal.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-sm text-gray-900">{selectedAppeal.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Justification</label>
                  <p className="text-sm text-gray-900">{selectedAppeal.justification}</p>
                </div>

                {selectedAppeal.currentSituation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Situation</label>
                    <p className="text-sm text-gray-900">{selectedAppeal.currentSituation}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requested Items</label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    {selectedAppeal.requestedItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900">{item.itemName}</p>
                          <p className="text-sm text-gray-600">Type: {item.itemType}</p>
                          {item.reason && <p className="text-sm text-gray-600">Reason: {item.reason}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {item.itemType === 'money' ? `₹${item.amount}` : `${item.quantity} units`}
                          </p>
                          <p className="text-sm text-gray-600">Priority: {item.priority}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Submitted On</label>
                    <p className="text-sm text-gray-900">{new Date(selectedAppeal.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Aanganwadi</label>
                    <p className="text-sm text-gray-900">{selectedAppeal.aanganwadiName} ({selectedAppeal.aanganwadiCode})</p>
                  </div>
                </div>

                {selectedAppeal.reviewedBy && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reviewed By</label>
                    <p className="text-sm text-gray-900">{selectedAppeal.reviewedBy.name}</p>
                  </div>
                )}

                {selectedAppeal.adminComments && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Comments</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedAppeal.adminComments}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowAppealDetails(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoordinatorDashboard;