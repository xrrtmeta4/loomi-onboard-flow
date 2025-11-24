import { useState, useRef, useEffect } from "react";
import { X, RotateCcw, Circle, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Filter {
  name: string;
  css: string;
}

const FILTERS: Filter[] = [
  { name: "Normal", css: "none" },
  { name: "Vintage", css: "sepia(0.5) contrast(1.2)" },
  { name: "B&W", css: "grayscale(1)" },
  { name: "Cool", css: "hue-rotate(180deg) saturate(1.5)" },
  { name: "Warm", css: "saturate(1.3) hue-rotate(-20deg)" },
  { name: "Vibrant", css: "saturate(2) contrast(1.2)" },
];

interface CameraRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete: (blob: Blob) => void;
}

export const CameraRecorder = ({ isOpen, onClose, onRecordingComplete }: CameraRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentFilter, setCurrentFilter] = useState(FILTERS[0]);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [recordingTime, setRecordingTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: true,
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("Unable to access camera");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm;codecs=vp9",
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        onRecordingComplete(blob);
        onClose();
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.success("Recording started");
    } catch (error) {
      console.error("Recording error:", error);
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: currentFilter.css }}
      />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="text-white p-2">
          <X className="w-6 h-6" />
        </button>
        <button onClick={toggleCamera} className="text-white p-2">
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Filters */}
      <div className="relative z-10 flex gap-2 overflow-x-auto px-4 scrollbar-hide">
        {FILTERS.map((filter) => (
          <button
            key={filter.name}
            onClick={() => setCurrentFilter(filter)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-smooth ${
              currentFilter.name === filter.name
                ? "bg-white text-black"
                : "bg-white/20 text-white"
            }`}
          >
            {filter.name}
          </button>
        ))}
      </div>

      {/* Recording Time */}
      {isRecording && (
        <div className="relative z-10 flex justify-center mt-4">
          <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            {formatTime(recordingTime)}
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="relative z-10 mt-auto pb-8 flex justify-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-smooth ${
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-white hover:bg-gray-200"
          }`}
        >
          {isRecording ? (
            <Square className="w-8 h-8 text-white fill-current" />
          ) : (
            <Circle className="w-16 h-16 text-red-500 fill-current" />
          )}
        </button>
      </div>
    </div>
  );
};
