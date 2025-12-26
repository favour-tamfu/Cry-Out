import { useState } from "react";
import { Shield, Lock, AlertCircle, ArrowRight } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from '../config'; // (Check path based on file location)

export default function ResponderLogin({ setOrg }) {
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/api/login`, {
        accessCode,
      });
      setOrg(res.data);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      // Display specific backend error (e.g., "Account pending approval")
      setError(err.response?.data?.message || "Invalid Access Code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl w-full max-w-md text-center shadow-2xl animate-fade-in">
        <Shield size={50} className="mx-auto text-blue-900 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Responder Portal
        </h1>
        <p className="text-gray-500 mb-6">
          Enter your Organization Access Code
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Access Code..."
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg text-left">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white p-3 rounded-lg font-bold hover:bg-blue-800 transition-colors disabled:bg-gray-400"
          >
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>

        {/* --- REGISTER LINK --- */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => navigate("/register-org")}
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center justify-center gap-1 mx-auto"
          >
            Register New Organization <ArrowRight size={14} />
          </button>
        </div>
        {/* --------------------- */}

        <button
          onClick={() => navigate("/")}
          className="mt-4 text-xs text-gray-400 hover:text-gray-600"
        >
          ← Back to Public Site
        </button>

        <div className="mt-8 pt-4 border-t text-xs text-gray-400 text-left">
          <p>
            <strong>Demo Codes:</strong>
          </p>
          <p>
            👮 Police: <code>police123</code>
          </p>
          <p>
            🏠 Shelter: <code>safe123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
