import React, { useState, useEffect } from 'react';
import { X, Upload, Calendar, Syringe, FileText, Building2, User, Hash } from 'lucide-react';
import { api } from '../../axios.config';

const VaccinationForm = ({ isOpen, onClose, childId, onSuccess }) => {
  const [formData, setFormData] = useState({
    vaccineName: '',
    dateAdministered: '',
    dosageNumber: 1,
    administeredBy: '',
    facilityName: '',
    batchNumber: '',
    nextDueDate: '',
    notes: ''
  });
  
  const [files, setFiles] = useState([]);
  const [mandatoryVaccinations, setMandatoryVaccinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchMandatoryVaccinations();
      fetchUserInfo();
    }
  }, [isOpen]);

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/user/me');
      setUserInfo(response.data);
      
      // Auto-fill facility name with aanganwadi name
      if (response.data.aanganwadiName) {
        setFormData(prev => ({
          ...prev,
          facilityName: response.data.aanganwadiName
        }));
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchMandatoryVaccinations = async () => {
    try {
      const response = await api.get('/vaccination/mandatory');
      setMandatoryVaccinations(response.data.mandatoryVaccinations);
    } catch (error) {
      console.error('Error fetching mandatory vaccinations:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) {
      alert('Maximum 5 files allowed');
      return;
    }
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.vaccineName) newErrors.vaccineName = 'Vaccine name is required';
    if (!formData.dateAdministered) newErrors.dateAdministered = 'Date administered is required';
    if (!formData.administeredBy) newErrors.administeredBy = 'Administered by is required';
    if (!formData.facilityName) newErrors.facilityName = 'Facility name is required';
    
    // Check if date is not in the future
    const today = new Date().toISOString().split('T')[0];
    if (formData.dateAdministered > today) {
      newErrors.dateAdministered = 'Date cannot be in the future';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const submitData = new FormData();
      
      // Add child ID
      submitData.append('childId', childId);
      
      // Add form data
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add files
      files.forEach(file => {
        submitData.append('supportingDocuments', file);
      });
      
      const response = await api.post('/vaccination/add', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onSuccess?.(response.data.vaccinationRecord);
      onClose();
      
      // Reset form
      setFormData({
        vaccineName: '',
        dateAdministered: '',
        dosageNumber: 1,
        administeredBy: '',
        facilityName: '',
        batchNumber: '',
        nextDueDate: '',
        notes: ''
      });
      setFiles([]);
      setErrors({});
      
    } catch (error) {
      console.error('Error adding vaccination record:', error);
      alert(error.response?.data?.message || 'Failed to add vaccination record');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Syringe className="h-5 w-5 text-blue-600" />
            Add Vaccination Record
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vaccine Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Syringe className="inline h-4 w-4 mr-1" />
              Vaccine Name *
            </label>
            <select
              name="vaccineName"
              value={formData.vaccineName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.vaccineName ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a vaccine</option>
              {mandatoryVaccinations.map(vaccine => (
                <option key={vaccine} value={vaccine}>{vaccine}</option>
              ))}
            </select>
            {errors.vaccineName && (
              <p className="text-red-500 text-sm mt-1">{errors.vaccineName}</p>
            )}
          </div>
          
          {/* Date and Dosage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date Administered *
              </label>
              <input
                type="date"
                name="dateAdministered"
                value={formData.dateAdministered}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.dateAdministered ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dateAdministered && (
                <p className="text-red-500 text-sm mt-1">{errors.dateAdministered}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="inline h-4 w-4 mr-1" />
                Dosage Number
              </label>
              <input
                type="number"
                name="dosageNumber"
                value={formData.dosageNumber}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Healthcare Provider Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Administered By *
              </label>
              <input
                type="text"
                name="administeredBy"
                value={formData.administeredBy}
                onChange={handleInputChange}
                placeholder="Doctor/Healthcare provider name"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.administeredBy ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.administeredBy && (
                <p className="text-red-500 text-sm mt-1">{errors.administeredBy}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="inline h-4 w-4 mr-1" />
                Aanganwadi Center *
              </label>
              <input
                type="text"
                name="facilityName"
                value={formData.facilityName}
                onChange={handleInputChange}
                placeholder="Aanganwadi Center Name"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.facilityName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.facilityName && (
                <p className="text-red-500 text-sm mt-1">{errors.facilityName}</p>
              )}
            </div>
          </div>
          
          {/* Batch Number and Next Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Number
              </label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleInputChange}
                placeholder="Vaccine batch number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Next Due Date
              </label>
              <input
                type="date"
                name="nextDueDate"
                value={formData.nextDueDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Any additional notes about the vaccination"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="inline h-4 w-4 mr-1" />
              Supporting Documents (Max 5 files)
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Vaccination Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VaccinationForm;