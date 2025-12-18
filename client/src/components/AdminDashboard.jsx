import { useEffect, useState } from "react";
import axios from "axios";
import { MapPin, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard({ org }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Security Check: If not logged in, kick them out
    if (!org) {
      navigate("/admin-login");
      return;
    }

    const fetchSecureReports = async () => {
      try {
        // Fetch reports specifically for THIS Org ID
        const res = await axios.get(
          `http://localhost:3001/api/org-reports/${org._id}`
        );
        setReports(res.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSecureReports();
  }, [org, navigate]);

  if (!org) return null;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {org.type === "POLICE"
              ? "👮 Police Feed"
              : org.type === "SHELTER"
              ? "🏠 Shelter Feed"
              : "⛪ Community Feed"}
          </h1>
          <p className="text-sm text-slate-500">
            Logged in as: <span className="font-semibold">{org.name}</span>
          </p>
        </div>
        <button
          onClick={() => navigate("/admin-login")}
          className="text-sm bg-white border px-4 py-2 rounded-lg hover:bg-gray-50 text-red-600"
        >
          Log Out
        </button>
      </div>

      {reports.length === 0 && !loading && (
        <div className="bg-white p-10 rounded-xl text-center shadow-sm">
          <p className="text-gray-400 text-lg">
            No active reports found for your jurisdiction.
          </p>
          {org.type === "POLICE" && (
            <p className="text-xs text-gray-300 mt-2">
              (Remember: You only see incidents where victims consented to
              police contact)
            </p>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-4">
        {reports.map((report) => (
          <div
            key={report._id}
            className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 animate-slide-up"
          >
            <div className="flex justify-between items-start mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase 
                ${
                  report.category === "Domestic Violence"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {report.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock size={12} />
                {new Date(report.createdAt).toLocaleString()}
              </span>
            </div>

            <p className="text-gray-800 font-medium mb-4 text-lg">
              "{report.description}"
            </p>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={16} className="text-blue-500" />
                {report.location?.lat !== 0 ? (
                  <a
                    href={`https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-blue-600"
                  >
                    View Location
                  </a>
                ) : (
                  "No GPS Data"
                )}
              </div>

              {/* Police Specific Badge */}
              {report.contactPolice && (
                <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded border border-red-200 font-bold">
                  ⚠️ POLICE REQUESTED
                </span>
              )}

              <button className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700">
                <ShieldCheck size={16} />
                Intervene
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
