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
  UploadCloud,
} from "lucide-react";
import AudioRecorder from "./AudioRecorder";
import SearchableDropdown from "./SearchableDropdown";
import { translations } from "../utils/translations";

export default function ReportForm({
  onSubmit,
  onBack,
  selectedCategory,
  isSubmitting,
  lang,
}) {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [consent, setConsent] = useState(false);
  const [files, setFiles] = useState([]);

  const t = translations[lang];

  // Contact State
  const [contactMethod, setContactMethod] = useState("NONE");
  const [contactValue, setContactValue] = useState("");
  const [countryCode, setCountryCode] = useState("+237");
  const [countryList, setCountryList] = useState([]);

  const [safeTime, setSafeTime] = useState("");
  const [safeVoicemail, setSafeVoicemail] = useState(false);
  const [requestImmediate, setRequestImmediate] = useState(false);

  // --- FETCH COUNTRY CODES ---
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
        setCountryList([{ name: "Cameroon", dial_code: "+237" }]);
      }
    };
    fetchCodes();
  }, []);

  // --- ULTRA ACCURATE LOCATION ---
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationError(false);
        },
        (err) => {
          console.error("GPS Error", err);
          setLocationError(true);
        },
        {
          enableHighAccuracy: true, // Force GPS Hardware
          timeout: 20000, // Wait up to 20s for a satellite lock
          maximumAge: 0, // Do not use cached position
        }
      );
    } else setLocationError(true);
  }, []);

  const handleFileAdd = (e) => {
    if (e.target.files)
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };
  const handleAudioAdd = (file) => {
    if (file) setFiles((prev) => [...prev, file]);
  };
  const removeFile = (idx) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  
  const handleSubmitWithLoc = (e) => {
    e.preventDefault();
    if (!location) {
      alert(t.loc_fail);
      return;
    }

    let finalContactValue = contactValue;
    if (contactMethod === "PHONE")
      finalContactValue = `${countryCode} ${contactValue}`;

    //  Send a clear string value or null
    let finalTime = null;
    if (requestImmediate) {
      finalTime = "ASAP"; // Explicit string for backend
    } else if (safeTime) {
      finalTime = safeTime;
    }

    const contactData = {
      method: contactMethod,
      value: finalContactValue,
      safeTime: finalTime,
      safeToVoicemail: safeVoicemail,
      immediateHelp: requestImmediate,
    };

    // Pass everything up
    onSubmit(e, location, consent, files, contactData);
  };

  return (
    <div className="space-y-4 animate-slide-up pb-10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-gray-400 text-sm hover:text-gray-600 font-medium"
          >
            ←
          </button>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            {selectedCategory}
          </span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <div className="flex items-center gap-2 text-blue-800 text-sm font-bold mb-1">
          <ShieldAlert size={16} /> {t.safety_title}
        </div>
        <p className="text-xs text-blue-700 leading-relaxed opacity-90">
          {selectedCategory === "Domestic Violence" ? t.dv_tip : t.gen_tip}
        </p>
      </div>

      <form onSubmit={handleSubmitWithLoc} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
            <Info size={14} /> {t.guide_title}
          </div>
          <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
            {t.guide_text}
          </div>
          <textarea
            name="description"
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            placeholder={t.placeholder}
          ></textarea>
        </div>

        <div className="space-y-3 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col items-center justify-center p-4 border rounded-xl bg-blue-50/50 hover:bg-blue-100 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileAdd}
              />
              <Camera size={24} className="mb-2 text-blue-600" />
              <span className="text-xs font-bold text-blue-800">{t.photo}</span>
            </label>
            <label className="flex flex-col items-center justify-center p-4 border rounded-xl bg-red-50/50 hover:bg-red-100 cursor-pointer">
              <input
                type="file"
                accept="video/*"
                capture="environment"
                className="hidden"
                onChange={handleFileAdd}
              />
              <Video size={24} className="mb-2 text-red-600" />
              <span className="text-xs font-bold text-red-800">{t.video}</span>
            </label>
            <label className="col-span-2 flex items-center justify-center gap-3 p-3 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer">
              <input
                type="file"
                accept="image/*,video/*,audio/*"
                multiple
                className="hidden"
                onChange={handleFileAdd}
              />
              <div className="bg-white p-2 rounded-full shadow-sm">
                <UploadCloud size={20} className="text-gray-600" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-gray-700 block">
                  {t.gallery}
                </span>
                <span className="text-[10px] text-gray-400">
                  {t.gallery_sub}
                </span>
              </div>
            </label>
          </div>
          <AudioRecorder onRecordingComplete={handleAudioAdd} lang={lang} />
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="bg-gray-100 text-xs px-2 py-1 rounded border flex items-center gap-1"
                >
                  <span className="truncate max-w-[150px]">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-gray-400 hover:text-red-500"
                  >
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
              <span>{t.loc_secure}</span>
            </>
          ) : (
            <>
              <MapPin size={20} className="animate-pulse" />
              <span>{locationError ? t.loc_fail : t.loc_wait}</span>
            </>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-700">{t.contact_title}</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setContactMethod("PHONE")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                contactMethod === "PHONE"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-500"
              }`}
            >
              {t.phone}
            </button>
            <button
              type="button"
              onClick={() => setContactMethod("EMAIL")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                contactMethod === "EMAIL"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-500"
              }`}
            >
              {t.email}
            </button>
            <button
              type="button"
              onClick={() => setContactMethod("NONE")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border ${
                contactMethod === "NONE"
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-500"
              }`}
            >
              {t.no}
            </button>
          </div>

          {contactMethod !== "NONE" && (
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fade-in">
              {contactMethod === "PHONE" ? (
                <div className="flex">
                  <SearchableDropdown
                    options={countryList}
                    value={countryCode}
                    onChange={setCountryCode}
                    placeholder="+..."
                  />
                  <input
                    type="tel"
                    placeholder={t.safe_phone}
                    className="flex-1 p-2 border border-l-0 rounded-r-lg text-sm outline-none"
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <input
                  type="email"
                  placeholder={t.safe_email}
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
                  {t.immediate}
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
                  {requestImmediate ? t.asap : t.schedule}
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
                    {t.voicemail}
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
              {t.police_title}
            </span>
            <p className="text-xs text-gray-500 mt-1">{t.police_text}</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !location}
          className={`w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg mt-4 transition-all ${
            isSubmitting || !location
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <Send size={20} />
          {isSubmitting
            ? files.some((f) => f.type.startsWith("video"))
              ? t.uploading
              : t.sending
            : location
            ? t.submit
            : t.wait_gps}
        </button>
      </form>
    </div>
  );
}
