import React, { useState, useEffect, useContext } from 'react';
import { api } from '../../axios.config.js';
import { UserContext } from '../../context/UserContext.jsx';
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Upload,
  X,
  Eye,
  Calendar,
  Package
} from 'lucide-react';

const CoordinatorAppeals = () => {
  const { user } = useContext(UserContext);
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Form state
  const [appealForm, setAppealForm] = useState({
    title: '',
    description: '',
    urgency: 'medium',
    justification: '',
    requestedItems: [{
      itemType: 'money',
      amount: '',
      purpose: '',
      itemName: '',
      quantity: '',
      specification: '',
      reason: '',
      priority: 'medium'
    }],
    currentSituation: {
      numberOfChildren: '',
      currentStock: '',
      immediateNeed: '',
      impactIfNotFulfilled: ''
    },
    expectedFulfillmentDate: ''
  });

  const [supportingDocs, setSupportingDocs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appeals/my-appeals');
      setAppeals(response.data);
    } catch (err) {
      console.error('Error fetching appeals:', err);
      setError('Failed to load appeals');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setAppealForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedFormChange = (parent, field, value) => {
    setAppealForm(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...appealForm.requestedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setAppealForm(prev => ({
      ...prev,
      requestedItems: updatedItems
    }));
  };

  const addRequestedItem = () => {
    setAppealForm(prev => ({
      ...prev,
      requestedItems: [
        ...prev.requestedItems,
        {
          itemType: 'money',
          amount: '',
          purpose: '',
          itemName: '',
          quantity: '',
          specification: '',
          reason: '',
          priority: 'medium'
        }
      ]
    }));
  };

  const removeRequestedItem = (index) => {
    setAppealForm(prev => ({
      ...prev,
      requestedItems: prev.requestedItems.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setSupportingDocs([...supportingDocs, ...files]);
  };

  const removeFile = (index) => {
    setSupportingDocs(supportingDocs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Add appeal data
      Object.keys(appealForm).forEach(key => {
        if (key === 'requestedItems' || key === 'currentSituation') {
          formData.append(key, JSON.stringify(appealForm[key]));
        } else {
          formData.append(key, appealForm[key]);
        }
      });

      // Add supporting documents
      supportingDocs.forEach((file, index) => {
        formData.append('supportingDocuments', file);
      });

      const response = await api.post('/appeals/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Reset form
      setAppealForm({
        title: '',
        description: '',
        urgency: 'medium',
        justification: '',
        requestedItems: [{
          itemType: 'money',
          amount: '',
          purpose: '',
          itemName: '',
          quantity: '',
          specification: '',
          reason: '',
          priority: 'medium'
        }],
        currentSituation: {
          numberOfChildren: '',
          currentStock: '',
          immediateNeed: '',
          impactIfNotFulfilled: ''
        },
        expectedFulfillmentDate: ''
      });
      setSupportingDocs([]);
      setShowCreateForm(false);
      
      // Refresh appeals list
      fetchAppeals();
      
    } catch (err) {
      console.error('Error creating appeal:', err);
      setError(err.response?.data?.message || 'Failed to create appeal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'under_review':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'fulfilled':
        return <Package className="h-5 w-5 text-purple-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'fulfilled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appeals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appeal Management</h1>
              <p className="text-gray-600 mt-2">
                Submit appeals for donations needed at your aanganwadi
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
            >
              <Plus className="h-5 w-5" />
              Create New Appeal
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Appeals List */}
        <div className="grid grid-cols-1 gap-6">
          {appeals.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Appeals Yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first appeal to request donations for your aanganwadi
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Create Appeal
              </button>
            </div>
          ) : (
            appeals.map((appeal) => (
              <div key={appeal._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appeal.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appeal.status)}`}>
                        {appeal.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(appeal.urgency)}`}>
                        {appeal.urgency.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">
                      {appeal.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(appeal.status)}
                        <span>Appeal ID: {appeal.appealId}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {new Date(appeal.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        <span>{appeal.requestedItems?.length || 0} items requested</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedAppeal(appeal);
                      setShowDetails(true);
                    }}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md text-sm flex items-center gap-1 transition duration-200"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                </div>
                
                {appeal.statusUpdates && appeal.statusUpdates.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Latest Update</h4>
                    <p className="text-sm text-gray-600">
                      {appeal.statusUpdates[appeal.statusUpdates.length - 1].message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(appeal.statusUpdates[appeal.statusUpdates.length - 1].timestamp).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Create Appeal Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Appeal</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Appeal Title *
                      </label>
                      <input
                        type="text"
                        value={appealForm.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Brief title for your appeal"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency Level *
                      </label>
                      <select
                        value={appealForm.urgency}
                        onChange={(e) => handleFormChange('urgency', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={appealForm.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      required
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Describe what you need and why"
                    />
                  </div>

                  {/* Requested Items */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Requested Items</h3>
                      <button
                        type="button"
                        onClick={addRequestedItem}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Add Item
                      </button>
                    </div>

                    {appealForm.requestedItems.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-700">Item {index + 1}</h4>
                          {appealForm.requestedItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRequestedItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Item Type *
                            </label>
                            <select
                              value={item.itemType}
                              onChange={(e) => handleItemChange(index, 'itemType', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              <option value="money">Money</option>
                              <option value="clothes">Clothes</option>
                              <option value="books">Books</option>
                              <option value="toys">Toys</option>
                              <option value="food">Food</option>
                              <option value="stationary">Stationary</option>
                              <option value="medical_supplies">Medical Supplies</option>
                            </select>
                          </div>

                          {item.itemType === 'money' ? (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Amount (₹) *
                                </label>
                                <input
                                  type="number"
                                  value={item.amount}
                                  onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Purpose *
                                </label>
                                <input
                                  type="text"
                                  value={item.purpose}
                                  onChange={(e) => handleItemChange(index, 'purpose', e.target.value)}
                                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder="What will this money be used for?"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Item Name *
                                </label>
                                <input
                                  type="text"
                                  value={item.itemName}
                                  onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Quantity *
                                </label>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Specification
                            </label>
                            <input
                              type="text"
                              value={item.specification}
                              onChange={(e) => handleItemChange(index, 'specification', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                              placeholder="Size, age group, etc."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Priority
                            </label>
                            <select
                              value={item.priority}
                              onChange={(e) => handleItemChange(index, 'priority', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason *
                          </label>
                          <textarea
                            value={item.reason}
                            onChange={(e) => handleItemChange(index, 'reason', e.target.value)}
                            rows={2}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Why is this item needed?"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Current Situation */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Situation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Children
                        </label>
                        <input
                          type="number"
                          value={appealForm.currentSituation.numberOfChildren}
                          onChange={(e) => handleNestedFormChange('currentSituation', 'numberOfChildren', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expected Fulfillment Date
                        </label>
                        <input
                          type="date"
                          value={appealForm.expectedFulfillmentDate}
                          onChange={(e) => handleFormChange('expectedFulfillmentDate', e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Stock/Resources
                        </label>
                        <textarea
                          value={appealForm.currentSituation.currentStock}
                          onChange={(e) => handleNestedFormChange('currentSituation', 'currentStock', e.target.value)}
                          rows={2}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Describe what you currently have"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Immediate Need
                        </label>
                        <textarea
                          value={appealForm.currentSituation.immediateNeed}
                          onChange={(e) => handleNestedFormChange('currentSituation', 'immediateNeed', e.target.value)}
                          rows={2}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="What do you need most urgently?"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Justification */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Justification *
                    </label>
                    <textarea
                      value={appealForm.justification}
                      onChange={(e) => handleFormChange('justification', e.target.value)}
                      required
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Explain why this appeal is necessary and how it will help the children"
                    />
                  </div>

                  {/* Supporting Documents */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supporting Documents
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 mb-2">Upload supporting documents</p>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          id="doc-upload"
                        />
                        <label
                          htmlFor="doc-upload"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition duration-200"
                        >
                          Choose Files
                        </label>
                        <p className="text-sm text-gray-500 mt-2">PDF, images, or other documents</p>
                      </div>

                      {supportingDocs.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-700 mb-2">Selected Files:</h4>
                          {supportingDocs.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded mb-2">
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit Appeal'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Appeal Details Modal */}
        {showDetails && selectedAppeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Appeal Details</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {selectedAppeal.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAppeal.status)}`}>
                        {selectedAppeal.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(selectedAppeal.urgency)}`}>
                        {selectedAppeal.urgency.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Appeal ID:</span>
                        <span className="ml-2 text-gray-600">{selectedAppeal.appealId}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Created:</span>
                        <span className="ml-2 text-gray-600">
                          {new Date(selectedAppeal.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">{selectedAppeal.description}</p>
                  </div>

                  {/* Requested Items */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Requested Items</h4>
                    <div className="space-y-3">
                      {selectedAppeal.requestedItems?.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Type:</span>
                              <span className="ml-2 text-gray-600 capitalize">{item.itemType}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Priority:</span>
                              <span className={`ml-2 px-2 py-1 rounded text-xs ${getUrgencyColor(item.priority)}`}>
                                {item.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          {item.itemType === 'money' ? (
                            <div className="mt-2">
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Amount:</span>
                                <span className="ml-2 text-gray-600">₹{item.amount}</span>
                              </div>
                              <div className="text-sm mt-1">
                                <span className="font-medium text-gray-700">Purpose:</span>
                                <span className="ml-2 text-gray-600">{item.purpose}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2">
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Item:</span>
                                <span className="ml-2 text-gray-600">{item.itemName}</span>
                              </div>
                              <div className="text-sm mt-1">
                                <span className="font-medium text-gray-700">Quantity:</span>
                                <span className="ml-2 text-gray-600">{item.quantity}</span>
                              </div>
                              {item.specification && (
                                <div className="text-sm mt-1">
                                  <span className="font-medium text-gray-700">Specification:</span>
                                  <span className="ml-2 text-gray-600">{item.specification}</span>
                                </div>
                              )}
                            </div>
                          )}
                          {item.reason && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium text-gray-700">Reason:</span>
                              <p className="text-gray-600 mt-1">{item.reason}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Updates */}
                  {selectedAppeal.statusUpdates && selectedAppeal.statusUpdates.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Status Updates</h4>
                      <div className="space-y-3">
                        {selectedAppeal.statusUpdates.map((update, index) => (
                          <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                            <p className="text-gray-700">{update.message}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(update.timestamp).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Comments */}
                  {selectedAppeal.reviewComments && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Review Comments</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{selectedAppeal.reviewComments}</p>
                        {selectedAppeal.reviewDate && (
                          <p className="text-sm text-gray-500 mt-2">
                            Reviewed on {new Date(selectedAppeal.reviewDate).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoordinatorAppeals;