import React, { useState, useEffect } from 'react';
import { api } from '../../axios.config';
import { useNavigate } from "react-router-dom";

const HealthRecordForm = () => {
  const [formData, setFormData] = useState({
    childId: '', // Add childId for new system
    doctorId: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    date: '',
    isManualUpload: false,
    externalDoctorName: '',
    externalHospitalName: '',
    height: '',
    weight: '',
  });
  const [doctorList, setDoctorList] = useState([]);
  const [childrenList, setChildrenList] = useState([]); // Add children list
  const [attachments, setAttachments] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Set default date to today's date when component mounts
  useEffect(() => {
    if (!formData.date) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: today }));
    }
  }, [formData.date]);

  // Fetch doctors and children list on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get("/user/doctors");
        if (response.status === 200) {
          // Assuming response.data is an array of doctors with _id, name and specialization properties
          setDoctorList(response.data);
        } else {
          setMessage("Failed to load doctors list.");
        }
      } catch (error) {
        setMessage("Error fetching doctors list.");
      }
    };

    const fetchChildren = async () => {
      try {
        const response = await api.get("/children/my-children");
        if (response.status === 200) {
          setChildrenList(response.data);
        } else {
          setMessage("Failed to load children list.");
        }
      } catch (error) {
        setMessage("Error fetching children list.");
      }
    };

    fetchDoctors();
    fetchChildren();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setAttachments(files);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const submissionData = new FormData();
    submissionData.append('childId', formData.childId);
    submissionData.append('doctorId', formData.doctorId);
    submissionData.append('diagnosis', formData.diagnosis);
    submissionData.append('treatment', formData.treatment);
    submissionData.append('prescription', formData.prescription);
    submissionData.append('date', formData.date);
    submissionData.append('isManualUpload', formData.isManualUpload.toString());

    // Add BMI data if provided
    if (formData.height) {
      submissionData.append('height', formData.height);
    }
    if (formData.weight) {
      submissionData.append('weight', formData.weight);
    }

    if (formData.isManualUpload) {
      submissionData.append('externalDoctorName', formData.externalDoctorName);
      submissionData.append('externalHospitalName', formData.externalHospitalName);
    }

    if (formData.childId === "") {
      setMessage("Child selection is required.");
      return;
    }

    if (formData.doctorId === "" && !formData.isManualUpload) {
      setMessage("Doctor ID is required.");
      return;
    }

    if (attachments.length > 0) {
      for (let i = 0; i < attachments.length; i++) {
        submissionData.append('attachments', attachments[i]);
      }
    }

    try {
      const response = await api.post(
        "/health-record/create",
        submissionData,
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        console.log("✅ Navigation Triggered");
        navigate("/profile");
      }
      setAttachments([]);
    } catch (error) {
      setMessage(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
      <div className="bg-white border border-green-500 rounded-lg shadow-2xl p-6 sm:p-8">
        <h1 className="text-3xl font-extrabold text-center text-green-600 mb-6">
          Health Record Form
        </h1>
        {message && (
          <p className="mb-4 text-center text-sm text-green-700">{message}</p>
        )}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Child Selection */}
          <div className="mb-5">
            <label htmlFor="childId" className="block text-gray-700 font-semibold mb-2">
              Select Child <span className="text-red-500">*</span>
            </label>
            <select
              id="childId"
              name="childId"
              value={formData.childId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-200"
              required
            >
              <option value="">-- Select a child --</option>
              {childrenList.map((child) => (
                <option key={child._id} value={child._id}>
                  {child.name} - {child.childId} (Parent: {child.parentName})
                </option>
              ))}
            </select>
          </div>
          
          {/* Doctor Selection */}
          <div className="mb-5">
            <label htmlFor="doctorId" className="block text-gray-700 font-semibold mb-2">
              Select Doctor
            </label>
            <select
              id="doctorId"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-200"
              required={!formData.isManualUpload}
            >
              <option value="">-- Select a doctor --</option>
              {doctorList.map((doctor) => (
                // Use doctor._id as the value and include additional info if available.
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} {doctor.specialization ? `- ${doctor.specialization}` : ""}
                </option>
              ))}
            </select>
          </div>
          {/* Diagnosis */}
          <div className="mb-5">
            <label htmlFor="diagnosis" className="block text-gray-700 font-semibold mb-2">
              Diagnosis <span className="text-red-500">*</span>
            </label>
            <textarea
              id="diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              required
              placeholder="Enter diagnosis details"
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-200"
            ></textarea>
          </div>
          {/* Treatment */}
          <div className="mb-5">
            <label htmlFor="treatment" className="block text-gray-700 font-semibold mb-2">
              Treatment
            </label>
            <textarea
              id="treatment"
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              placeholder="Enter treatment details"
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-200"
            ></textarea>
          </div>
          {/* Prescription */}
          <div className="mb-5">
            <label htmlFor="prescription" className="block text-gray-700 font-semibold mb-2">
              Prescription
            </label>
            <textarea
              id="prescription"
              name="prescription"
              value={formData.prescription}
              onChange={handleChange}
              placeholder="Enter prescription details"
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-200"
            ></textarea>
          </div>
          {/* Date */}
          <div className="mb-5">
            <label htmlFor="date" className="block text-gray-700 font-semibold mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-200"
            />
          </div>

          {/* BMI Tracking Section */}
          <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">BMI Tracking (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="height" className="block text-gray-700 font-semibold mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="Enter height in centimeters"
                  min="100"
                  max="250"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-200"
                />
              </div>
              <div>
                <label htmlFor="weight" className="block text-gray-700 font-semibold mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Enter weight in kilograms"
                  min="20"
                  max="300"
                  step="0.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-200"
                />
              </div>
            </div>
            {formData.height && formData.weight && (
              <div className="mt-3 p-3 bg-white rounded border">
                <p className="text-sm text-gray-600">
                  BMI Preview: {((formData.weight / ((formData.height / 100) ** 2)).toFixed(1))}
                  {' - '}
                  {(() => {
                    const bmi = formData.weight / ((formData.height / 100) ** 2);
                    if (bmi < 18.5) return 'Underweight';
                    if (bmi < 25) return 'Normal weight';
                    if (bmi < 30) return 'Overweight';
                    return 'Obese';
                  })()}
                </p>
              </div>
            )}
          </div>
          {/* Manual Upload Checkbox */}
          <div className="mb-5 flex items-center">
            <input
              type="checkbox"
              id="isManualUpload"
              name="isManualUpload"
              checked={formData.isManualUpload}
              onChange={handleChange}
              className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="isManualUpload" className="ml-2 block text-gray-700 font-semibold">
              Manual Upload?
            </label>
          </div>
          {/* External Fields for Manual Upload */}
          {formData.isManualUpload && (
            <div className="mb-5 space-y-5">
              <div>
                <label htmlFor="externalDoctorName" className="block text-gray-700 font-semibold mb-2">
                  External Doctor Name
                </label>
                <input
                  type="text"
                  id="externalDoctorName"
                  name="externalDoctorName"
                  value={formData.externalDoctorName}
                  onChange={handleChange}
                  required={formData.isManualUpload}
                  placeholder="Enter external doctor's name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-200"
                />
              </div>
              <div>
                <label htmlFor="externalHospitalName" className="block text-gray-700 font-semibold mb-2">
                  External Hospital/Clinic Name
                </label>
                <input
                  type="text"
                  id="externalHospitalName"
                  name="externalHospitalName"
                  value={formData.externalHospitalName}
                  onChange={handleChange}
                  required={formData.isManualUpload}
                  placeholder="Enter external hospital/clinic name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-200"
                />
              </div>
            </div>
          )}
          {/* Attachments */}
          <div className="mb-6">
            <label htmlFor="attachments" className="block text-gray-700 font-semibold mb-2">
              Attachments
            </label>
            <input
              type="file"
              id="attachments"
              name="attachments"
              onChange={handleChange}
              multiple
              className="w-full text-gray-600"
            />
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-200"
          >
            Submit Record
          </button>
        </form>
      </div>
    </div>
  );
};

export default HealthRecordForm;
