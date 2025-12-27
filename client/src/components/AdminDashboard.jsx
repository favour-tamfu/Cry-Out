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
  Lock,
  Siren,
  ArrowUpCircle,
  Check,
  X,
  Upload,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

export default function AdminDashboard({ org }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("FEED"); // 'FEED' or 'MY_CASES'

  // Resolution Modal State
  const [resolveModal, setResolveModal] = useState(null); // Stores ID of report being resolved
  const [resFiles, setResFiles] = useState([]);
  const [resNotes, setResNotes] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!org) {
      navigate("/admin-login");
      return;
    }
    fetchData();
  }, [org, navigate]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/org-reports/${org._id}`);
      // Sort: Priority first, then newest
      const sorted = res.data.sort((a, b) => {
        if (a.isPriority === b.isPriority)
          return new Date(b.createdAt) - new Date(a.createdAt);
        return a.isPriority ? -1 : 1;
      });
      setReports(sorted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---
  const handleClaim = async (id) => {
    if (!confirm("Claim this case?")) return;
    await axios.put(`${API_URL}/api/reports/${id}/claim`, {
      orgId: org._id,
      orgName: org.name,
    });
    fetchData();
  };

  const handleEscalate = async (id) => {
    if (!confirm("Escalate to Super Admin?")) return;
    await axios.put(`${API_URL}/api/reports/${id}/escalate`);
    fetchData();
  };

 const handlePolice = async (id) => {
   if (
     !confirm(
       "Request Police Intervention? This will escalate the case to the Super Admin for assignment."
     )
   )
     return;
   await axios.put(`${API_URL}/api/reports/${id}/escalate`);
   alert("Request sent to Super Admin.");
   fetchData();
 };

  const submitResolution = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("orgName", org.name);
    formData.append("notes", resNotes);
    for (let i = 0; i < resFiles.length; i++)
      formData.append("proof", resFiles[i]);

    try {
      await axios.post(
        `${API_URL}/api/reports/${resolveModal}/resolve`,
        formData
      );
      setResolveModal(null);
      setResFiles([]);
      setResNotes("");
      fetchData();
      alert("Case Resolved.");
    } catch (err) {
      alert("Error resolving case.");
    }
  };

  // --- MEDIA RENDERER ---
  const renderMedia = (url, index) => {
    const isImage = /\.(jpeg|jpg|gif|png|webp)/i.test(url);
    const isVideo = /\.(mp4|webm|mov)/i.test(url);
    const isAudio = /\.(mp3|wav|m4a|ogg|opus)/i.test(url);

    if (isImage)
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          className="block group relative"
        >
          <img
            src={url}
            className="h-20 w-20 object-cover rounded-lg border hover:opacity-90"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 rounded-lg">
            <ImageIcon className="text-white" size={20} />
          </div>
        </a>
      );
    if (isVideo)
      return (
        <div
          key={index}
          className="h-20 w-32 bg-black rounded-lg overflow-hidden border"
        >
          <video controls className="w-full h-full">
            <source src={url} />
          </video>
        </div>
      );
    if (isAudio)
      return (
        <div
          key={index}
          className="flex flex-col gap-1 bg-gray-100 p-2 rounded-lg w-full max-w-xs border"
        >
          <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase">
            <PlayCircle size={14} /> Audio
          </div>
          <audio controls src={url} className="h-6 w-full" />
        </div>
      );
    return (
      <a
        key={index}
        href={url}
        target="_blank"
        className="flex items-center gap-2 text-blue-600 underline text-sm p-2 bg-blue-50 rounded-lg border"
      >
        <FileText size={16} /> File
      </a>
    );
  };

  // Filter Views
  const activeReports = reports.filter((r) => r.status !== "Resolved");
  const myCases = activeReports.filter((r) => r.assignedTo?.orgId === org._id);
  const feedCases = activeReports.filter((r) => !r.assignedTo?.orgId);
  const displayedReports = view === "MY_CASES" ? myCases : feedCases;

  if (!org) return null;

  return (
    <div className="min-h-screen bg-slate-100 p-6 relative">
      {/* --- RESOLUTION MODAL --- */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-up">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Check size={20} className="text-green-600" /> Close Case
              </h3>
              <button
                onClick={() => setResolveModal(null)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={submitResolution} className="space-y-4">
              {/* Notes Field */}
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Resolution Notes
                </label>
                <textarea
                  className="w-full p-3 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none resize-none"
                  rows="4"
                  placeholder="Describe how the case was resolved..."
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* Improved File Uploader */}
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  Evidence of Resolution
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all relative group">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.png,.mp3"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => setResFiles(e.target.files)}
                  />
                  <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-blue-500 transition-colors">
                    <Upload size={24} />
                    {resFiles && resFiles.length > 0 ? (
                      <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                        {resFiles.length} file(s) selected
                      </span>
                    ) : (
                      <span className="text-xs font-bold">
                        Click or Drag files to attach proof
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg flex justify-center gap-2 transition-transform active:scale-95"
              >
                <CheckCircle size={18} /> Confirm Resolution
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {org.type === "POLICE"
                ? "👮 Police Dashboard"
                : "🏠 Responder Dashboard"}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {org.name} <span className="mx-2">•</span> {org.city},{" "}
              {org.country}
            </p>
          </div>
          <button
            onClick={() => navigate("/admin-login")}
            className="text-sm text-red-600 font-bold border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50"
          >
            Log Out
          </button>
        </div>

        {/* --- TABS --- */}
        <div className="flex gap-2">
          <button
            onClick={() => setView("FEED")}
            className={`flex-1 py-3 font-bold text-sm rounded-t-lg transition-colors border-b-2 ${
              view === "FEED"
                ? "bg-white text-blue-600 border-blue-600 shadow-sm"
                : "bg-slate-200 text-gray-500 border-transparent hover:bg-slate-300"
            }`}
          >
            Live Feed ({feedCases.length})
          </button>
          <button
            onClick={() => setView("MY_CASES")}
            className={`flex-1 py-3 font-bold text-sm rounded-t-lg transition-colors border-b-2 ${
              view === "MY_CASES"
                ? "bg-white text-blue-600 border-blue-600 shadow-sm"
                : "bg-slate-200 text-gray-500 border-transparent hover:bg-slate-300"
            }`}
          >
            My Cases ({myCases.length})
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-5xl mx-auto space-y-6">
        {displayedReports.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
            No active cases in this view.
          </div>
        ) : (
          displayedReports.map((report) => (
            <div
              key={report._id}
              className={`bg-white p-6 rounded-xl shadow-sm border animate-slide-up ${
                report.isPriority
                  ? "border-red-400 ring-2 ring-red-100"
                  : "border-slate-200"
              }`}
            >
              {/* BANNERS */}
              <div className="flex flex-wrap gap-2 mb-4">
                {report.isPriority && (
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                    ⚠️ PRIORITY
                  </span>
                )}
                {report.isEscalated && (
                  <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                    ⚡ ESCALATED
                  </span>
                )}
                <span
                  className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                    report.category === "Domestic Violence"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {report.category}
                </span>
                <span className="ml-auto text-xs text-gray-400 font-mono flex items-center gap-1">
                  <Clock size={12} />{" "}
                  {new Date(report.createdAt).toLocaleString()}
                </span>
              </div>

              {/* DESCRIPTION */}
              <p className="text-gray-800 font-medium mb-6 text-lg leading-relaxed border-l-4 border-gray-200 pl-4">
                "{report.description}"
              </p>

              {/* CONTACT INFO (Rich UI) */}
              {report.contactInfo && report.contactInfo.method !== "NONE" && (
                <div
                  className={`mb-6 p-4 rounded-lg border ${
                    report.contactInfo.immediateHelp
                      ? "bg-red-50 border-red-200"
                      : "bg-blue-50 border-blue-100"
                  }`}
                >
                  <h3
                    className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${
                      report.contactInfo.immediateHelp
                        ? "text-red-700"
                        : "text-blue-700"
                    }`}
                  >
                    {report.contactInfo.immediateHelp && (
                      <AlertTriangle size={14} className="animate-pulse" />
                    )}{" "}
                    Contact Request
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm text-gray-700">
                    <div>
                      <span className="font-bold text-gray-500 text-xs block">
                        METHOD
                      </span>
                      <span className="font-mono text-base">
                        {report.contactInfo.method}: {report.contactInfo.value}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500 text-xs block">
                        PREFERRED TIME
                      </span>
                      {report.contactInfo.immediateHelp ? (
                        <span className="text-red-600 font-black tracking-wide text-sm">
                          🚨 ASAP (IMMEDIATE)
                        </span>
                      ) : (
                        <span className="font-mono text-base">
                          {report.contactInfo.safeTime
                            ? new Date(
                                report.contactInfo.safeTime
                              ).toLocaleString()
                            : "No time specified"}
                        </span>
                      )}
                    </div>
                    {report.contactInfo.method === "PHONE" && (
                      <div className="col-span-2 mt-1">
                        <span className="font-bold text-gray-500 text-xs mr-2">
                          VOICEMAIL SAFE?
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            report.contactInfo.safeToVoicemail
                              ? "bg-green-200 text-green-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {report.contactInfo.safeToVoicemail ? "YES" : "NO"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* EVIDENCE VAULT */}
              {report.media.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ImageIcon size={14} /> Evidence Vault (
                    {report.media.length})
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {report.media.map((url, i) => renderMedia(url, i))}
                  </div>
                </div>
              )}

              {/* FOOTER ACTIONS */}
              <div className="flex flex-wrap justify-between items-center pt-4 border-t border-gray-100 gap-3">
                <div className="flex items-center gap-3">
                  {report.location?.lat !== 0 ? (
                    <a
                      href={`https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`}
                      target="_blank"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:underline font-bold"
                    >
                      <MapPin size={16} /> GPS Location
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm flex gap-1">
                      <MapPin size={16} /> No GPS
                    </span>
                  )}
                  {report.contactPolice && (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded font-bold flex items-center gap-1 border border-red-200">
                      <Siren size={12} /> POLICE ALERTED
                    </span>
                  )}
                </div>

                {view === "FEED" ? (
                  <button
                    onClick={() => handleClaim(report._id)}
                    className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-700 shadow-md"
                  >
                    Claim Case
                  </button>
                ) : (
                  <div className="flex gap-2">
                    {!report.isEscalated && (
                      <button
                        onClick={() => handleEscalate(report._id)}
                        className="border border-purple-500 text-purple-600 px-3 py-1 rounded text-xs font-bold hover:bg-purple-50 flex items-center gap-1"
                      >
                        <ArrowUpCircle size={14} /> Escalate
                      </button>
                    )}
                    {!report.contactPolice && (
                      <button
                        onClick={() => handlePolice(report._id)}
                        className="border border-red-500 text-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-50 flex items-center gap-1"
                      >
                        <Siren size={14} /> Notify Police
                      </button>
                    )}
                    <button
                      onClick={() => setResolveModal(report._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-green-700 flex items-center gap-1 shadow-md"
                    >
                      <Check size={14} /> Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
