import React, { useState, useEffect } from 'react';
import { api } from '../../axios.config';
import { X, Calendar, User, FileText, Activity, Heart, Brain, Utensils, TrendingUp, AlertCircle } from 'lucide-react';

const EnhancedHealthRecordForm = ({ isOpen, onClose, childId, onSuccess }) => {
  const [checkupType, setCheckupType] = useState('regular');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  const [doctorList, setDoctorList] = useState([]);

  // Form data organized by sections
  const [formData, setFormData] = useState({
    // Basic info
    date: new Date().toISOString().split('T')[0],
    
    // Measurements
    measurements: {
      height: '',
      weight: '',
      headCircumference: '',
      chestCircumference: ''
    },
    
    // Vital signs
    vitalSigns: {
      temperature: '',
      heartRate: '',
      respiratoryRate: '',
      systolicBP: '',
      diastolicBP: ''
    },
    
    // General observations
    generalObservations: {
      appetite: 'Good',
      sleep: 'Good',
      activity: 'Moderate',
      behavior: 'Active',
      skinCondition: 'Normal'
    },
    
    // Development milestones
    developmentMilestones: {
      motorSkills: 'Age-appropriate',
      languageSkills: 'Age-appropriate',
      socialSkills: 'Age-appropriate',
      cognitiveSkills: 'Age-appropriate'
    },
    
    // Nutrition
    nutrition: {
      nutritionalStatus: 'Well-nourished',
      feedingPatterns: '',
      supplements: ''
    },
    
    // Medical details (only for detailed checkups)
    medicalDetails: {
      doctorId: '',
      diagnosis: '',
      treatment: '',
      prescription: '',
      symptoms: '',
      followUpRequired: false,
      followUpDate: '',
      isManualUpload: false,
      externalDoctorName: '',
      externalHospitalName: ''
    },
    
    // General
    notes: '',
    recommendations: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctor/volunteers');
      setDoctorList(response.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctorList([]); // Set empty array on error
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear errors
    if (errors[`${section}.${field}`] || errors[field]) {
      setErrors(prev => ({
        ...prev,
        [`${section}.${field}`]: '',
        [field]: ''
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
    
    // Basic validations for all checkup types
    if (!formData.date) newErrors.date = 'Date is required';
    
    // Detailed checkup validations
    if (checkupType === 'detailed') {
      if (!formData.medicalDetails.diagnosis) {
        newErrors['medicalDetails.diagnosis'] = 'Diagnosis is required for detailed checkups';
      }
      if (!formData.medicalDetails.isManualUpload && !formData.medicalDetails.doctorId) {
        newErrors['medicalDetails.doctorId'] = 'Doctor is required for detailed checkups';
      }
      if (formData.medicalDetails.isManualUpload && !formData.medicalDetails.externalDoctorName) {
        newErrors['medicalDetails.externalDoctorName'] = 'External doctor name is required';
      }
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
      
      // Add basic data
      submitData.append('childId', childId);
      submitData.append('checkupType', checkupType);
      submitData.append('date', formData.date);
      submitData.append('notes', formData.notes);
      submitData.append('recommendations', formData.recommendations);
      
      // Add measurements
      Object.entries(formData.measurements).forEach(([key, value]) => {
        if (value) submitData.append(key, value);
      });
      
      // Add vital signs
      Object.entries(formData.vitalSigns).forEach(([key, value]) => {
        if (value) submitData.append(key, value);
      });
      
      // Add general observations
      Object.entries(formData.generalObservations).forEach(([key, value]) => {
        if (value) submitData.append(key, value);
      });
      
      // Add development milestones
      Object.entries(formData.developmentMilestones).forEach(([key, value]) => {
        if (value) submitData.append(key, value);
      });
      
      // Add nutrition
      Object.entries(formData.nutrition).forEach(([key, value]) => {
        if (value) submitData.append(key, value);
      });
      
      // Add medical details for detailed checkups
      if (checkupType === 'detailed') {
        Object.entries(formData.medicalDetails).forEach(([key, value]) => {
          if (value !== '' && value !== false) {
            submitData.append(key, value);
          }
        });
      }
      
      // Add files
      files.forEach(file => {
        submitData.append('attachments', file);
      });
      
      const response = await api.post('/health-record/create', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onSuccess?.(response.data.newRecord);
      onClose();
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        measurements: { height: '', weight: '', headCircumference: '', chestCircumference: '' },
        vitalSigns: { temperature: '', heartRate: '', respiratoryRate: '', systolicBP: '', diastolicBP: '' },
        generalObservations: { appetite: 'Good', sleep: 'Good', activity: 'Moderate', behavior: 'Active', skinCondition: 'Normal' },
        developmentMilestones: { motorSkills: 'Age-appropriate', languageSkills: 'Age-appropriate', socialSkills: 'Age-appropriate', cognitiveSkills: 'Age-appropriate' },
        nutrition: { nutritionalStatus: 'Well-nourished', feedingPatterns: '', supplements: '' },
        medicalDetails: { doctorId: '', diagnosis: '', treatment: '', prescription: '', symptoms: '', followUpRequired: false, followUpDate: '', isManualUpload: false, externalDoctorName: '', externalHospitalName: '' },
        notes: '',
        recommendations: ''
      });
      setFiles([]);
      setErrors({});
      setCheckupType('regular');
      
    } catch (error) {
      console.error('Error creating health record:', error);
      alert(error.response?.data?.message || 'Failed to create health record');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            Health Record - {checkupType === 'regular' ? 'Regular Checkup' : 'Detailed Medical Examination'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Checkup Type Toggle */}
          <div className="bg-blue-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Checkup Type *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="regular"
                  checked={checkupType === 'regular'}
                  onChange={(e) => setCheckupType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Regular Checkup (Growth monitoring, general health)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="detailed"
                  checked={checkupType === 'detailed'}
                  onChange={(e) => setCheckupType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">Detailed Medical Examination (Diagnosis & treatment)</span>
              </label>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange(null, 'date', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          {/* Measurements Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Physical Measurements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.measurements.height}
                  onChange={(e) => handleInputChange('measurements', 'height', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.measurements.weight}
                  onChange={(e) => handleInputChange('measurements', 'weight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Head Circumference (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.measurements.headCircumference}
                  onChange={(e) => handleInputChange('measurements', 'headCircumference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chest Circumference (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.measurements.chestCircumference}
                  onChange={(e) => handleInputChange('measurements', 'chestCircumference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Vital Signs Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Vital Signs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.vitalSigns.temperature}
                  onChange={(e) => handleInputChange('vitalSigns', 'temperature', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={formData.vitalSigns.heartRate}
                  onChange={(e) => handleInputChange('vitalSigns', 'heartRate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Respiratory Rate (per min)</label>
                <input
                  type="number"
                  value={formData.vitalSigns.respiratoryRate}
                  onChange={(e) => handleInputChange('vitalSigns', 'respiratoryRate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  value={formData.vitalSigns.systolicBP}
                  onChange={(e) => handleInputChange('vitalSigns', 'systolicBP', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  value={formData.vitalSigns.diastolicBP}
                  onChange={(e) => handleInputChange('vitalSigns', 'diastolicBP', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* General Observations */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-600" />
              General Observations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries({
                appetite: ['Poor', 'Fair', 'Good', 'Excellent'],
                sleep: ['Poor', 'Fair', 'Good', 'Excellent'],
                activity: ['Low', 'Moderate', 'High'],
                behavior: ['Calm', 'Active', 'Hyperactive', 'Withdrawn'],
                skinCondition: ['Normal', 'Dry', 'Rash', 'Other']
              }).map(([field, options]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {field.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <select
                    value={formData.generalObservations[field]}
                    onChange={(e) => handleInputChange('generalObservations', field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Development Milestones */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Development Milestones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries({
                motorSkills: 'Motor Skills',
                languageSkills: 'Language Skills',
                socialSkills: 'Social Skills',
                cognitiveSkills: 'Cognitive Skills'
              }).map(([field, label]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                  <select
                    value={formData.developmentMilestones[field]}
                    onChange={(e) => handleInputChange('developmentMilestones', field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {['Age-appropriate', 'Advanced', 'Delayed', 'Concerns'].map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition Assessment */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Utensils className="h-5 w-5 text-orange-600" />
              Nutrition Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nutritional Status</label>
                <select
                  value={formData.nutrition.nutritionalStatus}
                  onChange={(e) => handleInputChange('nutrition', 'nutritionalStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {['Well-nourished', 'Mildly malnourished', 'Moderately malnourished', 'Severely malnourished'].map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feeding Patterns</label>
                <input
                  type="text"
                  value={formData.nutrition.feedingPatterns}
                  onChange={(e) => handleInputChange('nutrition', 'feedingPatterns', e.target.value)}
                  placeholder="Describe feeding patterns"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplements</label>
                <input
                  type="text"
                  value={formData.nutrition.supplements}
                  onChange={(e) => handleInputChange('nutrition', 'supplements', e.target.value)}
                  placeholder="Any supplements being given"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Medical Details - Only for Detailed Checkups */}
          {checkupType === 'detailed' && (
            <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Medical Details (Detailed Checkup)
              </h3>
              
              {/* Manual Upload Toggle */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.medicalDetails.isManualUpload}
                    onChange={(e) => handleInputChange('medicalDetails', 'isManualUpload', e.target.checked)}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium text-blue-900">Government/External Doctor</span>
                    <p className="text-xs text-blue-700 mt-1">
                      Check this if the doctor is not a registered volunteer on our platform 
                      (e.g., government-assigned doctor, external clinic doctor)
                    </p>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Doctor Selection or External Doctor */}
                {formData.medicalDetails.isManualUpload ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        Doctor/Physician Name *
                      </label>
                      <input
                        type="text"
                        value={formData.medicalDetails.externalDoctorName}
                        onChange={(e) => handleInputChange('medicalDetails', 'externalDoctorName', e.target.value)}
                        placeholder="Dr. [Name]"
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors['medicalDetails.externalDoctorName'] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors['medicalDetails.externalDoctorName'] && (
                        <p className="text-red-500 text-sm mt-1">{errors['medicalDetails.externalDoctorName']}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hospital/Clinic/PHC Name</label>
                      <input
                        type="text"
                        value={formData.medicalDetails.externalHospitalName}
                        onChange={(e) => handleInputChange('medicalDetails', 'externalHospitalName', e.target.value)}
                        placeholder="Government Hospital / PHC / Private Clinic"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline h-4 w-4 mr-1" />
                      Volunteer Doctor *
                    </label>
                    <select
                      value={formData.medicalDetails.doctorId}
                      onChange={(e) => handleInputChange('medicalDetails', 'doctorId', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors['medicalDetails.doctorId'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a volunteer doctor</option>
                      {doctorList.map(doctor => (
                        <option key={doctor._id} value={doctor._id}>
                          Dr. {doctor.name} - {doctor.specialization || 'General'}
                        </option>
                      ))}
                    </select>
                    {errors['medicalDetails.doctorId'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['medicalDetails.doctorId']}</p>
                    )}
                    {doctorList.length === 0 && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-amber-800 text-sm font-medium mb-2">
                          ⚠️ No volunteer doctors currently available
                        </p>
                        <p className="text-amber-700 text-xs">
                          • Registered doctors need to opt-in to volunteer for aanganwadi health services<br/>
                          • Use &ldquo;Government/External Doctor&rdquo; option above for now<br/>
                          • Contact platform admin to activate doctor volunteering features
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Symptoms */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms/Chief Complaints</label>
                  <textarea
                    value={formData.medicalDetails.symptoms}
                    onChange={(e) => handleInputChange('medicalDetails', 'symptoms', e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Diagnosis */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis *</label>
                  <textarea
                    value={formData.medicalDetails.diagnosis}
                    onChange={(e) => handleInputChange('medicalDetails', 'diagnosis', e.target.value)}
                    rows="2"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors['medicalDetails.diagnosis'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors['medicalDetails.diagnosis'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['medicalDetails.diagnosis']}</p>
                  )}
                </div>

                {/* Treatment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Treatment</label>
                  <textarea
                    value={formData.medicalDetails.treatment}
                    onChange={(e) => handleInputChange('medicalDetails', 'treatment', e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Prescription */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prescription</label>
                  <textarea
                    value={formData.medicalDetails.prescription}
                    onChange={(e) => handleInputChange('medicalDetails', 'prescription', e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Follow-up */}
                <div>
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={formData.medicalDetails.followUpRequired}
                      onChange={(e) => handleInputChange('medicalDetails', 'followUpRequired', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Follow-up required</span>
                  </label>
                  {formData.medicalDetails.followUpRequired && (
                    <input
                      type="date"
                      value={formData.medicalDetails.followUpDate}
                      onChange={(e) => handleInputChange('medicalDetails', 'followUpDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes and Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                General Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange(null, 'notes', e.target.value)}
                rows="3"
                placeholder="Any additional observations or notes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations</label>
              <textarea
                value={formData.recommendations}
                onChange={(e) => handleInputChange(null, 'recommendations', e.target.value)}
                rows="3"
                placeholder="Care recommendations and next steps"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              {loading ? 'Creating...' : `Create ${checkupType === 'regular' ? 'Regular Checkup' : 'Medical Record'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedHealthRecordForm;