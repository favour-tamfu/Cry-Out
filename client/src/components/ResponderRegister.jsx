import { useState, useEffect } from "react";
import axios from "axios";
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Building,
  MapPin,
  Upload,
  X,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchableDropdown from "./SearchableDropdown";
import { API_URL } from '../config'; // (Check path based on file location)

export default function ResponderRegister() {
  const [formData, setFormData] = useState({
    name: "",
    type: "SHELTER",
    accessCode: "",
    country: "",
    region: "",
    city: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    registrationNumber: "",
    description: "",
  });

  // New States
  const [phoneCode, setPhoneCode] = useState("+237");
  const [countryList, setCountryList] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [docs, setDocs] = useState([]); // Store files here

  const [status, setStatus] = useState("IDLE");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get(
          "https://restcountries.com/v3.1/all?fields=name,idd,cca2"
        );
        const formatted = res.data
          .filter((c) => c.idd.root)
          .map((c) => ({
            name: c.name.common,
            dial_code: c.idd.root + (c.idd.suffixes ? c.idd.suffixes[0] : ""),
            code: c.cca2,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountryList(formatted);
        setLoadingCodes(false);
      } catch (err) {
        setCountryList([
          { name: "Cameroon", dial_code: "+237" },
          { name: "USA", dial_code: "+1" },
        ]);
        setLoadingCodes(false);
      }
    };
    fetchCountries();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // File Handler
  const handleDocChange = (e) => {
    if (e.target.files) {
      setDocs([...docs, ...Array.from(e.target.files)]);
    }
  };

  const removeDoc = (index) => setDocs(docs.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("LOADING");

    // Convert to FormData for File Upload
    const data = new FormData();
    // Append text fields
    Object.keys(formData).forEach((key) => {
      if (key === "contactPhone") {
        data.append(key, `${phoneCode} ${formData[key]}`);
      } else {
        data.append(key, formData[key]);
      }
    });

    // Append Files
    docs.forEach((file) => {
      data.append("documents", file);
    });

    // Log the data to see if it's empty
    for (let pair of data.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }

    try {
      await axios.post(`${API_URL}/api/register-org`, data);
      setStatus("SUCCESS");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Registration failed");
      setStatus("ERROR");
    }
  };

  if (status === "SUCCESS") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl w-full max-w-md text-center animate-fade-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Application Submitted
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            Your application and documents have been received.
            <br />
            We will review your credentials shortly.
          </p>
          <button
            onClick={() => navigate("/admin-login")}
            className="mt-6 w-full bg-slate-900 text-white py-3 rounded-lg font-bold"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden animate-slide-up">
        <div className="bg-blue-900 p-6 text-white text-center">
          <Shield size={40} className="mx-auto mb-2 opacity-80" />
          <h1 className="text-2xl font-bold">Partner Application</h1>
          <p className="text-blue-200 text-sm">Official Registration Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-900 uppercase border-b pb-2 flex items-center gap-2">
              <Building size={16} /> Organization Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Organization Name *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full p-2 border rounded"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Type *
                </label>
                <select
                  name="type"
                  className="w-full p-2 border rounded"
                  onChange={handleChange}
                >
                  <option value="SHELTER">Shelter / NGO</option>
                  <option value="POLICE">Law Enforcement</option>
                  <option value="MEDICAL">Hospital / Clinic</option>
                  <option value="LEGAL">Legal Aid</option>
                  <option value="COMMUNITY">Community Center</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Gov Registration ID
                </label>
                <input
                  name="registrationNumber"
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Required for verification"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Website
                </label>
                <input
                  name="website"
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="https://..."
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* DOCUMENT UPLOAD */}
            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
              <label className="flex flex-col items-center cursor-pointer">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-1">
                  <Upload size={16} /> Upload Credentials
                </div>
                <span className="text-xs text-gray-400">
                  Attach proof of registration, constitution, or ID (PDF/IMG)
                </span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  className="hidden"
                  onChange={handleDocChange}
                />
              </label>
              {docs.length > 0 && (
                <div className="mt-3 space-y-2">
                  {docs.map((file, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-white p-2 rounded border text-xs"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <FileText size={14} className="text-gray-400" />{" "}
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeDoc(i)}
                        className="text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">
                Mission / Description
              </label>
              <textarea
                name="description"
                rows="2"
                className="w-full p-2 border rounded text-sm"
                placeholder="Briefly describe your services..."
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-900 uppercase border-b pb-2 flex items-center gap-2">
              <MapPin size={16} /> Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Country *
                </label>
                <SearchableDropdown
                  options={countryList}
                  value={formData.country}
                  onChange={(val) => setFormData({ ...formData, country: val })}
                  placeholder={loadingCodes ? "Loading..." : "Select Country"}
                  returnField="name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Region *
                </label>
                <input
                  name="region"
                  type="text"
                  required
                  className="w-full p-2 border rounded"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  City *
                </label>
                <input
                  name="city"
                  type="text"
                  required
                  className="w-full p-2 border rounded"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Address
                </label>
                <input
                  name="address"
                  type="text"
                  className="w-full p-2 border rounded"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-900 uppercase border-b pb-2 flex items-center gap-2">
              <Shield size={16} /> Security & Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Official Email *
                </label>
                <input
                  name="contactEmail"
                  type="email"
                  required
                  className="w-full p-2 border rounded"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Emergency Phone *
                </label>
                <div className="flex gap-2">
                  <div className="w-24">
                    <SearchableDropdown
                      options={countryList}
                      value={phoneCode}
                      onChange={setPhoneCode}
                      placeholder="+..."
                      returnField="dial_code"
                    />
                  </div>
                  <input
                    name="contactPhone"
                    type="tel"
                    required
                    className="flex-1 p-2 border rounded"
                    placeholder="6..."
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Create Access Code *
                </label>
                <input
                  name="accessCode"
                  type="text"
                  required
                  className="w-full p-3 border rounded bg-blue-50 font-mono text-center tracking-widest font-bold"
                  placeholder="SECRET-CODE"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {status === "ERROR" && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin-login")}
              className="flex-1 border py-3 rounded-lg font-bold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status === "LOADING"}
              className="flex-[2] bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {status === "LOADING"
                ? "Submitting Application..."
                : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
