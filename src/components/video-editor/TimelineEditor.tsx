import { useState, useRef, useEffect } from "react";
import { X, Play, Pause, Scissors, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface TimelineClip {
  id: string;
  start: number;
  end: number;
  duration: number;
  filter?: string;
  text?: string;
}

interface TimelineEditorProps {
  isOpen: boolean;
  onClose: () => void;
  duration: number;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const TimelineEditor = ({ isOpen, onClose, duration, videoRef }: TimelineEditorProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [clips, setClips] = useState<TimelineClip[]>([
    { id: "1", start: 0, end: duration, duration }
  ]);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const updateTime = () => setCurrentTime(video.currentTime);
    
    video.addEventListener("timeupdate", updateTime);
    return () => video.removeEventListener("timeupdate", updateTime);
  }, [videoRef]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const splitClip = () => {
    if (!selectedClip) return;
    
    const clip = clips.find(c => c.id === selectedClip);
    if (!clip || currentTime < clip.start || currentTime > clip.end) return;

    const newClips = clips.filter(c => c.id !== selectedClip);
    newClips.push(
      { ...clip, id: `${clip.id}_1`, end: currentTime, duration: currentTime - clip.start },
      { ...clip, id: `${clip.id}_2`, start: currentTime, duration: clip.end - currentTime }
    );
    
    setClips(newClips.sort((a, b) => a.start - b.start));
    setSelectedClip(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">Timeline Editor</h2>
        <button onClick={onClose} className="text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Video Preview */}
      <div className="flex-1 flex items-center justify-center bg-black p-4">
        <div className="relative max-w-md w-full aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden">
          {videoRef.current && (
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              src={videoRef.current.src}
            />
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 space-y-4">
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={togglePlayPause}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-smooth"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-primary-foreground" />
            ) : (
              <Play className="w-6 h-6 text-primary-foreground" />
            )}
          </button>
          <button
            onClick={splitClip}
            disabled={!selectedClip}
            className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/90 transition-smooth disabled:opacity-50"
          >
            <Scissors className="w-6 h-6 text-secondary-foreground" />
          </button>
        </div>

        {/* Time Display */}
        <div className="text-center text-white text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Zoom Control */}
        <div className="flex items-center gap-2">
          <span className="text-white text-xs">Zoom</span>
          <Slider
            value={[zoom]}
            onValueChange={(v) => setZoom(v[0])}
            min={1}
            max={5}
            step={0.5}
            className="flex-1"
          />
          <span className="text-white text-xs">{zoom}x</span>
        </div>

        {/* Timeline */}
        <div className="relative bg-gray-800 rounded-lg p-2 overflow-x-auto">
          <div
            className="relative h-20 bg-gray-700 rounded cursor-pointer"
            style={{ width: `${duration * zoom * 10}px`, minWidth: "100%" }}
            onClick={handleTimelineClick}
          >
            {/* Clips */}
            {clips.map((clip) => (
              <div
                key={clip.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedClip(clip.id);
                }}
                className={`absolute h-full rounded transition-smooth ${
                  selectedClip === clip.id
                    ? "bg-primary border-2 border-primary-foreground"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                style={{
                  left: `${(clip.start / duration) * 100}%`,
                  width: `${(clip.duration / duration) * 100}%`,
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <span className="text-xs text-white font-medium">
                    {formatTime(clip.duration)}
                  </span>
                </div>
              </div>
            ))}

            {/* Playhead */}
            <div
              className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
            </div>

            {/* Time Markers */}
            {Array.from({ length: Math.floor(duration) + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 h-2 w-px bg-white/20"
                style={{ left: `${(i / duration) * 100}%` }}
              >
                <span className="absolute top-3 left-0 -translate-x-1/2 text-[10px] text-white/60">
                  {i}s
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={onClose} className="w-full">
          Done
        </Button>
      </div>
    </div>
  );
};
