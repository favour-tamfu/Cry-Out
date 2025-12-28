import {
  AlertTriangle,
  UserX,
  Hand,
  EyeOff,
  HelpCircle,
  Globe,
} from "lucide-react";
import { translations } from "../utils/translations";

export default function CategorySelect({ onSelect, lang, setLang }) {
  const t = translations[lang];

  // We map the IDs to the Translation Keys
  const categories = [
    {
      id: "Domestic Violence",
      label: t.cat_dv,
      icon: <Hand />,
      color: "bg-orange-100 text-orange-600 border-orange-200",
    },
    {
      id: "Sexual Assault",
      label: t.cat_sa,
      icon: <UserX />,
      color: "bg-red-100 text-red-600 border-red-200",
    },
    {
      id: "Physical Abuse",
      label: t.cat_pa,
      icon: <AlertTriangle />,
      color: "bg-yellow-100 text-yellow-600 border-yellow-200",
    },
    {
      id: "Stalking",
      label: t.cat_st,
      icon: <EyeOff />,
      color: "bg-purple-100 text-purple-600 border-purple-200",
    },
    {
      id: "Other",
      label: t.cat_ot,
      icon: <HelpCircle />,
      color: "bg-gray-100 text-gray-600 border-gray-200",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in relative">
      <h2 className="text-xl font-bold text-gray-800 text-center">
        {t.what_happening}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)} // We send the English ID to the backend (Standardization)
            className={`p-6 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 ${cat.color} hover:shadow-md`}
          >
            <div className="scale-150">{cat.icon}</div>
            <span className="font-semibold text-sm text-center">
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
