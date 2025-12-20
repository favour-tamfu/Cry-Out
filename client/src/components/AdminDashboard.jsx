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
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSecureReports();
  }, [org, navigate]);

  // --- CLAIM FUNCTION ---
 const handleClaim = async (reportId) => {
   if (
     !window.confirm(
       "Are you sure you want to take responsibility for this case?"
     )
   )
     return;

   try {
     // 1. Make the API Call
     await axios.put(`http://localhost:3001/api/reports/${reportId}/claim`, {
       orgId: org._id,
       orgName: org.name,
     });

     // 2. Update the UI locally (No Reload!)
     setReports((prevReports) =>
       prevReports.map((report) => {
         if (report._id === reportId) {
           // If this is the report we just claimed, update its status manually
           return {
             ...report,
             status: "In Progress",
             assignedTo: {
               orgId: org._id,
               orgName: org.name,
               claimedAt: new Date().toISOString(),
             },
           };
         }
         return report; // Leave other reports alone
       })
     );
   } catch (err) {
     console.error(err);
     alert("Error claiming case. It might have been taken just now.");
   }
 };

  // --- MEDIA RENDERER ---
  const renderMedia = (url, index) => {
    // Check file extensions loosely (case insensitive)
    const isImage = /\.(jpeg|jpg|gif|png|webp)/i.test(url);
    const isVideo = /\.(mp4|webm|mov)/i.test(url);
    const isAudio = /\.(mp3|wav|m4a|ogg|opus)/i.test(url);

    if (isImage)
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
            className="h-24 w-24 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 rounded-lg transition-opacity">
            <ImageIcon className="text-white" size={20} />
          </div>
        </a>
      );
    if (isVideo)
      return (
        <div
          key={index}
          className="h-24 w-32 bg-black rounded-lg overflow-hidden border border-gray-300 relative"
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
          className="flex flex-col gap-1 bg-gray-100 p-2 rounded-lg w-full max-w-xs border border-gray-200"
        >
          <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase">
            <PlayCircle size={14} /> Audio Clip
          </div>
          <audio controls src={url} className="h-8 w-full" />
        </div>
      );
    // Fallback for docs/pdfs
    return (
      <a
        key={index}
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 text-blue-600 underline text-sm p-2 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100"
      >
        <FileText size={16} /> Attached File
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
            className={`bg-white p-6 rounded-xl shadow-sm border animate-slide-up ${
              report.status === "In Progress"
                ? "border-l-4 border-l-blue-500"
                : "border-slate-200"
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  report.category === "Domestic Violence"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {report.category}
              </span>
              <div className="text-right">
                <span className="flex items-center justify-end gap-1 text-xs text-gray-400">
                  <Clock size={12} />
                  {new Date(report.createdAt).toLocaleString()}
                </span>
                {report.status === "In Progress" && (
                  <span className="text-xs font-bold text-blue-600 block mt-1">
                    In Progress
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-800 font-medium mb-6 text-lg leading-relaxed border-l-4 border-gray-100 pl-4">
              "{report.description}"
            </p>

            {/* --- CONTACT DISPLAY SECTION --- */}
            {report.contactInfo && report.contactInfo.method !== "NONE" && (
              <div
                className={`mb-6 p-4 rounded-lg border ${
                  report.contactInfo.immediateHelp
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-100"
                }`}
              >
                <h3
                  className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${
                    report.contactInfo.immediateHelp
                      ? "text-red-700"
                      : "text-blue-700"
                  }`}
                >
                  {report.contactInfo.immediateHelp && (
                    <AlertTriangle size={14} className="animate-pulse" />
                  )}
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

                    {/* 1. IMMEDIATE */}
                    {report.contactInfo.immediateHelp ? (
                      <div className="flex flex-col">
                        <span className="text-red-600 font-black tracking-wide text-sm animate-pulse flex items-center gap-1">
                          <AlertTriangle size={14} /> ASAP (IMMEDIATE)
                        </span>
                        <span className="text-xs text-gray-400">
                          Submitted:{" "}
                          {new Date(report.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ) : (
                      /* 2. SCHEDULED TIME */
                      <span className="font-mono text-base font-medium text-blue-900">
                        {report.contactInfo.safeTime ? (
                          /* Create Date object and format it */
                          new Date(report.contactInfo.safeTime).toLocaleString(
                            [],
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        ) : (
                          <span className="text-gray-400 italic text-sm font-sans">
                            No time specified
                          </span>
                        )}
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
            {/* ------------------------------- */}

            {/* Evidence Vault */}
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
                    <MapPin size={16} /> GPS Location
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

              {/* Claim Logic */}
              {report.assignedTo && report.assignedTo.orgName ? (
                <div
                  className={`px-4 py-2 rounded-lg text-xs font-bold border flex items-center gap-2 ${
                    report.assignedTo.orgName === org.name
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
                >
                  {report.assignedTo.orgName === org.name ? (
                    <>
                      <ShieldCheck size={16} /> You claimed this
                    </>
                  ) : (
                    <>
                      <Lock size={14} /> Handled by {report.assignedTo.orgName}
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleClaim(report._id)}
                  className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-slate-700 shadow-md transition-all active:scale-95"
                >
                  <ShieldCheck size={16} /> Claim Case
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
