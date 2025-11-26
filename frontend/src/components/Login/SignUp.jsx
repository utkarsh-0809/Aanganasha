import React, { useContext, useState } from "react";
import { api } from "../../axios.config.js";
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const { login } = useContext(UserContext);
  const [role, setRole] = useState("aanganwadi_staff");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("Male");
  const [extra, setExtra] = useState("");
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [aanganwadiCode, setAanganwadiCode] = useState("");
  const [aanganwadiCodeStatus, setAanganwadiCodeStatus] = useState(""); // "", "validating", "valid", "invalid"
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Validate aanganwadi code
  const validateAanganwadiCode = async (code) => {
    if (!code || code.length === 0) {
      setAanganwadiCodeStatus("");
      return;
    }
    
    setAanganwadiCodeStatus("validating");
    try {
      const response = await api.get(`aanganwadi/verify/${code.toUpperCase()}`);
      if (response.status === 200) {
        setAanganwadiCodeStatus("valid");
      }
    } catch (error) {
      setAanganwadiCodeStatus("invalid");
      console.log("Aanganwadi code validation error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset any previous error

    const formData = { role, name, email, password, phone, dateOfBirth, gender };
    
    // Add role-specific fields
    if (role === "doctor") {
      formData.specialization = extra;
      formData.isVolunteer = isVolunteer;
    } else if (role === "aanganwadi_staff") {
      if (!aanganwadiCode) {
        setError("Aanganwadi code is required for staff registration");
        return;
      }
      if (aanganwadiCodeStatus !== "valid") {
        setError("Please enter a valid Aanganwadi code");
        return;
      }
      formData.aanganwadiCode = aanganwadiCode;
    } else if (role === "coordinator") {
      // Coordinators will be assigned aanganwadis later by admin
    }

    try {
      const response = await api.post(
        "user/signup",
        formData,
        { withCredentials: true } // If needed for cookies
      );

      if (response.status === 201) {
        // You might want to automatically log the user in here
        // However, typically after signup, users are redirected to login
        // If you want to auto-login, uncomment the following lines
        // const userData = response.data;
        // login(userData);

        navigate ( "/login"); // Redirect to login page
      }
    } catch (error) {
      if (error.response) {
        console.log("Error Response Data:", error.response.data);
        console.log("Error Response Status:", error.response.status);
        console.log("Error Response Headers:", error.response.headers);
        setError(error.response.data.message || "Signup failed");
      } else if (error.request) {
        console.log("Error Request:", error.request);
      } else {
        console.log("Error Message:", error.message);
      }
      console.log("Error Config:", error.config);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="bg-white p-12 rounded-xl shadow-lg max-w-4xl w-full flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 h-full flex-col object-cover flex justify-center">
          <h1 className="text-6xl flex-row mb-48 text-center">Sign Up</h1>
          <img src="../src/assets/sign up page.png" alt="Sign Up Illustration" className="w-full h-full object-cover max-w-md" />
        </div>

        <div className="w-full md:w-1/2 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              {["aanganwadi_staff", "coordinator", "doctor"].map((r) => (
                <label key={r} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="role"
                    checked={role === r}
                    onChange={() => setRole(r)}
                    className="form-radio text-green-500"
                  />
                  <span className="capitalize">{r.replace('_', ' ')}</span>
                </label>
              ))}
            </div>

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 border rounded-lg focus:ring focus:ring-green-300"
              required
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border rounded-lg focus:ring focus:ring-green-300"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border rounded-lg focus:ring focus:ring-green-300"
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-4 border rounded-lg focus:ring focus:ring-green-300"
            />
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full p-4 border rounded-lg focus:ring focus:ring-green-300"
            />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-4 border rounded-lg focus:ring focus:ring-green-300"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {role === "doctor" && (
              <input
                type="text"
                placeholder="Medical Specialization"
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                className="w-full p-4 border rounded-lg focus:ring focus:ring-green-300"
                required
              />
            )}
            {role === "doctor" && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isVolunteer}
                  onChange={(e) => setIsVolunteer(e.target.checked)}
                  className="form-checkbox text-green-500"
                />
                <span className="text-gray-700">I want to volunteer for Aanganwadi health checkups</span>
              </label>
            )}
            {role === "aanganwadi_staff" && (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Aanganwadi Code (provided by coordinator)"
                    value={aanganwadiCode}
                    onChange={(e) => {
                      const code = e.target.value.toUpperCase();
                      setAanganwadiCode(code);
                      validateAanganwadiCode(code);
                    }}
                    className={`w-full p-4 border rounded-lg focus:ring focus:ring-green-300 ${
                      aanganwadiCodeStatus === "valid" ? "border-green-500" : 
                      aanganwadiCodeStatus === "invalid" ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {aanganwadiCodeStatus === "validating" && (
                    <div className="absolute right-3 top-4 text-blue-500">
                      <span className="text-sm">Validating...</span>
                    </div>
                  )}
                  {aanganwadiCodeStatus === "valid" && (
                    <div className="absolute right-3 top-4 text-green-500">
                      ✓
                    </div>
                  )}
                  {aanganwadiCodeStatus === "invalid" && (
                    <div className="absolute right-3 top-4 text-red-500">
                      ✗
                    </div>
                  )}
                </div>
                {aanganwadiCodeStatus === "invalid" && (
                  <div className="text-red-500 text-sm">
                    Invalid Aanganwadi code. Please verify with your coordinator.
                  </div>
                )}
                {aanganwadiCodeStatus === "valid" && (
                  <div className="text-green-600 text-sm">
                    ✓ Valid Aanganwadi code
                  </div>
                )}
                <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
                  <strong>Note:</strong> Enter the Aanganwadi code provided by your coordinator. Your Staff ID will be automatically generated.
                </div>
              </div>
            )}
            {role === "coordinator" && (
              <div className="text-sm text-gray-600 p-3 bg-green-50 rounded-lg">
                <strong>Note:</strong> You will be assigned aanganwadis to coordinate after registration approval.
              </div>
            )}
            {error && (
              <div className="text-red-500">{error}</div>
            )}
            <button type="submit" className="w-full mt-4 p-4 bg-black text-white rounded-lg hover:bg-gray-800">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
