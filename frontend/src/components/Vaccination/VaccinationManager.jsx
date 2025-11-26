import React, { useEffect, useState } from "react";
import { api } from "../../axios.config.js";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../alert-system.js";

const VaccinationManager = () => {
  const [activeTab, setActiveTab] = useState("add");
  const [formData, setFormData] = useState({
    vaccineName: "",
    dateAdministered: "",
    dosageNumber: 1,
    administeredBy: "",
    facilityName: "",
    batchNumber: "",
    nextDueDate: "",
    notes: "",
    healthRecordId: "",
    supportingDocuments: null,
  });

  const [healthRecords, setHealthRecords] = useState([]);
  const [vaccinationRecords, setVaccinationRecords] = useState([]);
  const [vaccinationStatus, setVaccinationStatus] = useState(null);
  const [mandatoryVaccinations, setMandatoryVaccinations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHealthRecords();
    fetchVaccinationRecords();
    fetchVaccinationStatus();
    fetchMandatoryVaccinations();
  }, []);

  const fetchHealthRecords = async () => {
    try {
      const response = await api.get("/health-record");
      const sortedRecords = response.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setHealthRecords(sortedRecords);
    } catch (error) {
      console.error("Error fetching health records:", error);
    }
  };

  const fetchVaccinationRecords = async () => {
    try {
      const response = await api.get("/vaccination");
      setVaccinationRecords(response.data);
    } catch (error) {
      console.error("Error fetching vaccination records:", error);
    }
  };

  const fetchVaccinationStatus = async () => {
    try {
      const response = await api.get("/vaccination/status");
      setVaccinationStatus(response.data);
    } catch (error) {
      console.error("Error fetching vaccination status:", error);
    }
  };

  const fetchMandatoryVaccinations = async () => {
    try {
      const response = await api.get("/vaccination/mandatory");
      setMandatoryVaccinations(response.data.mandatoryVaccinations);
    } catch (error) {
      console.error("Error fetching mandatory vaccinations:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting vaccination data:", formData);

    try {
      const formDataToSend = new FormData();

      // Append non-file data
      Object.keys(formData).forEach((key) => {
        if (key !== "supportingDocuments") {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append multiple files
      if (formData.supportingDocuments) {
        Array.from(formData.supportingDocuments).forEach((file) => {
          formDataToSend.append("supportingDocuments", file);
        });
      }

      const response = await api.post("/vaccination/add", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        showAlert("Vaccination record added successfully.");
        // Reset form
        setFormData({
          vaccineName: "",
          dateAdministered: "",
          dosageNumber: 1,
          administeredBy: "",
          facilityName: "",
          batchNumber: "",
          nextDueDate: "",
          notes: "",
          healthRecordId: "",
          supportingDocuments: null,
        });
        // Refresh data
        fetchVaccinationRecords();
        fetchVaccinationStatus();
      }

      console.log("Response from server:", response.data);
    } catch (error) {
      console.error("Error submitting vaccination record:", error);
      showAlert("Error submitting vaccination record. Please try again.", "error");
    }
  };

  const renderAddForm = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-10">
      <h3 className="text-2xl font-bold text-green-600 mb-6">Add Vaccination Record</h3>
      <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
        <p className="text-red-500 font-semibold text-sm">* indicates required fields</p>

        <div>
          <label className="block text-gray-700 font-semibold">
            Vaccine Name <span className="text-red-500">*</span>
          </label>
          <select
            name="vaccineName"
            className="w-full border rounded-md p-3 md:p-4 text-gray-700"
            onChange={handleChange}
            value={formData.vaccineName}
            required
          >
            <option value="">Select Vaccine</option>
            {mandatoryVaccinations.map((vaccine) => (
              <option key={vaccine} value={vaccine}>
                {vaccine}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">
            Date Administered <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="dateAdministered"
            className="w-full border rounded-md p-3 md:p-4 text-gray-700"
            onChange={handleChange}
            value={formData.dateAdministered}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">
            Dosage Number <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="dosageNumber"
            min="1"
            className="w-full border rounded-md p-3 md:p-4 text-gray-700"
            onChange={handleChange}
            value={formData.dosageNumber}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">
            Administered By <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="administeredBy"
            placeholder="Doctor/Healthcare provider name"
            className="w-full border rounded-md p-3 md:p-4 text-gray-700"
            onChange={handleChange}
            value={formData.administeredBy}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">
            Facility Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="facilityName"
            placeholder="Hospital/Clinic name"
            className="w-full border rounded-md p-3 md:p-4 text-gray-700"
            onChange={handleChange}
            value={formData.facilityName}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">
            Batch Number
          </label>
          <input
            type="text"
            name="batchNumber"
            placeholder="Vaccine batch number"
            className="w-full border rounded-md p-3 md:p-4 text-gray-700"
            onChange={handleChange}
            value={formData.batchNumber}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">
            Next Due Date
          </label>
          <input
            type="date"
            name="nextDueDate"
            className="w-full border rounded-md p-3 md:p-4 text-gray-700"
            onChange={handleChange}
            value={formData.nextDueDate}
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">
            Health Record <span className="text-red-500">*</span>
          </label>
          <select
            name="healthRecordId"
            className="w-full border rounded-md p-3 md:p-4 text-gray-700"
            onChange={handleChange}
            value={formData.healthRecordId}
            required
          >
            <option value="">Select Health Record</option>
            {healthRecords.map((record) => (
              <option key={record._id} value={record._id}>
                {record.diagnosis} -{" "}
                {new Date(record.date)
                  .toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  .replace(",", "")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">
            Notes
          </label>
          <textarea
            name="notes"
            placeholder="Additional notes about the vaccination"
            className="w-full border rounded-md p-3 md:p-4 text-gray-700 h-24"
            onChange={handleChange}
            value={formData.notes}
          ></textarea>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">
            Supporting Documents
          </label>
          <input
            type="file"
            name="supportingDocuments"
            multiple
            className="w-full border rounded-md p-3 md:p-4 text-gray-700"
            onChange={(e) =>
              setFormData({ ...formData, supportingDocuments: e.target.files })
            }
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 md:py-4 rounded-md text-lg font-semibold hover:bg-green-700"
        >
          Add Vaccination Record
        </button>
      </form>
    </div>
  );

  const renderVaccinationStatus = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-10">
      <h3 className="text-2xl font-bold text-green-600 mb-6">Vaccination Status</h3>
      
      {vaccinationStatus && (
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-2">Overall Progress</h4>
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${vaccinationStatus.completionPercentage}%` }}
                ></div>
              </div>
              <span className="font-semibold text-lg">
                {vaccinationStatus.completionPercentage}%
              </span>
            </div>
            <p className="text-gray-600 mt-2">
              {vaccinationStatus.completed} of {vaccinationStatus.totalMandatory} mandatory vaccinations completed
            </p>
          </div>

          {/* Individual Vaccination Status */}
          <div className="grid gap-4">
            <h4 className="text-lg font-semibold">Mandatory Vaccinations</h4>
            {vaccinationStatus.vaccinations.map((vaccination, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{vaccination.vaccineName}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    vaccination.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : vaccination.status === 'overdue'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {vaccination.status}
                  </span>
                </div>
                {vaccination.dateAdministered && (
                  <p className="text-sm text-gray-600 mt-1">
                    Last administered: {new Date(vaccination.dateAdministered).toLocaleDateString()}
                    {vaccination.dosageNumber && ` (Dose ${vaccination.dosageNumber})`}
                  </p>
                )}
                {vaccination.nextDueDate && (
                  <p className="text-sm text-gray-600">
                    Next due: {new Date(vaccination.nextDueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderVaccinationHistory = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 md:p-10">
      <h3 className="text-2xl font-bold text-green-600 mb-6">Vaccination History</h3>
      
      {vaccinationRecords.length === 0 ? (
        <p className="text-gray-600">No vaccination records found.</p>
      ) : (
        <div className="space-y-4">
          {vaccinationRecords.map((record) => (
            <div key={record.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{record.vaccineName}</h4>
                  <p className="text-gray-600">
                    Administered on: {new Date(record.dateAdministered).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    By: {record.administeredBy} at {record.facilityName}
                  </p>
                  {record.dosageNumber && (
                    <p className="text-gray-600">Dose: {record.dosageNumber}</p>
                  )}
                  {record.batchNumber && (
                    <p className="text-gray-600">Batch: {record.batchNumber}</p>
                  )}
                  {record.notes && (
                    <p className="text-gray-600 mt-2">Notes: {record.notes}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  record.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : record.status === 'overdue'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {record.status}
                </span>
              </div>
              
              {record.supportingDocuments && record.supportingDocuments.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Supporting Documents:</p>
                  <div className="flex flex-wrap gap-2">
                    {record.supportingDocuments.map((doc, index) => (
                      <a
                        key={index}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        Document {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-green-600 mb-6 md:mb-8 text-center">
          Vaccination Management
        </h2>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-lg p-2 flex space-x-2">
            <button
              className={`px-6 py-3 rounded-md font-semibold transition-colors ${
                activeTab === "add"
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("add")}
            >
              Add Record
            </button>
            <button
              className={`px-6 py-3 rounded-md font-semibold transition-colors ${
                activeTab === "status"
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("status")}
            >
              Status
            </button>
            <button
              className={`px-6 py-3 rounded-md font-semibold transition-colors ${
                activeTab === "history"
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "add" && renderAddForm()}
        {activeTab === "status" && renderVaccinationStatus()}
        {activeTab === "history" && renderVaccinationHistory()}
      </div>
    </div>
  );
};

export default VaccinationManager;