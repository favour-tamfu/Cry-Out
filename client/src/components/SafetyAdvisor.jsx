import { useState, useEffect } from "react";
import axios from "axios";
import {
  Shield,
  Phone,
  Lock,
  HeartPulse,
  EyeOff,
  Mail,
  MapPin,
} from "lucide-react";
import { API_URL } from "../config";

export default function SafetyAdvisor({ category }) {
  const [helpers, setHelpers] = useState([]);

  useEffect(() => {
    // Fetch real organizations
    const fetchHelpers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/public/help-directory`);
        // Filter: Only show orgs that handle this category
        const relevant = res.data.filter((org) =>
          org.allowedCategories.includes(category)
        );
        setHelpers(relevant);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHelpers();
  }, [category]);

  const getAdvice = () => {
    switch (category) {
      case "Domestic Violence":
        return {
          title: "Safety First Protocol",
          color: "bg-orange-50 border-orange-200 text-orange-900",
          icon: <Lock className="text-orange-600" />,
        };
      case "Sexual Assault":
        return {
          title: "Preservation & Care",
          color: "bg-red-50 border-red-200 text-red-900",
          icon: <HeartPulse className="text-red-600" />,
        };
      default:
        return {
          title: "General Safety Guide",
          color: "bg-blue-50 border-blue-200 text-blue-900",
          icon: <Shield className="text-blue-600" />,
        };
    }
  };

  const advice = getAdvice();

  return (
    <div
      className={`p-5 rounded-xl border ${advice.color} animate-fade-in mt-6 text-left shadow-sm`}
    >
      <div className="flex items-center gap-3 mb-4 border-b border-black/10 pb-3">
        <div className="bg-white p-2 rounded-full shadow-sm">{advice.icon}</div>
        <div>
          <h3 className="font-bold text-lg leading-tight">{advice.title}</h3>
          <p className="text-xs opacity-75 uppercase tracking-wide font-bold">
            Recommended Actions
          </p>
        </div>
      </div>

      {/* Standard Advice List */}
      <ul className="space-y-3 mb-6 text-sm font-medium">
        <li>1. Silence your phone immediately.</li>
        <li>2. Go to a safe location (public area or locked room).</li>
        <li>3. Clear your browser history after this session.</li>
      </ul>

      {/* --- REAL HELP DIRECTORY --- */}
      {helpers.length > 0 && (
        <div className="bg-white/60 p-4 rounded-lg border border-black/5 mt-4">
          <h4 className="text-xs font-bold uppercase mb-3 flex items-center gap-2">
            <Phone size={14} /> Verified Organizations who can help:
          </h4>
          <div className="space-y-3">
            {helpers.map((org) => (
              <div
                key={org._id}
                className="text-sm border-b border-black/10 pb-2 last:border-0 last:pb-0"
              >
                <p className="font-bold">
                  {org.name}{" "}
                  <span className="text-[10px] bg-black/10 px-1 rounded ml-1">
                    {org.type}
                  </span>
                </p>
                <p className="text-xs flex items-center gap-1 mt-1 opacity-80">
                  <MapPin size={10} /> {org.city}, {org.country}
                </p>
                <div className="flex gap-3 mt-2">
                  <a
                    href={`tel:${org.contactPhone}`}
                    className="bg-white border px-3 py-1 rounded text-xs font-bold flex items-center gap-1 hover:bg-green-50 text-green-700 shadow-sm"
                  >
                    <Phone size={12} /> Call
                  </a>
                  {org.contactEmail && (
                    <a
                      href={`mailto:${org.contactEmail}`}
                      className="bg-white border px-3 py-1 rounded text-xs font-bold flex items-center gap-1 hover:bg-blue-50 text-blue-700 shadow-sm"
                    >
                      <Mail size={12} /> Email
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* --------------------------- */}

      <div className="mt-4 pt-4 border-t border-black/10 flex gap-2">
        <a
          href="tel:911"
          className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold text-center text-sm hover:bg-red-700 flex items-center justify-center gap-2 shadow-lg"
        >
          <Phone size={16} /> Call Emergency (911)
        </a>
      </div>
    </div>
  );
}
