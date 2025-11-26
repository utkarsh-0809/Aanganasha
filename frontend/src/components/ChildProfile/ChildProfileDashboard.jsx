import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../axios.config';
import { 
  ArrowLeft, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Activity,
  FileText,
  Syringe,
  TrendingUp,
  Heart,
  Scale
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const ChildProfileDashboard = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [vaccinationRecords, setVaccinationRecords] = useState([]);
  const [vaccinationStatus, setVaccinationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchChildData();
  }, [childId]);

  const fetchChildData = async () => {
    try {
      setLoading(true);
      
      // Fetch child details
      const childResponse = await api.get(`/children/${childId}`);
      setChild(childResponse.data);

      // Fetch health records
      const healthResponse = await api.get(`/health-record/child/${childId}`);
      if (healthResponse.data && healthResponse.data.data) {
        setHealthRecords(healthResponse.data.data);
      } else if (Array.isArray(healthResponse.data)) {
        setHealthRecords(healthResponse.data);
      }

      // Fetch vaccination records (if endpoint exists)
      try {
        const vaccinationResponse = await api.get(`/vaccination/child/${childId}`);
        setVaccinationRecords(vaccinationResponse.data || []);
        
        // Fetch vaccination status (shows all mandatory vaccines with their status)
        const statusResponse = await api.get(`/vaccination/child/${childId}/status`);
        setVaccinationStatus(statusResponse.data || null);
      } catch (vacErr) {
        console.log('Vaccination endpoint not available:', vacErr);
        setVaccinationRecords([]);
        setVaccinationStatus(null);
      }

    } catch (err) {
      console.error('Error fetching child data:', err);
      setError('Failed to load child information');
    } finally {
      setLoading(false);
    }
  };

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

  // Prepare BMI chart data
  const prepareBMIChartData = () => {
    const bmiData = healthRecords
      .filter(record => record.bmi && record.bmi.value)
      .map(record => ({
        date: new Date(record.date || record.createdAt).toLocaleDateString(),
        bmi: record.bmi.value,
        weight: record.measurements?.weight || record.bmi?.weight,
        height: record.measurements?.height || record.bmi?.height,
        category: record.bmi.category
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return bmiData;
  };

  // Prepare vaccination status data
  const prepareVaccinationData = () => {
    if (!vaccinationStatus) return [];
    
    const completed = vaccinationStatus.completed || 0;
    const pending = vaccinationStatus.totalMandatory - completed;
    
    return [
      { name: 'Completed', value: completed, color: '#10B981' },
      { name: 'Pending', value: pending, color: '#F59E0B' }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading child profile...</p>
        </div>
      </div>
    );
  }

  if (error || !child) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Child not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const bmiChartData = prepareBMIChartData();
  const vaccinationData = prepareVaccinationData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 rounded-md hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{child.name}</h1>
                <p className="text-sm text-gray-500">Child ID: {child.childId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {child.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Child Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center mb-6">
                <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    {child.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{child.name}</h2>
                <p className="text-gray-500">Age: {calculateAge(child.dateOfBirth)} years</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Born: {new Date(child.dateOfBirth).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{child.gender}</span>
                </div>
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{child.parentName}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{child.parentPhone}</span>
                </div>
                {child.parentEmail && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{child.parentEmail}</span>
                  </div>
                )}
                <div className="flex items-start text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                  <span>{child.address}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Health Records</span>
                  <span className="text-sm font-medium">{healthRecords.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vaccinations</span>
                  <span className="text-sm font-medium">
                    {vaccinationStatus ? 
                      `${vaccinationStatus.completed}/${vaccinationStatus.totalMandatory}` : 
                      vaccinationRecords.length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Enrolled Since</span>
                  <span className="text-sm font-medium">
                    {new Date(child.enrollmentDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {[
                    { id: 'overview', name: 'Overview', icon: Activity },
                    { id: 'health', name: 'Health Records', icon: FileText },
                    { id: 'vaccinations', name: 'Vaccinations', icon: Syringe },
                    { id: 'growth', name: 'Growth Charts', icon: TrendingUp }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="h-4 w-4 mr-2" />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Heart className="h-8 w-8 text-blue-600" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-blue-900">Health Status</p>
                            <p className="text-lg font-semibold text-blue-600">
                              {healthRecords.length > 0 ? 'Monitored' : 'No Records'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Syringe className="h-8 w-8 text-green-600" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-green-900">Vaccinations</p>
                            <p className="text-lg font-semibold text-green-600">
                              {vaccinationRecords.filter(v => v.status === 'completed').length} / {vaccinationRecords.length}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Scale className="h-8 w-8 text-purple-600" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-purple-900">Latest BMI</p>
                            <p className="text-lg font-semibold text-purple-600">
                              {bmiChartData.length > 0 ? bmiChartData[bmiChartData.length - 1].bmi : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        {healthRecords.slice(0, 3).map((record, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <FileText className="h-5 w-5 text-gray-400 mr-3" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{record.diagnosis}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(record.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'health' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Health Records</h3>
                      <span className="text-sm text-gray-500">{healthRecords.length} records</span>
                    </div>
                    
                    <div className="space-y-4">
                      {healthRecords.map((record, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          {/* Header with checkup type and date */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                record.checkupType === 'regular' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {record.checkupType === 'regular' ? '📋 Regular Checkup' : '🏥 Medical Examination'}
                              </span>
                              <p className="text-sm text-gray-500">
                                {new Date(record.date || record.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          {/* Physical Measurements */}
                          {record.measurements && Object.values(record.measurements).some(v => v) && (
                            <div className="mb-4 p-3 bg-blue-50 rounded">
                              <p className="font-medium text-blue-800 text-sm mb-2">📏 Physical Measurements:</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-700">
                                {record.measurements.height && <span>Height: {record.measurements.height} cm</span>}
                                {record.measurements.weight && <span>Weight: {record.measurements.weight} kg</span>}
                                {record.measurements.headCircumference && <span>Head: {record.measurements.headCircumference} cm</span>}
                                {record.measurements.chestCircumference && <span>Chest: {record.measurements.chestCircumference} cm</span>}
                              </div>
                              
                              {/* BMI Information */}
                              {record.bmi && record.bmi.value && (
                                <div className="mt-2 pt-2 border-t border-blue-200">
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm">BMI: {record.bmi.value}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      record.bmi.category === 'Normal weight' ? 'bg-green-100 text-green-800' :
                                      record.bmi.category === 'Underweight' ? 'bg-yellow-100 text-yellow-800' :
                                      record.bmi.category === 'Overweight' ? 'bg-orange-100 text-orange-800' :
                                      record.bmi.category === 'Obese' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {record.bmi.category}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Vital Signs */}
                          {record.vitalSigns && Object.values(record.vitalSigns).some(v => v || (v && Object.values(v).some(x => x))) && (
                            <div className="mb-4 p-3 bg-green-50 rounded">
                              <p className="font-medium text-green-800 text-sm mb-2">💓 Vital Signs:</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-green-700">
                                {record.vitalSigns.temperature && <span>Temp: {record.vitalSigns.temperature}°C</span>}
                                {record.vitalSigns.heartRate && <span>Heart Rate: {record.vitalSigns.heartRate} bpm</span>}
                                {record.vitalSigns.respiratoryRate && <span>Resp: {record.vitalSigns.respiratoryRate}/min</span>}
                                {record.vitalSigns.bloodPressure && (record.vitalSigns.bloodPressure.systolic || record.vitalSigns.bloodPressure.diastolic) && (
                                  <span>BP: {record.vitalSigns.bloodPressure.systolic || '?'}/{record.vitalSigns.bloodPressure.diastolic || '?'}</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* General Observations */}
                          {record.generalObservations && Object.values(record.generalObservations).some(v => v && v !== 'Good' && v !== 'Normal' && v !== 'Moderate' && v !== 'Active') && (
                            <div className="mb-4 p-3 bg-yellow-50 rounded">
                              <p className="font-medium text-yellow-800 text-sm mb-2">👁️ General Observations:</p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-yellow-700">
                                {record.generalObservations.appetite && record.generalObservations.appetite !== 'Good' && (
                                  <span>Appetite: {record.generalObservations.appetite}</span>
                                )}
                                {record.generalObservations.sleep && record.generalObservations.sleep !== 'Good' && (
                                  <span>Sleep: {record.generalObservations.sleep}</span>
                                )}
                                {record.generalObservations.activity && record.generalObservations.activity !== 'Moderate' && (
                                  <span>Activity: {record.generalObservations.activity}</span>
                                )}
                                {record.generalObservations.behavior && record.generalObservations.behavior !== 'Active' && (
                                  <span>Behavior: {record.generalObservations.behavior}</span>
                                )}
                                {record.generalObservations.skinCondition && record.generalObservations.skinCondition !== 'Normal' && (
                                  <span>Skin: {record.generalObservations.skinCondition}</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Development Milestones */}
                          {record.developmentMilestones && Object.values(record.developmentMilestones).some(v => v && v !== 'Age-appropriate') && (
                            <div className="mb-4 p-3 bg-purple-50 rounded">
                              <p className="font-medium text-purple-800 text-sm mb-2">🧠 Development Milestones:</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-purple-700">
                                {record.developmentMilestones.motorSkills && record.developmentMilestones.motorSkills !== 'Age-appropriate' && (
                                  <span>Motor: {record.developmentMilestones.motorSkills}</span>
                                )}
                                {record.developmentMilestones.languageSkills && record.developmentMilestones.languageSkills !== 'Age-appropriate' && (
                                  <span>Language: {record.developmentMilestones.languageSkills}</span>
                                )}
                                {record.developmentMilestones.socialSkills && record.developmentMilestones.socialSkills !== 'Age-appropriate' && (
                                  <span>Social: {record.developmentMilestones.socialSkills}</span>
                                )}
                                {record.developmentMilestones.cognitiveSkills && record.developmentMilestones.cognitiveSkills !== 'Age-appropriate' && (
                                  <span>Cognitive: {record.developmentMilestones.cognitiveSkills}</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Nutrition Assessment */}
                          {record.nutrition && (record.nutrition.nutritionalStatus !== 'Well-nourished' || record.nutrition.feedingPatterns || record.nutrition.supplements) && (
                            <div className="mb-4 p-3 bg-orange-50 rounded">
                              <p className="font-medium text-orange-800 text-sm mb-2">🍽️ Nutrition Assessment:</p>
                              <div className="text-xs text-orange-700 space-y-1">
                                {record.nutrition.nutritionalStatus && record.nutrition.nutritionalStatus !== 'Well-nourished' && (
                                  <div>Status: {record.nutrition.nutritionalStatus}</div>
                                )}
                                {record.nutrition.feedingPatterns && (
                                  <div>Feeding: {record.nutrition.feedingPatterns}</div>
                                )}
                                {record.nutrition.supplements && (
                                  <div>Supplements: {record.nutrition.supplements}</div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Medical Details (for detailed checkups) */}
                          {record.checkupType === 'detailed' && record.medicalDetails && (
                            <div className="mb-4 p-3 bg-red-50 rounded border-l-4 border-red-400">
                              <p className="font-medium text-red-800 text-sm mb-2">🏥 Medical Details:</p>
                              <div className="space-y-2 text-sm text-red-700">
                                {record.medicalDetails.symptoms && (
                                  <div><span className="font-medium">Symptoms:</span> {record.medicalDetails.symptoms}</div>
                                )}
                                {record.medicalDetails.diagnosis && (
                                  <div><span className="font-medium">Diagnosis:</span> {record.medicalDetails.diagnosis}</div>
                                )}
                                {record.medicalDetails.treatment && (
                                  <div><span className="font-medium">Treatment:</span> {record.medicalDetails.treatment}</div>
                                )}
                                {record.medicalDetails.prescription && (
                                  <div><span className="font-medium">Prescription:</span> {record.medicalDetails.prescription}</div>
                                )}
                                {record.medicalDetails.followUpRequired && (
                                  <div className="flex items-center gap-2">
                                    <span className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-medium">
                                      Follow-up Required
                                    </span>
                                    {record.medicalDetails.followUpDate && (
                                      <span className="text-xs">by {new Date(record.medicalDetails.followUpDate).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                )}
                                {(record.medicalDetails.externalDoctorName || record.medicalDetails.externalHospitalName) && (
                                  <div className="text-xs text-gray-600 mt-2 pt-2 border-t border-red-200">
                                    External: {record.medicalDetails.externalDoctorName} 
                                    {record.medicalDetails.externalHospitalName && ` at ${record.medicalDetails.externalHospitalName}`}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Legacy fallback for old records with diagnosis/treatment */}
                          {!record.checkupType && (record.diagnosis || record.treatment) && (
                            <div className="mb-4 p-3 bg-gray-50 rounded border-l-4 border-gray-400">
                              <p className="font-medium text-gray-800 text-sm mb-2">📝 Legacy Medical Record:</p>
                              <div className="space-y-2 text-sm text-gray-700">
                                {record.diagnosis && (
                                  <div><span className="font-medium">Diagnosis:</span> {record.diagnosis}</div>
                                )}
                                {record.treatment && (
                                  <div><span className="font-medium">Treatment:</span> {record.treatment}</div>
                                )}
                                {record.prescription && (
                                  <div><span className="font-medium">Prescription:</span> {record.prescription}</div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Notes and Recommendations */}
                          {(record.notes || record.recommendations) && (
                            <div className="mb-4 p-3 bg-gray-50 rounded">
                              <div className="space-y-2 text-sm text-gray-700">
                                {record.notes && (
                                  <div><span className="font-medium">Notes:</span> {record.notes}</div>
                                )}
                                {record.recommendations && (
                                  <div><span className="font-medium">Recommendations:</span> {record.recommendations}</div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Attachments */}
                          {record.attachments && record.attachments.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-2">📎 Attachments:</p>
                              <div className="flex flex-wrap gap-2">
                                {record.attachments.map((attachment, attachIndex) => (
                                  <div key={attachIndex}>
                                    {attachment.format && (attachment.format.includes('image') || 
                                      attachment.format === 'jpg' || attachment.format === 'png' || 
                                      attachment.format === 'jpeg') ? (
                                      <img
                                        src={attachment.url}
                                        alt={`Attachment ${attachIndex + 1}`}
                                        className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                                        onClick={() => window.open(attachment.url, '_blank')}
                                      />
                                    ) : (
                                      <a
                                        href={attachment.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded hover:bg-blue-200"
                                      >
                                        📎 File {attachIndex + 1}
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {healthRecords.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No health records available</p>
                          <p className="text-sm">Regular checkups and medical records will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'vaccinations' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Vaccination Status</h3>
                      {vaccinationStatus && (
                        <div className="text-sm text-gray-600">
                          Progress: {vaccinationStatus.completed}/{vaccinationStatus.totalMandatory} 
                          ({vaccinationStatus.completionPercentage || 0}% complete)
                        </div>
                      )}
                    </div>
                    
                    {vaccinationData.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-4">Vaccination Status Overview</h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={vaccinationData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                              >
                                {vaccinationData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                    
                    {/* Mandatory Vaccines List */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Mandatory Vaccinations</h4>
                      {vaccinationStatus && vaccinationStatus.vaccinations ? 
                        vaccinationStatus.vaccinations.map((vaccine, index) => {
                          const vaccinationRecord = vaccinationRecords.find(record => 
                            record.vaccineName === vaccine.vaccineName
                          );
                          
                          return (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{vaccine.vaccineName}</h5>
                                  <div className="text-sm text-gray-500 mt-1">
                                    {vaccine.status === 'completed' && vaccine.dateAdministered ? (
                                      <div>
                                        <p>✅ Administered: {new Date(vaccine.dateAdministered).toLocaleDateString()}</p>
                                        {vaccine.dosageNumber && (
                                          <p>Dose: {vaccine.dosageNumber}</p>
                                        )}
                                        {vaccine.nextDueDate && (
                                          <p>Next due: {new Date(vaccine.nextDueDate).toLocaleDateString()}</p>
                                        )}
                                        {vaccinationRecord && vaccinationRecord.administeredBy && (
                                          <p>By: {vaccinationRecord.administeredBy} at {vaccinationRecord.facilityName}</p>
                                        )}
                                      </div>
                                    ) : (
                                      <p>⏳ Not yet administered</p>
                                    )}
                                  </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  vaccine.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  vaccine.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  vaccine.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {vaccine.status === 'completed' ? 'Completed' :
                                   vaccine.status === 'pending' ? 'Pending' :
                                   vaccine.status === 'overdue' ? 'Overdue' : 'Due'}
                                </span>
                              </div>
                              
                              {/* Show supporting documents if available */}
                              {vaccinationRecord && vaccinationRecord.supportingDocuments && 
                               vaccinationRecord.supportingDocuments.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Supporting Documents:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {vaccinationRecord.supportingDocuments.map((doc, docIndex) => (
                                      <a
                                        key={docIndex}
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                                      >
                                        Document {docIndex + 1}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }) : (
                          <p className="text-gray-500 text-center py-8">
                            {vaccinationStatus === null ? 
                              'Loading vaccination status...' : 
                              'No vaccination information available'
                            }
                          </p>
                        )
                      }
                    </div>
                  </div>
                )}

                {activeTab === 'growth' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Growth Charts</h3>
                    
                    {bmiChartData.length > 0 ? (
                      <>
                        {/* BMI Trend Chart */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-4">BMI Trend</h4>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={bmiChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line 
                                  type="monotone" 
                                  dataKey="bmi" 
                                  stroke="#3B82F6" 
                                  strokeWidth={2}
                                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Weight and Height Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-4">Weight Trend (kg)</h4>
                            <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={bmiChartData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar dataKey="weight" fill="#10B981" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-4">Height Trend (cm)</h4>
                            <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={bmiChartData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar dataKey="height" fill="#8B5CF6" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No growth data available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildProfileDashboard;