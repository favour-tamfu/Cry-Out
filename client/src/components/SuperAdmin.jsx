import { useEffect, useState } from "react";
import axios from "axios";
import {
  Shield,
  Building,
  MapPin,
  Globe,
  Phone,
  Mail,
  FileText,
  Download,
  Clock,
  AlertTriangle,
  Edit,
  Save,
  Trash2,
  CheckCircle,
  XCircle,
  Filter,
  LayoutGrid,
  List,
  ArrowRightCircle,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { API_URL } from "../config";
import ReportHeatmap from "./ReportHeatmap";

export default function SuperAdmin() {
  // Data State
  const [allOrgs, setAllOrgs] = useState([]);
  const [allReports, setAllReports] = useState([]);

  // UI State
  const [mainView, setMainView] = useState("ORGS"); // 'ORGS', 'CASES', 'ANALYTICS'
  const [orgFilter, setOrgFilter] = useState("PENDING");
  const [caseFilter, setCaseFilter] = useState("ESCALATED");
  const [selectedOrgId, setSelectedOrgId] = useState("ALL");

  // Editing State
  const [editingId, setEditingId] = useState(null);
  const [editCats, setEditCats] = useState([]);
  const [assignmentSelections, setAssignmentSelections] = useState({});
  const [auth, setAuth] = useState(false);

  const ALL_CATEGORIES = [
    "Domestic Violence",
    "Sexual Assault",
    "Physical Abuse",
    "Stalking",
    "Other",
  ];

  const fetchData = async () => {
    try {
      const [orgRes, caseRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/orgs`),
        axios.get(`${API_URL}/api/admin/all-reports`),
      ]);
      setAllOrgs(orgRes.data);
      setAllReports(caseRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const password = prompt("Enter Super Admin Password:");
    if (password === "master123") {
      setAuth(true);
      fetchData();
    } else {
      window.location.href = "/";
    }
  }, []);

  // --- ACTIONS ---
  const updateStatus = async (id, status) => {
    if (!confirm(`Mark as ${status}?`)) return;
    await axios.put(`${API_URL}/api/admin/update-status/${id}`, { status });
    fetchData();
  };

  const deleteOrg = async (id) => {
    if (!confirm("PERMANENTLY DELETE?")) return;
    await axios.delete(`${API_URL}/api/admin/delete-org/${id}`);
    fetchData();
  };

  const startEditing = (org) => {
    setEditingId(org._id);
    setEditCats(org.allowedCategories || []);
  };
  const toggleCat = (cat) => {
    editCats.includes(cat)
      ? setEditCats(editCats.filter((c) => c !== cat))
      : setEditCats([...editCats, cat]);
  };
  const saveCategories = async (id) => {
    await axios.put(`${API_URL}/api/admin/update-categories/${id}`, {
      categories: editCats,
    });
    setEditingId(null);
    fetchData();
  };

  const togglePriority = async (id) => {
    await axios.put(`${API_URL}/api/admin/mark-priority/${id}`);
    fetchData();
  };
  const revokeClaim = async (id) => {
    if (!confirm("Force unclaim?")) return;
    await axios.put(`${API_URL}/api/admin/unclaim-report/${id}`);
    fetchData();
  };

  const handleAssign = async (reportId) => {
    const orgId = assignmentSelections[reportId];
    if (!orgId) return alert("Select an organization first.");
    const selectedOrg = allOrgs.find((o) => o._id === orgId);
    if (!confirm(`Assign to ${selectedOrg.name}?`)) return;
    await axios.put(`${API_URL}/api/admin/assign-report/${reportId}`, {
      orgId: selectedOrg._id,
      orgName: selectedOrg.name,
      isPolice: selectedOrg.type === "POLICE",
    });
    alert("Assigned.");
    fetchData();
  };

  const getDuration = (dateString) => {
    if (!dateString) return "N/A";
    const diff = new Date() - new Date(dateString);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days > 0
      ? `${days} days`
      : `${Math.floor(diff / (1000 * 60 * 60))} hours`;
  };

  if (!auth) return null;

  // --- FILTERS ---
  const displayedOrgs = allOrgs.filter((o) => o.status === orgFilter);
  let displayedCases = allReports;
  if (caseFilter === "ESCALATED")
    displayedCases = allReports.filter(
      (r) => r.isEscalated && r.status !== "Resolved"
    );
  if (caseFilter === "UNCLAIMED")
    displayedCases = allReports.filter((r) => r.status === "Pending");
  if (caseFilter === "ACTIVE")
    displayedCases = allReports.filter((r) => r.status === "In Progress");
  if (caseFilter === "RESOLVED")
    displayedCases = allReports.filter((r) => r.status === "Resolved");
  if (selectedOrgId !== "ALL")
    displayedCases = displayedCases.filter(
      (r) =>
        r.assignedTo?.orgId === selectedOrgId ||
        r.resolution?.resolvedBy ===
          allOrgs.find((o) => o._id === selectedOrgId)?.name
    );

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white font-sans">
      <div className="max-w-7xl mx-auto">
        {/* HEADER & NAV */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-6 border-b border-gray-800 gap-4">
          <div className="flex items-center gap-3">
            <Shield size={40} className="text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                System Control
              </h1>
              <p className="text-slate-400 text-sm">Super Admin Console</p>
            </div>
          </div>
          <div className="bg-slate-800 p-1 rounded-lg flex">
            <button
              onClick={() => setMainView("ORGS")}
              className={`px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2 ${
                mainView === "ORGS"
                  ? "bg-blue-600 shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Building size={16} /> Orgs
            </button>
            <button
              onClick={() => setMainView("CASES")}
              className={`px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2 ${
                mainView === "CASES"
                  ? "bg-blue-600 shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <LayoutGrid size={16} /> Cases
            </button>
            <button
              onClick={() => setMainView("ANALYTICS")}
              className={`px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2 ${
                mainView === "ANALYTICS"
                  ? "bg-blue-600 shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <BarChart3 size={16} /> Analytics
            </button>
          </div>
        </div>

        {/* ======================= ORGANIZATION VIEW ======================= */}
        {mainView === "ORGS" && (
          <div className="space-y-6">
            <div className="flex gap-4 mb-6">
              {["PENDING", "APPROVED", "REJECTED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setOrgFilter(status)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
                    orgFilter === status
                      ? "bg-slate-800 border-blue-500 text-blue-400"
                      : "border-gray-700 text-gray-500 hover:border-gray-500"
                  }`}
                >
                  {status} ({allOrgs.filter((o) => o.status === status).length})
                </button>
              ))}
            </div>
            <div className="grid gap-6">
              {displayedOrgs.length === 0 && (
                <p className="text-gray-500 italic">No organizations found.</p>
              )}
              {displayedOrgs.map((org) => (
                <div
                  key={org._id}
                  className={`bg-slate-800 rounded-xl p-6 border ${
                    org.status === "PENDING"
                      ? "border-orange-500/50"
                      : "border-gray-700"
                  } flex flex-col lg:flex-row gap-6`}
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold text-black uppercase ${
                          org.type === "POLICE"
                            ? "bg-blue-400"
                            : "bg-orange-400"
                        }`}
                      >
                        {org.type}
                      </span>
                      <h3 className="text-xl font-bold">{org.name}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-400">
                      <p className="flex items-center gap-2">
                        <MapPin size={14} /> {org.city}, {org.country}
                      </p>
                      <p className="flex items-center gap-2">
                        <Building size={14} /> Reg:{" "}
                        {org.registrationNumber || "N/A"}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail size={14} /> {org.contactEmail}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone size={14} /> {org.contactPhone}
                      </p>
                    </div>
                    {org.documents.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {org.documents.map((doc, i) => (
                          <a
                            key={i}
                            href={doc}
                            target="_blank"
                            className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-3 py-1 rounded text-xs text-blue-400 hover:text-blue-300"
                          >
                            <FileText size={10} /> Doc {i + 1}{" "}
                            <Download size={10} />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="lg:w-1/3 bg-black/20 rounded-lg p-4 border border-gray-700/50">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase">
                        Access Rights
                      </h4>
                      {editingId !== org._id && (
                        <button
                          onClick={() => startEditing(org)}
                          className="text-blue-400 hover:text-white"
                        >
                          <Edit size={14} />
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {ALL_CATEGORIES.map((cat) => (
                        <label
                          key={cat}
                          className={`flex items-center gap-2 text-xs ${
                            editingId !== org._id
                              ? "opacity-70"
                              : "cursor-pointer"
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={editingId !== org._id}
                            checked={
                              editingId === org._id
                                ? editCats.includes(cat)
                                : org.allowedCategories.includes(cat)
                            }
                            onChange={() => toggleCat(cat)}
                            className="rounded bg-slate-700 border-gray-600 accent-blue-500"
                          />
                          <span
                            className={
                              org.allowedCategories.includes(cat)
                                ? "text-blue-200"
                                : "text-gray-500"
                            }
                          >
                            {cat}
                          </span>
                        </label>
                      ))}
                    </div>
                    {editingId === org._id && (
                      <button
                        onClick={() => saveCategories(org._id)}
                        className="mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white py-1 rounded text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <Save size={12} /> Save Changes
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 justify-center shrink-0 min-w-[120px]">
                    {org.status === "PENDING" ? (
                      <>
                        <button
                          onClick={() => updateStatus(org._id, "APPROVED")}
                          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold text-sm flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          onClick={() => updateStatus(org._id, "REJECTED")}
                          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded font-bold text-sm flex items-center justify-center gap-2"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            updateStatus(
                              org._id,
                              org.status === "APPROVED"
                                ? "REJECTED"
                                : "APPROVED"
                            )
                          }
                          className={`px-4 py-2 rounded font-bold text-sm ${
                            org.status === "APPROVED"
                              ? "bg-orange-600 hover:bg-orange-500"
                              : "bg-green-600 hover:bg-green-500"
                          }`}
                        >
                          {org.status === "APPROVED"
                            ? "Suspend"
                            : "Re-Activate"}
                        </button>
                        <button
                          onClick={() => deleteOrg(org._id)}
                          className="text-red-500 text-xs hover:text-red-300 flex items-center justify-center gap-1 mt-2"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= CASES VIEW ======================= */}
        {mainView === "CASES" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-slate-800 p-4 rounded-xl border border-gray-700">
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {["ESCALATED", "UNCLAIMED", "ACTIVE", "RESOLVED"].map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setCaseFilter(filter)}
                      className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-colors ${
                        caseFilter === filter
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-gray-400 hover:bg-slate-600"
                      }`}
                    >
                      {filter} (
                      {
                        allReports.filter((r) => {
                          if (filter === "ESCALATED")
                            return r.isEscalated && r.status !== "Resolved";
                          if (filter === "UNCLAIMED")
                            return r.status === "Pending";
                          if (filter === "ACTIVE")
                            return r.status === "In Progress";
                          if (filter === "RESOLVED")
                            return r.status === "Resolved";
                        }).length
                      }
                      )
                    </button>
                  )
                )}
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-500" />
                <select
                  className="bg-slate-900 border border-gray-600 text-white text-xs rounded p-2 outline-none"
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                >
                  <option value="ALL">All Organizations</option>
                  {allOrgs.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedCases.length === 0 && (
                <p className="text-gray-500 col-span-3 text-center py-10">
                  No cases found.
                </p>
              )}
              {displayedCases.map((report) => (
                <div
                  key={report._id}
                  className={`p-5 rounded-xl border relative overflow-hidden ${
                    report.isPriority
                      ? "bg-red-900/10 border-red-500/50"
                      : "bg-slate-800 border-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] font-bold bg-slate-700 px-2 py-1 rounded text-gray-300 uppercase tracking-wide">
                        {report.category}
                      </span>
                      {report.isEscalated && (
                        <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-1 rounded animate-pulse">
                          ESCALATED
                        </span>
                      )}
                    </div>
                    {report.isPriority && (
                      <AlertTriangle size={16} className="text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-3 mb-4 italic">
                    "{report.description}"
                  </p>
                  <div className="bg-black/20 p-3 rounded-lg text-xs space-y-2">
                    {report.status === "Resolved" ? (
                      <div>
                        <p className="text-green-400 font-bold mb-1">
                          ✅ RESOLVED
                        </p>
                        <p className="text-gray-400">
                          By: {report.resolution?.resolvedBy}
                        </p>
                        {report.resolution?.proof?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-700">
                            {report.resolution.proof.map((url, i) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                className="text-blue-400 underline flex items-center gap-1 hover:text-blue-300"
                              >
                                <ExternalLink size={10} /> Proof {i + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : report.status === "In Progress" ? (
                      <div>
                        <p className="text-blue-400 font-bold mb-1 flex items-center gap-1">
                          <Clock size={12} /> In Progress
                        </p>
                        <p className="text-gray-400">
                          Owner: {report.assignedTo?.orgName}
                        </p>
                        <p className="text-gray-500">
                          Time: {getDuration(report.assignedTo?.claimedAt)}
                        </p>
                        <button
                          onClick={() => revokeClaim(report._id)}
                          className="text-red-400 hover:text-red-300 underline mt-2"
                        >
                          Force Unclaim
                        </button>
                      </div>
                    ) : (
                      <p className="text-yellow-500 font-bold">⚠️ Unclaimed</p>
                    )}
                  </div>
                  {report.status !== "Resolved" && (
                    <div className="flex gap-2 items-center mt-4 pt-3 border-t border-gray-700">
                      <select
                        className="bg-slate-900 border border-gray-600 text-white text-xs rounded p-2 flex-1 outline-none"
                        onChange={(e) =>
                          setAssignmentSelections({
                            ...assignmentSelections,
                            [report._id]: e.target.value,
                          })
                        }
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Assign...
                        </option>
                        {allOrgs
                          .filter((o) => o.status === "APPROVED")
                          .map((o) => (
                            <option key={o._id} value={o._id}>
                              {o.name}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={() => handleAssign(report._id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded"
                      >
                        <ArrowRightCircle size={16} />
                      </button>
                    </div>
                  )}
                  {report.status !== "Resolved" && (
                    <div className="mt-2 text-right">
                      <button
                        onClick={() => togglePriority(report._id)}
                        className="text-xs text-gray-500 hover:text-white underline"
                      >
                        {report.isPriority ? "Clear Priority" : "Mark Priority"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================= ANALYTICS VIEW ======================= */}
        {mainView === "ANALYTICS" && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold">Geospatial Data</h2>
            <p className="text-gray-400">
              Visualizing incident hotspots across the region.
            </p>

            <ReportHeatmap reports={allReports} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-6">
              <div className="bg-slate-800 p-4 rounded-lg border border-gray-700">
                <h4 className="text-3xl font-bold text-white">
                  {allReports.length}
                </h4>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Total Reports
                </p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg border border-gray-700">
                <h4 className="text-3xl font-bold text-green-400">
                  {allReports.filter((r) => r.status === "Resolved").length}
                </h4>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Cases Resolved
                </p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg border border-gray-700">
                <h4 className="text-3xl font-bold text-blue-400">
                  {allReports.filter((r) => r.location.lat !== 0).length}
                </h4>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  GPS Verified
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
