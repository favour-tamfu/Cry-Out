import { useState, useRef } from "react";
import { Mic, Square, Trash2, Play } from "lucide-react";

export default function AudioRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

     mediaRecorderRef.current.onstop = () => {
       // Only process if we have data
       if (audioChunksRef.current.length === 0) return;

       const audioBlob = new Blob(audioChunksRef.current, {
         type: "audio/webm",
       });

       // Ensure the file has a name and type
       const audioFile = new File(
         [audioBlob],
         `voice_note_${Date.now()}.webm`,
         { type: "audio/webm" }
       );

       onRecordingComplete(audioFile);
       const url = URL.createObjectURL(audioBlob);
       setAudioURL(url);
     };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied or not available.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks to release microphone
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const resetRecording = () => {
    setAudioURL(null);
    onRecordingComplete(null); // Clear from parent
  };

  return (
    <div className="border border-blue-100 bg-blue-50 rounded-lg p-3 flex items-center justify-between">
      {!audioURL ? (
        <>
          {isRecording ? (
            <div className="flex items-center gap-3 w-full">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm text-red-600 font-bold animate-pulse">
                Recording...
              </span>
              <button
                type="button"
                onClick={stopRecording}
                className="ml-auto bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              >
                <Square size={16} fill="white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 text-blue-700 font-semibold w-full"
            >
              <Mic size={20} />
              <span>Tap to Record Audio</span>
            </button>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3 w-full">
          <div className="bg-blue-200 p-2 rounded-full text-blue-700">
            <Play size={16} fill="currentColor" />
          </div>
          <span className="text-sm text-blue-900 font-medium flex-1">
            Voice Note Ready
          </span>
          <button
            type="button"
            onClick={resetRecording}
            className="text-gray-400 hover:text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
