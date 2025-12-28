import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import {
  ShieldAlert,
  XCircle,
  CheckCircle,
  RotateCcw,
  Globe,
} from "lucide-react";
import CategorySelect from "./components/CategorySelect";
import ReportForm from "./components/ReportForm";
import ResponderLogin from "./components/ResponderLogin";
import ResponderRegister from "./components/ResponderRegister";
import AdminDashboard from "./components/AdminDashboard";
import SafetyAdvisor from "./components/SafetyAdvisor";
import SuperAdmin from "./components/SuperAdmin";
import { API_URL } from "./config";

function VictimApp() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GLOBAL LANGUAGE STATE
  const [lang, setLang] = useState("en");

  const quickExit = () => (window.location.href = "https://www.google.com");

  const handleSubmit = async (
    e,
    locationData,
    policeConsent,
    files,
    contactData
  ) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("category", selectedCategory);
    formData.append("description", e.target.description.value);
    formData.append("contactPolice", policeConsent);
    formData.append(
      "location",
      JSON.stringify(
        locationData || { lat: 0, lng: 0, address: "Not provided" }
      )
    );
    formData.append("contactInfo", JSON.stringify(contactData || {}));

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++)
        formData.append("evidence", files[i]);
    }

    try {
      await axios.post(`${API_URL}/api/reports`, formData);
      setStep(3);
    } catch (error) {
      console.error(error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to send report.";
      alert(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col relative">
        {/* HEADER */}
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-red-500" />
            <span className="font-bold text-lg tracking-wide">Cry-out</span>
          </div>

          <div className="flex gap-2">
            {/* LANGUAGE TOGGLE */}
            <button
              onClick={() => setLang(lang === "en" ? "fr" : "en")}
              className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-3 py-2 rounded-full border border-slate-700 transition-colors flex items-center gap-1"
            >
              <Globe size={14} /> {lang === "en" ? "FR" : "EN"}
            </button>

            {/* EXIT BUTTON */}
            <button
              onClick={quickExit}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-full flex items-center gap-1 shadow-lg shadow-red-900/20"
            >
              <XCircle size={14} /> EXIT
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col justify-center">
          {step === 1 && (
            <CategorySelect
              onSelect={(cat) => {
                setSelectedCategory(cat);
                setStep(2);
              }}
              lang={lang}
              setLang={setLang}
            />
          )}
          {step === 2 && (
            <ReportForm
              selectedCategory={selectedCategory}
              onSubmit={handleSubmit}
              onBack={() => setStep(1)}
              isSubmitting={isSubmitting}
              lang={lang}
              setLang={setLang}
            />
          )}
          {step === 3 && (
            <div className="text-center space-y-4 animate-fade-in pb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Report Secured
                </h2>
                <p className="text-gray-500 text-sm">
                  Responders have been notified.
                </p>
              </div>
              <SafetyAdvisor category={selectedCategory} />
              <div className="pt-4 space-y-3">
                <button
                  onClick={quickExit}
                  className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900"
                >
                  Close & Leave Site
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setSelectedCategory(null);
                  }}
                  className="w-full bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={16} /> New Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [org, setOrg] = useState(null);

  return (
    <Routes>
      <Route path="/" element={<VictimApp />} />
      <Route path="/admin-login" element={<ResponderLogin setOrg={setOrg} />} />
      <Route path="/register-org" element={<ResponderRegister />} />
      <Route path="/dashboard" element={<AdminDashboard org={org} />} />
      <Route path="/super-admin" element={<SuperAdmin />} />
    </Routes>
  );
}

export default App;
