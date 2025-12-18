import { useState } from "react";
import { MapPin, Send, Check, Camera, Video, Paperclip, X } from "lucide-react";
import AudioRecorder from "./AudioRecorder"; // Import new component

export default function ReportForm({
  onSubmit,
  onBack,
  selectedCategory,
  isSubmitting,
}) {
  const [location, setLocation] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [consent, setConsent] = useState(false);
  const [files, setFiles] = useState([]);

  // Add new files to the existing list
  const handleFileAdd = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  // Add audio file from recorder
  const handleAudioAdd = (audioFile) => {
    if (audioFile) {
      setFiles((prev) => [...prev, audioFile]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGetLocation = () => {
    setLoadingLoc(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "GPS Coordinates Attached",
          });
          setLoadingLoc(false);
        },
        () => {
          alert("Location failed.");
          setLoadingLoc(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLoadingLoc(false);
    }
  };

  const handleSubmitWithLoc = (e) => {
    e.preventDefault();
    onSubmit(e, location, consent, files);
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
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

      <form onSubmit={handleSubmitWithLoc} className="space-y-4">
        <textarea
          name="description"
          required
          rows="3"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-gray-50"
          placeholder="What is happening?"
        ></textarea>

        {/* --- NEW MEDIA TOOLS --- */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Quick Evidence
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* 1. CAMERA BUTTON */}
            <label className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 cursor-pointer shadow-sm transition-all active:scale-95">
              <input
                type="file"
                accept="image/*"
                capture="environment" // Forces Camera on Mobile
                className="hidden"
                onChange={handleFileAdd}
              />
              <Camera className="text-blue-600 mb-1" size={24} />
              <span className="text-xs font-bold text-gray-600">
                Take Photo
              </span>
            </label>

            {/* 2. VIDEO BUTTON */}
            <label className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 cursor-pointer shadow-sm transition-all active:scale-95">
              <input
                type="file"
                accept="video/*"
                capture="environment" // Forces Camera on Mobile
                className="hidden"
                onChange={handleFileAdd}
              />
              <Video className="text-red-500 mb-1" size={24} />
              <span className="text-xs font-bold text-gray-600">
                Record Video
              </span>
            </label>
          </div>

          {/* 3. AUDIO RECORDER */}
          <AudioRecorder onRecordingComplete={handleAudioAdd} />

          {/* 4. ATTACH FILE (Old Method) */}
          <label className="flex items-center justify-center gap-2 w-full p-2 border-dashed border-2 border-gray-200 rounded-lg text-gray-400 text-sm hover:bg-gray-50 cursor-pointer">
            <Paperclip size={16} />
            <span>Or upload existing file</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileAdd}
            />
          </label>

          {/* FILE LIST PREVIEW */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md flex items-center gap-1 border border-gray-200"
                >
                  <span className="max-w-[100px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* ----------------------- */}

        {/* Location & Consent (Same as before) */}
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
            <span>{loadingLoc ? "Locating..." : "Attach Location"}</span>
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
            className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-red-500"
          />
          <label className="text-sm text-gray-700">
            <span className="font-bold text-red-700 block mb-1">
              Alert Law Enforcement?
            </span>
            Check only for immediate danger.
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:bg-gray-400"
        >
          <Send size={20} />
          {isSubmitting ? "Sending..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}
