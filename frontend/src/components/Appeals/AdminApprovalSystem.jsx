import React, { useState, useEffect } from 'react';
import { api } from '../../axios.config.js';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Package,
  Eye,
  Calendar,
  FileText,
  Download,
  Check,
  X,
  MessageSquare
} from 'lucide-react';

const AdminApprovalSystem = () => {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [error, setError] = useState('');

  // Filter states
  const [statusFilter, setStatusFilter] = useState('pending');
  const [urgencyFilter, setUrgencyFilter] = useState('');

  // Approval form
  const [approvalForm, setApprovalForm] = useState({
    status: 'approved',
    reviewComments: '',
    approvedItems: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAppeals();
  }, [statusFilter, urgencyFilter]);

  const fetchAppeals = async () => {
    try {
      setLoading(true);
      let params = {};
      if (statusFilter) params.status = statusFilter;
      if (urgencyFilter) params.urgency = urgencyFilter;

      const response = await api.get('/appeals', { params });
      setAppeals(response.data);
    } catch (err) {
      console.error('Error fetching appeals:', err);
      setError('Failed to load appeals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalFormChange = (field, value) => {
    setApprovalForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApprovedItemChange = (index, field, value) => {
    const updatedItems = [...approvalForm.approvedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setApprovalForm(prev => ({
      ...prev,
      approvedItems: updatedItems
    }));
  };

  const openApprovalModal = (appeal) => {
    setSelectedAppeal(appeal);
    setApprovalForm({
      status: 'approved',
      reviewComments: '',
      approvedItems: appeal.requestedItems?.map(item => ({
        ...item,
        approved: true
      })) || []
    });
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.put(`/appeals/${selectedAppeal._id}/status`, {
        status: approvalForm.status,
        reviewComments: approvalForm.reviewComments,
        approvedItems: approvalForm.status === 'approved' || approvalForm.status === 'partially_approved' 
          ? approvalForm.approvedItems.filter(item => item.approved) 
          : []
      });

      // Update the appeals list
      setAppeals(appeals.map(appeal => 
        appeal._id === selectedAppeal._id ? response.data.appeal : appeal
      ));

      setShowApprovalModal(false);
      setSelectedAppeal(null);
      
    } catch (err) {
      console.error('Error updating appeal status:', err);
      setError(err.response?.data?.message || 'Failed to update appeal status');
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

  const getPendingCount = () => appeals.filter(appeal => appeal.status === 'pending').length;
  const getUrgentCount = () => appeals.filter(appeal => appeal.urgency === 'urgent').length;

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Appeal Approval System</h1>
              <p className="text-gray-600 mt-2">
                Review and approve donation appeals from aanganwadi coordinators
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{getPendingCount()}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{getUrgentCount()}</div>
                <div className="text-sm text-gray-600">Urgent</div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="fulfilled">Fulfilled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Filter
              </label>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Urgencies</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appeals List */}
        <div className="grid grid-cols-1 gap-6">
          {appeals.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Appeals Found</h3>
              <p className="text-gray-600">
                No appeals match your current filter criteria.
              </p>
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
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
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

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Aanganwadi:</span>
                      <span>{appeal.aanganwadiName}</span>
                      <span className="text-gray-400">•</span>
                      <span className="font-medium">Coordinator:</span>
                      <span>{appeal.coordinatorId?.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
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
                    
                    {appeal.status === 'pending' && (
                      <button
                        onClick={() => openApprovalModal(appeal)}
                        className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-md text-sm flex items-center gap-1 transition duration-200"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Review
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Requested Items Preview */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Requested Items:</h4>
                  <div className="flex flex-wrap gap-2">
                    {appeal.requestedItems?.slice(0, 3).map((item, index) => (
                      <span key={index} className="bg-white px-2 py-1 rounded text-sm text-gray-600">
                        {item.itemType === 'money' 
                          ? `₹${item.amount} for ${item.purpose}`
                          : `${item.quantity} ${item.itemName || item.itemType}`
                        }
                      </span>
                    ))}
                    {appeal.requestedItems?.length > 3 && (
                      <span className="text-sm text-gray-500">
                        +{appeal.requestedItems.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

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
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
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
                      <div>
                        <span className="font-medium text-gray-700">Aanganwadi:</span>
                        <span className="ml-2 text-gray-600">{selectedAppeal.aanganwadiName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Coordinator:</span>
                        <span className="ml-2 text-gray-600">{selectedAppeal.coordinatorId?.name}</span>
                      </div>
                    </div>

                    <p className="text-gray-600">{selectedAppeal.description}</p>
                  </div>

                  {/* Current Situation */}
                  {selectedAppeal.currentSituation && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Current Situation</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        {selectedAppeal.currentSituation.numberOfChildren && (
                          <div>
                            <span className="font-medium text-gray-700">Number of Children:</span>
                            <span className="ml-2 text-gray-600">{selectedAppeal.currentSituation.numberOfChildren}</span>
                          </div>
                        )}
                        {selectedAppeal.currentSituation.currentStock && (
                          <div>
                            <span className="font-medium text-gray-700">Current Stock:</span>
                            <p className="text-gray-600 mt-1">{selectedAppeal.currentSituation.currentStock}</p>
                          </div>
                        )}
                        {selectedAppeal.currentSituation.immediateNeed && (
                          <div>
                            <span className="font-medium text-gray-700">Immediate Need:</span>
                            <p className="text-gray-600 mt-1">{selectedAppeal.currentSituation.immediateNeed}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Justification */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Justification</h4>
                    <p className="text-gray-600 bg-gray-50 rounded-lg p-4">{selectedAppeal.justification}</p>
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

                  {/* Supporting Documents */}
                  {selectedAppeal.supportingDocuments && selectedAppeal.supportingDocuments.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Supporting Documents</h4>
                      <div className="space-y-2">
                        {selectedAppeal.supportingDocuments.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div>
                              <span className="text-sm font-medium text-gray-700">{doc.filename}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                {new Date(doc.uploadDate).toLocaleDateString()}
                              </span>
                            </div>
                            <button
                              onClick={() => window.open(doc.url, '_blank')}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <Download className="h-4 w-4" />
                              <span className="text-sm">Download</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                  {selectedAppeal.status === 'pending' && (
                    <button
                      onClick={() => openApprovalModal(selectedAppeal)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                      Review Appeal
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetails(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedAppeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Review Appeal</h2>
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleApprovalSubmit} className="space-y-6">
                  {/* Decision */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Decision *
                    </label>
                    <select
                      value={approvalForm.status}
                      onChange={(e) => handleApprovalFormChange('status', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="approved">Approve</option>
                      <option value="partially_approved">Partially Approve</option>
                      <option value="rejected">Reject</option>
                    </select>
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Comments *
                    </label>
                    <textarea
                      value={approvalForm.reviewComments}
                      onChange={(e) => handleApprovalFormChange('reviewComments', e.target.value)}
                      required
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Provide your review comments..."
                    />
                  </div>

                  {/* Approved Items (if approved or partially approved) */}
                  {(approvalForm.status === 'approved' || approvalForm.status === 'partially_approved') && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Items</h3>
                      <div className="space-y-3">
                        {approvalForm.approvedItems.map((item, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <input
                                type="checkbox"
                                checked={item.approved || false}
                                onChange={(e) => handleApprovedItemChange(index, 'approved', e.target.checked)}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <span className="font-medium text-gray-700 capitalize">
                                {item.itemType}
                              </span>
                              {item.itemType === 'money' ? (
                                <span className="text-gray-600">₹{item.amount} for {item.purpose}</span>
                              ) : (
                                <span className="text-gray-600">{item.quantity} {item.itemName}</span>
                              )}
                            </div>
                            
                            {item.approved && (
                              <div className="ml-7 grid grid-cols-2 gap-4">
                                {item.itemType === 'money' ? (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Approved Amount (₹)
                                    </label>
                                    <input
                                      type="number"
                                      value={item.amount}
                                      onChange={(e) => handleApprovedItemChange(index, 'amount', e.target.value)}
                                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Approved Quantity
                                    </label>
                                    <input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => handleApprovedItemChange(index, 'quantity', e.target.value)}
                                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                  </div>
                                )}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                  </label>
                                  <input
                                    type="text"
                                    value={item.notes || ''}
                                    onChange={(e) => handleApprovedItemChange(index, 'notes', e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Any additional notes..."
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setShowApprovalModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2 rounded-lg text-white flex items-center gap-2 ${
                        approvalForm.status === 'approved' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : approvalForm.status === 'partially_approved'
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'bg-red-600 hover:bg-red-700'
                      } disabled:bg-gray-400`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          {approvalForm.status === 'approved' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          {approvalForm.status === 'approved' ? 'Approve' : 
                           approvalForm.status === 'partially_approved' ? 'Partially Approve' : 'Reject'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApprovalSystem;