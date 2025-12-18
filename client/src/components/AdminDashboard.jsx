import { useEffect, useState } from "react";
import axios from "axios";
import {
  MapPin,
  Clock,
  AlertTriangle,
  ShieldCheck,
  FileText,
  ImageIcon,
  PlayCircle,
  Video,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard({ org }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!org) {
      navigate("/admin-login");
      return;
    }

    const fetchSecureReports = async () => {
      try {
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

  // Logic to decide if it's an Image, Audio, or Video based on the URL text
  const renderMedia = (url, index) => {
    // Check file extensions loosely (case insensitive)
    const isImage = /\.(jpeg|jpg|gif|png|webp)/i.test(url);
    const isVideo = /\.(mp4|webm|mov)/i.test(url);
    const isAudio = /\.(mp3|wav|m4a)/i.test(url);

    if (isImage) {
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block group relative"
        >
          <img
            src={url}
            alt="Evidence"
            className="h-32 w-32 object-cover rounded-lg border border-gray-200 group-hover:opacity-90 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 rounded-lg transition-opacity">
            <ImageIcon className="text-white" size={20} />
          </div>
        </a>
      );
    }
    if (isVideo) {
      return (
        <div
          key={index}
          className="relative h-32 w-48 bg-black rounded-lg overflow-hidden border border-gray-300"
        >
          <video controls className="w-full h-full">
            <source src={url} />
          </video>
        </div>
      );
    }
    if (isAudio) {
      return (
        <div
          key={index}
          className="flex flex-col gap-1 bg-gray-100 p-2 rounded-lg w-full max-w-xs border border-gray-200"
        >
          <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase">
            <PlayCircle size={14} /> Audio Clip
          </div>
          <audio controls src={url} className="h-8 w-full" />
        </div>
      );
    }
    // Fallback for unknown files
    return (
      <a
        key={index}
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 text-blue-600 underline text-sm p-2 bg-blue-50 rounded-lg border border-blue-100"
      >
        <FileText size={16} /> View Attached File
      </a>
    );
  };

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
            Jurisdiction: <span className="font-semibold">{org.name}</span>
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
          <p className="text-gray-400 text-lg">No active reports found.</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {reports.map((report) => (
          <div
            key={report._id}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-slide-up"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
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

            {/* Description */}
            <p className="text-gray-800 font-medium mb-6 text-lg leading-relaxed border-l-4 border-gray-200 pl-4">
              "{report.description}"
            </p>

            {/* --- EVIDENCE VAULT (RENDERS PHOTOS/AUDIO) --- */}
            {report.media && report.media.length > 0 && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ImageIcon size={14} /> Evidence Vault ({report.media.length})
                </h3>
                <div className="flex flex-wrap gap-3">
                  {report.media.map((url, idx) => renderMedia(url, idx))}
                </div>
              </div>
            )}
            {/* --------------------------------------------- */}

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                {report.location?.lat !== 0 ? (
                  <a
                    href={`https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium"
                  >
                    <MapPin size={16} /> View GPS Location
                  </a>
                ) : (
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <MapPin size={16} /> No GPS
                  </span>
                )}

                {report.contactPolice && (
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded border border-red-200 font-bold flex items-center gap-1">
                    <AlertTriangle size={12} /> POLICE REQUESTED
                  </span>
                )}
              </div>

              <button className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 shadow-md">
                <ShieldCheck size={16} />
                Claim Case
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
