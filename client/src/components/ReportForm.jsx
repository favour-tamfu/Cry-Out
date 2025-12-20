import { useState, useEffect } from "react";
import axios from "axios";
import {
  MapPin,
  Send,
  Check,
  Camera,
  Video,
  X,
  ShieldAlert,
  Info,
  Siren,
  Calendar,
} from "lucide-react";
import AudioRecorder from "./AudioRecorder";
import SearchableDropdown from "./SearchableDropdown"; // Import the new component

export default function ReportForm({
  onSubmit,
  onBack,
  selectedCategory,
  isSubmitting,
}) {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [consent, setConsent] = useState(false);
  const [files, setFiles] = useState([]);

  // Contact State
  const [contactMethod, setContactMethod] = useState("NONE");
  const [contactValue, setContactValue] = useState("");
  const [countryCode, setCountryCode] = useState("+237"); // Default
  const [countryList, setCountryList] = useState([]);

  const [safeTime, setSafeTime] = useState("");
  const [safeVoicemail, setSafeVoicemail] = useState(false);
  const [requestImmediate, setRequestImmediate] = useState(false);

  // --- 1. FETCH COUNTRY CODES ---
  useEffect(() => {
    const fetchCodes = async () => {
      try {
        const res = await axios.get(
          "https://restcountries.com/v3.1/all?fields=name,idd,cca2"
        );
        const formatted = res.data
          .filter((c) => c.idd.root)
          .map((c) => ({
            name: c.name.common,
            code: c.cca2,
            dial_code: c.idd.root + (c.idd.suffixes ? c.idd.suffixes[0] : ""),
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountryList(formatted);
      } catch (err) {
        console.error("Failed to load codes", err);
        setCountryList([
          { name: "Cameroon", dial_code: "+237" },
          { name: "USA", dial_code: "+1" },
        ]);
      }
    };
    fetchCodes();
  }, []);

  // --- 2. AUTO LOCATION ---
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationError(false);
        },
        () => setLocationError(true),
        { enableHighAccuracy: true }
      );
    } else setLocationError(true);
  }, []);

  const handleFileAdd = (e) => {
    if (e.target.files)
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };
  const handleAudioAdd = (file) => {
    console.log("🎤 Audio File Created:", file);
    if (file) setFiles((prev) => [...prev, file]);
  };
  const removeFile = (idx) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

 const handleSubmitWithLoc = (e) => {
   e.preventDefault();
   if (!location) {
     alert("Location is required.");
     return;
   }

   let finalContactValue = contactValue;
   if (contactMethod === "PHONE") {
     finalContactValue = `${countryCode} ${contactValue}`;
   }

   // --- FIX FOR TIME LOGIC ---
   // 1. If Immediate is checked, we don't care about the calendar. Send "ASAP".
   // 2. If Immediate is NOT checked, we check if safeTime has a value.
   // 3. If no safeTime, send null.
   let finalTime = null;

   if (requestImmediate) {
     finalTime = new Date().toISOString(); // Send current time stamp for sorting
   } else if (safeTime) {
     finalTime = safeTime; // Send the value from the calendar input
   }

   const contactData = {
     method: contactMethod,
     value: finalContactValue,
     safeTime: finalTime,
     safeToVoicemail: safeVoicemail,
     immediateHelp: requestImmediate,
   };

   // DEBUG: Open console (F12) to see this when you submit!
   console.log("🚀 SENDING CONTACT DATA:", contactData);

   onSubmit(e, location, consent, files, contactData);
 };

  return (
    <div className="space-y-4 animate-slide-up pb-10">
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

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <div className="flex items-center gap-2 text-blue-800 text-sm font-bold mb-1">
          <ShieldAlert size={16} /> Safety Tips
        </div>
        <p className="text-xs text-blue-700 leading-relaxed opacity-90">
          {selectedCategory === "Domestic Violence"
            ? "Stay near an exit. Keep phone silent."
            : "Trust your instincts. If unsafe, leave."}
        </p>
      </div>

      <form onSubmit={handleSubmitWithLoc} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
            <Info size={14} /> Report Guide
          </div>
          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
            Please mention: <b>Names</b>, <b>Relationship</b>, and <b>Dates</b>{" "}
            if possible.
          </div>
          <textarea
            name="description"
            required
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
            placeholder="Describe the incident here..."
          ></textarea>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col items-center p-3 border rounded-xl hover:bg-gray-50 cursor-pointer text-gray-600 text-xs font-bold">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileAdd}
              />
              <Camera size={20} className="mb-1 text-blue-500" /> Take Photo
            </label>
            <label className="flex flex-col items-center p-3 border rounded-xl hover:bg-gray-50 cursor-pointer text-gray-600 text-xs font-bold">
              <input
                type="file"
                accept="video/*"
                capture="environment"
                className="hidden"
                onChange={handleFileAdd}
              />
              <Video size={20} className="mb-1 text-red-500" /> Record Video
            </label>
          </div>
          <AudioRecorder onRecordingComplete={handleAudioAdd} />
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="bg-gray-100 text-xs px-2 py-1 rounded border flex gap-1"
                >
                  {f.name.slice(0, 10)}...{" "}
                  <button type="button" onClick={() => removeFile(i)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className={`p-3 rounded-lg flex items-center gap-3 text-sm font-medium border ${
            location
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {location ? (
            <>
              <Check size={20} className="text-green-600" />
              <span>Location Automatically Secured</span>
            </>
          ) : (
            <>
              <MapPin size={20} className="animate-pulse" />
              <span>
                {locationError
                  ? "Location Required. Allow GPS."
                  : "Acquiring GPS..."}
              </span>
            </>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-700">
            Can we contact you?
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setContactMethod("PHONE")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                contactMethod === "PHONE"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-500"
              }`}
            >
              Phone
            </button>
            <button
              type="button"
              onClick={() => setContactMethod("EMAIL")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                contactMethod === "EMAIL"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-500"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setContactMethod("NONE")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                contactMethod === "NONE"
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-500"
              }`}
            >
              No
            </button>
          </div>

          {contactMethod !== "NONE" && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fade-in">
              {/* PHONE WITH SEARCHABLE CODE */}
              {contactMethod === "PHONE" ? (
                <div className="flex">
                  {/* Custom Searchable Dropdown */}
                  <SearchableDropdown
                    options={countryList}
                    value={countryCode}
                    onChange={setCountryCode}
                    placeholder="+..."
                  />
                  {/* Phone Input */}
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="flex-1 p-2 border border-l-0 rounded-r-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <input
                  type="email"
                  placeholder="Safe Email Address"
                  className="w-full p-2 border rounded text-sm"
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  required
                />
              )}

              <div
                className={`flex items-center gap-2 p-3 rounded border transition-colors ${
                  requestImmediate
                    ? "bg-red-100 border-red-300 text-red-900"
                    : "bg-white border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  id="immediate"
                  checked={requestImmediate}
                  onChange={(e) => setRequestImmediate(e.target.checked)}
                  className="w-5 h-5 text-red-600 rounded cursor-pointer"
                />
                <label
                  htmlFor="immediate"
                  className="text-xs font-bold cursor-pointer"
                >
                  Request Immediate Callback?
                </label>
              </div>

              <div
                className={`transition-opacity ${
                  requestImmediate
                    ? "opacity-50 pointer-events-none"
                    : "opacity-100"
                }`}
              >
                <label className="text-xs text-gray-500 block mb-1 flex items-center gap-1">
                  <Calendar size={12} />{" "}
                  {requestImmediate
                    ? "We will contact you ASAP"
                    : "Select best date & time to call:"}
                </label>
                <input
                  type="datetime-local"
                  disabled={requestImmediate}
                  className="w-full p-2 border rounded text-sm text-gray-600 disabled:bg-gray-200"
                  value={safeTime}
                  onChange={(e) => setSafeTime(e.target.value)}
                />
              </div>

              {contactMethod === "PHONE" && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="vm"
                    checked={safeVoicemail}
                    onChange={(e) => setSafeVoicemail(e.target.checked)}
                  />
                  <label htmlFor="vm" className="text-xs text-gray-600">
                    Safe to leave voicemail?
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-colors cursor-pointer ${
            consent
              ? "bg-red-50 border-red-500 shadow-sm"
              : "bg-white border-gray-200"
          }`}
          onClick={() => setConsent(!consent)}
        >
          <div
            className={`mt-1 w-5 h-5 rounded border flex items-center justify-center ${
              consent
                ? "bg-red-600 border-red-600 text-white"
                : "border-gray-400"
            }`}
          >
            {consent && <Check size={14} />}
          </div>
          <div>
            <span className="font-bold text-gray-800 block text-sm flex items-center gap-2">
              <Siren
                size={16}
                className={consent ? "text-red-600" : "text-gray-400"}
              />{" "}
              Involve Law Enforcement?
            </span>
            <p className="text-xs text-gray-500 mt-1">
              Check <b>only</b> if you are in immediate danger.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !location}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Send size={20} />{" "}
          {isSubmitting
            ? "Sending..."
            : location
            ? "Submit Report"
            : "Waiting for GPS..."}
        </button>
      </form>
    </div>
  );
}
