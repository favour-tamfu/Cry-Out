import { useEffect, useState } from "react";
import axios from "axios";
import {
  Check,
  X,
  Shield,
  Building,
  MapPin,
  Mail,
  Phone,
  FileText,
  Trash2,
  Edit,
  Save,
  Download,
} from "lucide-react";
import { API_URL } from '../config'; // (Check path based on file location)

export default function SuperAdmin() {
  const [orgs, setOrgs] = useState([]);
  const [filter, setFilter] = useState("PENDING"); // PENDING, APPROVED, REJECTED
  const [editingId, setEditingId] = useState(null); // Which org are we editing?
  const [editCats, setEditCats] = useState([]); // Temporary categories while editing
  const [auth, setAuth] = useState(false);

  const ALL_CATEGORIES = [
    "Domestic Violence",
    "Sexual Assault",
    "Physical Abuse",
    "Stalking",
    "Other",
  ];

  useEffect(() => {
    const password = prompt("Enter Super Admin Password:");
    if (password === "master123") {
      setAuth(true);
      fetchOrgs();
    } else {
      window.location.href = "/";
    }
  }, []);

  const fetchOrgs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/orgs`

      );
      setOrgs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (!confirm(`Mark this organization as ${newStatus}?`)) return;
    await axios.put(`${API_URL}/api/admin/update-status/${id}`, {
      status: newStatus,
    });
    fetchOrgs();
  };

  const deleteOrg = async (id) => {
    if (!confirm("PERMANENTLY DELETE this organization?")) return;
    await axios.delete(`${API_URL}/api/admin/delete-org/${id}`);
    fetchOrgs();
  };

  const startEditing = (org) => {
    setEditingId(org._id);
    setEditCats(org.allowedCategories || []);
  };

  const saveCategories = async (id) => {
    await axios.put(`${API_URL}/api/admin/update-categories/${id}`, {
      categories: editCats,
    });
    setEditingId(null);
    fetchOrgs();
  };

  const toggleCat = (cat) => {
    if (editCats.includes(cat)) {
      setEditCats(editCats.filter((c) => c !== cat));
    } else {
      setEditCats([...editCats, cat]);
    }
  };

  if (!auth) return null;

  const filteredOrgs = orgs.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-700 pb-4">
          <Shield size={32} className="text-yellow-400" />
          <h1 className="text-3xl font-bold">Super Admin Control</h1>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-6">
          {["PENDING", "APPROVED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-gray-400 hover:bg-slate-700"
              }`}
            >
              {status} ({orgs.filter((o) => o.status === status).length})
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="space-y-6">
          {filteredOrgs.map((org) => (
            <div
              key={org._id}
              className="bg-slate-800 p-6 rounded-xl border border-gray-700"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* INFO COLUMN */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold text-black ${
                        org.type === "POLICE" ? "bg-blue-400" : "bg-orange-400"
                      }`}
                    >
                      {org.type}
                    </span>
                    <h3 className="text-2xl font-bold">{org.name}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                    <p className="flex items-center gap-2">
                      <MapPin size={14} /> {org.address}, {org.city},{" "}
                      {org.country}
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

                  <p className="bg-slate-900/50 p-3 rounded text-sm italic text-gray-300">
                    "{org.description}"
                  </p>

                  {/* DOCUMENTS */}
                  {org.documents && org.documents.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {org.documents.map((doc, i) => (
                        <a
                          key={i}
                          href={doc}
                          target="_blank"
                          className="flex items-center gap-2 bg-slate-700 px-3 py-1 rounded text-xs hover:bg-slate-600"
                        >
                          <FileText size={12} /> Doc {i + 1}{" "}
                          <Download size={12} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* CATEGORY & ACTION COLUMN */}
                <div className="w-full md:w-1/3 bg-slate-900/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex justify-between items-center">
                    Access Permissions
                    {editingId !== org._id && (
                      <button
                        onClick={() => startEditing(org)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                  </h4>

                  {/* CATEGORY EDITOR */}
                  <div className="space-y-2">
                    {ALL_CATEGORIES.map((cat) => (
                      <div
                        key={cat}
                        className="flex items-center gap-2 text-sm"
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
                          className="rounded bg-slate-700 border-gray-600"
                        />
                        <span
                          className={
                            org.allowedCategories.includes(cat)
                              ? "text-white"
                              : "text-gray-600"
                          }
                        >
                          {cat}
                        </span>
                      </div>
                    ))}
                  </div>

                  {editingId === org._id && (
                    <button
                      onClick={() => saveCategories(org._id)}
                      className="mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white py-1 rounded text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Save size={12} /> Save Permissions
                    </button>
                  )}
                </div>

                {/* BUTTONS COLUMN */}
                <div className="flex flex-col gap-2 shrink-0 justify-center">
                  {filter === "PENDING" && (
                    <>
                      <button
                        onClick={() => updateStatus(org._id, "APPROVED")}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex gap-2"
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        onClick={() => updateStatus(org._id, "REJECTED")}
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex gap-2"
                      >
                        <X size={16} /> Reject
                      </button>
                    </>
                  )}
                  {filter === "APPROVED" && (
                    <button
                      onClick={() => updateStatus(org._id, "REJECTED")}
                      className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm"
                    >
                      Suspend
                    </button>
                  )}
                  {filter === "REJECTED" && (
                    <button
                      onClick={() => updateStatus(org._id, "APPROVED")}
                      className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm"
                    >
                      Re-Approve
                    </button>
                  )}

                  <button
                    onClick={() => deleteOrg(org._id)}
                    className="text-red-500 hover:text-red-400 text-xs flex items-center justify-center gap-1 mt-2"
                  >
                    <Trash2 size={12} /> Delete Forever
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredOrgs.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              No organizations in this list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
