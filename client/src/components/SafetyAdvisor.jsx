import { Shield, Phone, Lock, HeartPulse, EyeOff, X } from "lucide-react";

export default function SafetyAdvisor({ category }) {
  // The "Intelligence" Logic
  const getAdvice = () => {
    switch (category) {
      case "Domestic Violence":
        return {
          title: "Safety First Protocol",
          steps: [
            "Silence your phone immediately.",
            "Identify the safest room (one with a lock or window). Avoid the kitchen (knives) or garage.",
            "If an argument starts, stay near an exit.",
            "Clear your browser history after reading this.",
          ],
          color: "bg-orange-50 border-orange-200 text-orange-900",
          icon: <Lock className="text-orange-600" />,
        };
      case "Sexual Assault":
        return {
          title: "Preservation & Care",
          steps: [
            "Go to a safe place away from the perpetrator.",
            "Try not to shower, change clothes, or clean up yet (this preserves DNA evidence).",
            "Seek medical attention even if you don't see injuries.",
            "You are not alone. It is not your fault.",
          ],
          color: "bg-red-50 border-red-200 text-red-900",
          icon: <HeartPulse className="text-red-600" />,
        };
      case "Stalking":
        return {
          title: "Anti-Surveillance Steps",
          steps: [
            "Document every interaction (time, date, location).",
            "Change your passwords and enable 2-Factor Authentication.",
            "Vary your daily routes to work/school.",
            "Do not engage or reply to the stalker.",
          ],
          color: "bg-purple-50 border-purple-200 text-purple-900",
          icon: <EyeOff className="text-purple-600" />,
        };
      default:
        return {
          title: "General Safety Guide",
          steps: [
            "Trust your instincts. If you feel unsafe, leave.",
            "Keep your phone charged and on you.",
            "Establish a 'Code Word' with a trusted friend to signal trouble.",
          ],
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

      <ul className="space-y-3 mb-6">
        {advice.steps.map((step, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="bg-white/60 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-current shrink-0 mt-0.5">
              {index + 1}
            </span>
            <span className="font-medium text-sm leading-relaxed">{step}</span>
          </li>
        ))}
      </ul>

      {/* Emergency Footer */}
      <div className="flex gap-2">
        <a
          href="tel:911"
          className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold text-center text-sm hover:bg-red-700 flex items-center justify-center gap-2 shadow-lg"
        >
          <Phone size={16} /> Call Emergency
        </a>
      </div>
    </div>
  );
}
