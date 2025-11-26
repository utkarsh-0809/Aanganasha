import React, { useState, useEffect } from "react";
import { api } from "../../axios.config.js";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Settings,
  Search,
  Upload,
  Calendar,
  FileText,
  MessageCircle,
  Plus,
  Eye,
  Users,
  Activity,
  Heart,
  TrendingUp,
  Syringe,
  Trash2,
} from "lucide-react";
import Notibell from "../Noti/Notibell.jsx";
import VaccinationForm from '../VaccinationForm/VaccinationForm.jsx';
import EnhancedHealthRecordForm from '../Healthrecordform/EnhancedHealthRecordForm.jsx';

const AanganwadiStaffDashboard = () => {
  // State for managing children
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childHealthRecords, setChildHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for child management forms
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [showChildDetails, setShowChildDetails] = useState(false);
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [vaccinationChildId, setVaccinationChildId] = useState(null);
  const [showHealthRecordForm, setShowHealthRecordForm] = useState(false);
  const [healthRecordChildId, setHealthRecordChildId] = useState(null);
  
  // State for new child form
  const [newChildData, setNewChildData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'Male',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: ''
  });

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  
  const navigate = useNavigate();

  // Fetch all children under this aanganwadi staff
  const fetchChildren = async () => {
    try {
      setLoading(true);
      const response = await api.get("/children/my-children");
      if (Array.isArray(response.data)) {
        setChildren(response.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setChildren([]);
      }
    } catch (err) {
      console.error("Error fetching children:", err);
      setError("Failed to load children.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  // Fetch selected child's health records
  useEffect(() => {
    if (selectedChild) {
      const fetchChildHealthRecords = async () => {
        try {
          const response = await api.get(`/health-record/child/${selectedChild._id}`);
          if (response.data && response.data.data && Array.isArray(response.data.data)) {
            setChildHealthRecords(response.data.data);
          } else if (Array.isArray(response.data)) {
            // Fallback for direct array response
            setChildHealthRecords(response.data);
          } else {
            console.error("Unexpected response format:", response.data);
            setChildHealthRecords([]);
          }
        } catch (err) {
          console.error("Error fetching child health records:", err);
          setError("Failed to load child health records.");
        }
      };

      fetchChildHealthRecords();
    } else {
      setChildHealthRecords([]);
    }
  }, [selectedChild]);

  // Debounced API call for search suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        api
          .get("/child/search", { params: { query: searchQuery } })
          .then((res) => {
            setSuggestions(res.data);
          })
          .catch((err) => {
            console.error("Error fetching suggestions:", err);
            setSuggestions([]);
          });
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name);
    setSuggestions([]);
    setSelectedChild(suggestion);
    setShowChildDetails(true);
  };

  // Handle adding new child
  const handleAddChild = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/children/add", newChildData);
      setChildren([...children, response.data.child]);
      setNewChildData({
        name: '',
        dateOfBirth: '',
        gender: 'Male',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        address: ''
      });
      setShowAddChildForm(false);
    } catch (err) {
      console.error("Error adding child:", err);
      setError("Failed to add child.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewChildData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Handle deleting a child
  const handleDeleteChild = async (childId, childName) => {
    if (window.confirm(`Are you sure you want to delete ${childName}? This action cannot be undone.`)) {
      try {
        await api.delete(`/children/${childId}`);
        setChildren(children.filter(child => child._id !== childId));
        alert(`${childName} has been successfully deleted.`);
      } catch (err) {
        console.error("Error deleting child:", err);
        setError("Failed to delete child.");
      }
    }
  };

  // Get dashboard statistics
  const getDashboardStats = () => {
    const totalChildren = children.length;
    const maleChildren = children.filter(child => child.gender === 'Male').length;
    const femaleChildren = children.filter(child => child.gender === 'Female').length;
    const averageAge = children.length > 0 ? 
      children.reduce((sum, child) => sum + calculateAge(child.dateOfBirth), 0) / children.length : 0;

    return {
      totalChildren,
      maleChildren,
      femaleChildren,
      averageAge: Math.round(averageAge * 10) / 10
    };
  };

  const stats = getDashboardStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Aanganwadi Staff Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search children..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {suggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="cursor-pointer px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="font-medium text-gray-900">{suggestion.name}</div>
                        <div className="text-sm text-gray-500">Age: {calculateAge(suggestion.dateOfBirth)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Notibell />
              <Settings className="h-6 w-6 text-gray-600 cursor-pointer hover:text-gray-900" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Children
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalChildren}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Male Children
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.maleChildren}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Heart className="h-8 w-8 text-pink-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Female Children
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.femaleChildren}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Average Age
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.averageAge} years
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => setShowAddChildForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition duration-200"
          >
            <Plus className="h-4 w-4" />
            Add New Child
          </button>
          <Link
            to="/aibot"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition duration-200"
          >
            <MessageCircle className="h-4 w-4" />
            AI Assistant
          </Link>
        </div>

        {/* Children List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Children in Your Aanganwadi
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage health records and information for all children.
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {children.length === 0 ? (
              <li className="px-4 py-4">
                <div className="text-center text-gray-500">
                  No children registered yet. Add your first child to get started.
                </div>
              </li>
            ) : (
              children.map((child) => (
                <li key={child._id} className="px-4 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {child.name && child.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {child.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Age: {child.dateOfBirth ? calculateAge(child.dateOfBirth) : 'N/A'} • {child.gender || 'N/A'} • Parent: {child.parentName || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/child/${child._id}`)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md text-sm flex items-center gap-1 transition duration-200"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          setVaccinationChildId(child._id);
                          setShowVaccinationForm(true);
                        }}
                        className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-md text-sm flex items-center gap-1 transition duration-200"
                      >
                        <Syringe className="h-4 w-4" />
                        Add Vaccination
                      </button>
                      <button
                        onClick={() => {
                          setHealthRecordChildId(child._id);
                          setShowHealthRecordForm(true);
                        }}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-md text-sm flex items-center gap-1 transition duration-200"
                      >
                        <Heart className="h-4 w-4" />
                        Health Checkup
                      </button>
                      <button
                        onClick={() => handleDeleteChild(child._id, child.name)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md text-sm flex items-center gap-1 transition duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Add Child Form Modal */}
        {showAddChildForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Add New Child
                </h3>
                <form onSubmit={handleAddChild} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Child Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newChildData.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={newChildData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={newChildData.gender}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Parent Name
                    </label>
                    <input
                      type="text"
                      name="parentName"
                      value={newChildData.parentName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Parent Phone
                    </label>
                    <input
                      type="tel"
                      name="parentPhone"
                      value={newChildData.parentPhone}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Parent Email
                    </label>
                    <input
                      type="email"
                      name="parentEmail"
                      value={newChildData.parentEmail}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={newChildData.address}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddChildForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Child
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Child Details Modal */}
        {showChildDetails && selectedChild && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-2/3 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedChild.name} - Details
                  </h3>
                  <button
                    onClick={() => {
                      setShowChildDetails(false);
                      setSelectedChild(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Child Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Child Information</h4>
                    <div className="space-y-2">
                      <p><strong>Name:</strong> {selectedChild.name}</p>
                      <p><strong>Age:</strong> {calculateAge(selectedChild.dateOfBirth)} years</p>
                      <p><strong>Gender:</strong> {selectedChild.gender}</p>
                      <p><strong>Date of Birth:</strong> {new Date(selectedChild.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Parent Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Parent Information</h4>
                    <div className="space-y-2">
                      <p><strong>Parent Name:</strong> {selectedChild.parentName}</p>
                      <p><strong>Phone:</strong> {selectedChild.parentPhone}</p>
                      <p><strong>Email:</strong> {selectedChild.parentEmail || 'Not provided'}</p>
                      <p><strong>Address:</strong> {selectedChild.address}</p>
                    </div>
                  </div>
                </div>

                {/* Health Records */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Health Records</h4>
                  {childHealthRecords.length === 0 ? (
                    <p className="text-gray-500">No health records found for this child.</p>
                  ) : (
                    <div className="space-y-3">
                      {childHealthRecords.map((record) => (
                        <div key={record._id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{record.diagnosis}</p>
                              <p className="text-sm text-gray-600">Treatment: {record.treatment}</p>
                              {record.prescription && (
                                <p className="text-sm text-gray-600">Prescription: {record.prescription}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                {new Date(record.date).toLocaleDateString()}
                              </p>
                              
                              {/* Display BMI information if available */}
                              {record.bmi && (record.bmi.height || record.bmi.weight || record.bmi.value) && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                  <p className="font-medium text-blue-800">BMI Information:</p>
                                  <div className="flex flex-wrap gap-4 mt-1 text-xs text-blue-700">
                                    {record.bmi.height && (
                                      <span>Height: {record.bmi.height} cm</span>
                                    )}
                                    {record.bmi.weight && (
                                      <span>Weight: {record.bmi.weight} kg</span>
                                    )}
                                    {record.bmi.value && (
                                      <span>BMI: {record.bmi.value}</span>
                                    )}
                                    {record.bmi.category && (
                                      <span className={`px-2 py-1 rounded font-medium ${
                                        record.bmi.category === 'Normal weight' ? 'bg-green-100 text-green-800' :
                                        record.bmi.category === 'Underweight' ? 'bg-yellow-100 text-yellow-800' :
                                        record.bmi.category === 'Overweight' ? 'bg-orange-100 text-orange-800' :
                                        record.bmi.category === 'Obese' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {record.bmi.category}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Display attachments if any */}
                              {record.attachments && record.attachments.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-600 mb-1">Attachments:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {record.attachments.map((attachment, index) => (
                                      <div key={index} className="relative">
                                        {attachment.format && (attachment.format.includes('image') || attachment.format === 'jpg' || attachment.format === 'png' || attachment.format === 'jpeg') ? (
                                          <img
                                            src={attachment.url}
                                            alt={`Attachment ${index + 1}`}
                                            className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80"
                                            onClick={() => window.open(attachment.url, '_blank')}
                                          />
                                        ) : (
                                          <a
                                            href={attachment.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded hover:bg-blue-200"
                                          >
                                            📎 File {index + 1}
                                          </a>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => {
                      setShowChildDetails(false);
                      setSelectedChild(null);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Vaccination Form Modal */}
        {showVaccinationForm && (
          <VaccinationForm
            isOpen={showVaccinationForm}
            onClose={() => {
              setShowVaccinationForm(false);
              setVaccinationChildId(null);
            }}
            childId={vaccinationChildId}
            onSuccess={(newVaccination) => {
              console.log('Vaccination added successfully:', newVaccination);
              // Refresh the children list or handle success as needed
              fetchChildren();
            }}
          />
        )}

        {/* Health Record Form Modal */}
        {showHealthRecordForm && (
          <EnhancedHealthRecordForm
            isOpen={showHealthRecordForm}
            onClose={() => {
              setShowHealthRecordForm(false);
              setHealthRecordChildId(null);
            }}
            childId={healthRecordChildId}
            onSuccess={(newRecord) => {
              console.log('Health record added successfully:', newRecord);
              // Refresh the children list or handle success as needed
              fetchChildren();
            }}
          />
        )}
      </main>
    </div>
  );
};

export default AanganwadiStaffDashboard;