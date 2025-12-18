import { useState } from "react";
import { MapPin, Send, Check, Camera, Paperclip } from "lucide-react";

export default function ReportForm({
  onSubmit,
  onBack,
  selectedCategory,
  isSubmitting,
}) {
  const [location, setLocation] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [consent, setConsent] = useState(false);
  const [files, setFiles] = useState([]); // Store selected files

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleGetLocation = () => {
    setLoadingLoc(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "GPS Coordinates Attached",
          };
          setLocation(locData);
          setLoadingLoc(false);
        },
        (error) => {
          alert("Could not get location.");
          setLoadingLoc(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported.");
      setLoadingLoc(false);
    }
  };

  const handleSubmitWithLoc = (e) => {
    e.preventDefault();
    // Pass everything up: Event, Location, Consent, Files
    onSubmit(e, location, consent, files);
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="text-gray-400 text-sm hover:text-gray-600 font-medium"
        >
          ← Back
        </button>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          {selectedCategory}
        </span>
      </div>

      <h2 className="text-xl font-bold text-gray-800">Details</h2>

      <form onSubmit={handleSubmitWithLoc} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What happened?
          </label>
          <textarea
            name="description"
            required
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-gray-50"
            placeholder="Please describe the situation..."
          ></textarea>
        </div>

        {/* --- EVIDENCE UPLOAD SECTION --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Evidence (Optional)
          </label>
          <div className="relative border-dashed border-2 border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*,audio/*,video/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-1 text-gray-500">
              <Camera size={24} />
              <span className="text-sm">Tap to attach photos or audio</span>
            </div>
          </div>
          {files.length > 0 && (
            <div className="mt-2 text-sm text-blue-600 font-medium flex items-center gap-1">
              <Paperclip size={14} />
              {files.length} file(s) attached
            </div>
          )}
        </div>
        {/* ------------------------------- */}

        {!location ? (
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={loadingLoc}
            className="flex items-center gap-2 text-sm text-gray-600 bg-white p-3 rounded-lg w-full border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <MapPin
              size={18}
              className={
                loadingLoc ? "animate-bounce text-blue-500" : "text-red-500"
              }
            />
            <span>
              {loadingLoc ? "Locating you..." : "Attach my location (Optional)"}
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg w-full border border-green-200">
            <Check size={18} />
            <span>Location Attached</span>
          </div>
        )}

        <div
          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
            consent ? "bg-red-100 border-red-300" : "bg-red-50 border-red-100"
          }`}
        >
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
          />
          <label className="text-sm text-gray-700">
            <span className="font-bold text-red-700 block mb-1">
              Alert Law Enforcement?
            </span>
            Check this <b>only</b> if you want immediate police intervention.
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg mt-4 disabled:bg-gray-400"
        >
          <Send size={20} />
          {isSubmitting ? "Sending..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}
