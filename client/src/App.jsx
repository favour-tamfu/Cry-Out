import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import { ShieldAlert, XCircle, CheckCircle, RotateCcw } from "lucide-react";
import CategorySelect from "./components/CategorySelect";
import ReportForm from "./components/ReportForm";
import ResponderLogin from "./components/ResponderLogin";
import AdminDashboard from "./components/AdminDashboard";

// --- THE VICTIM APP COMPONENT ---
function VictimApp() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quickExit = () => (window.location.href = "https://www.google.com");

  // Handle Form Submission
  const handleSubmit = async (e, locationData, policeConsent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = {
      category: selectedCategory,
      description: e.target.description.value,
      location: locationData || { lat: 0, lng: 0, address: "Not provided" },
      contactPolice: policeConsent, // Send the User's Choice
    };

    try {
      await axios.post("http://localhost:3001/api/reports", formData);
      setStep(3); // Move to success screen
    } catch (error) {
      console.error(error);
      alert("Failed to send report. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col relative">
        {/* Header */}
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-red-500" />
            <span className="font-bold text-lg tracking-wide">Cry-out</span>
          </div>
          <button
            onClick={quickExit}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-full flex items-center gap-1"
          >
            <XCircle size={14} /> QUICK EXIT
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 flex flex-col justify-center">
          {/* STEP 1: Categories */}
          {step === 1 && (
            <CategorySelect
              onSelect={(cat) => {
                setSelectedCategory(cat);
                setStep(2);
              }}
            />
          )}

          {/* STEP 2: Form */}
          {step === 2 && (
            <ReportForm
              selectedCategory={selectedCategory}
              onSubmit={handleSubmit}
              onBack={() => setStep(1)}
              isSubmitting={isSubmitting}
            />
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Report Sent</h2>
              <p className="text-gray-600 text-sm">
                Your report has been securely received.
              </p>

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

// --- THE MAIN ROUTER ---
function App() {
  const [org, setOrg] = useState(null); // Stores the logged-in organization

  return (
    <Routes>
      {/* Route 1: The Victim Interface (Home) */}
      <Route path="/" element={<VictimApp />} />

      {/* Route 2: The Responder Login */}
      <Route path="/admin-login" element={<ResponderLogin setOrg={setOrg} />} />

      {/* Route 3: The Dashboard (Protected) */}
      <Route path="/dashboard" element={<AdminDashboard org={org} />} />
    </Routes>
  );
}

export default App;
