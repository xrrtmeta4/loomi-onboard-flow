import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { FiltersDialog, EffectsDialog } from "@/components/video-editor/FiltersDialog";
import { TextOverlayDialog } from "@/components/video-editor/TextOverlayDialog";
import { MusicDialog } from "@/components/video-editor/MusicDialog";
import { TrimDialog } from "@/components/video-editor/TrimDialog";
import { StickersDialog } from "@/components/video-editor/StickersDialog";
import { GifsDialog } from "@/components/video-editor/GifsDialog";
import { SpeedDialog } from "@/components/video-editor/SpeedDialog";
import { TransitionsDialog } from "@/components/video-editor/TransitionsDialog";
import { GreenScreenDialog } from "@/components/video-editor/GreenScreenDialog";
import { 
  X, 
  Music, 
  RotateCcw, 
  Zap, 
  FlipHorizontal, 
  Camera, 
  Upload, 
  Users,
  Home,
  Inbox,
  User,
  Plus,
  Timer,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Type,
  Smile,
  Film,
  Gauge,
  Shuffle,
  Scissors
} from "lucide-react";

const Create = () => {
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState("15s");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState({ name: "Normal", css: "none" });
  const [effects, setEffects] = useState({ brightness: 100, contrast: 100, saturation: 100 });
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [musicVolume, setMusicVolume] = useState(1);
  const [textOverlays, setTextOverlays] = useState<any[]>([]);
  const [stickers, setStickers] = useState<string[]>([]);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [transition, setTransition] = useState<string | null>(null);
  const [greenScreenBg, setGreenScreenBg] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  
  // Dialog states
  const [showFilters, setShowFilters] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showTrim, setShowTrim] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showGifs, setShowGifs] = useState(false);
  const [showSpeed, setShowSpeed] = useState(false);
  const [showTransitions, setShowTransitions] = useState(false);
  const [showGreenScreen, setShowGreenScreen] = useState(false);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const generateThumbnail = (videoFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        video.currentTime = 1; // Seek to 1 second
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            } else {
              reject(new Error("Failed to generate thumbnail"));
            }
          }, "image/jpeg", 0.8);
        }
      };

      video.onerror = () => reject(new Error("Failed to load video"));
      video.src = URL.createObjectURL(videoFile);
    });
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file");
      return;
    }

    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Video file size must be less than 100MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to upload videos");
        navigate("/");
        return;
      }

      // Generate thumbnail
      setUploadProgress(10);
      const thumbnailDataUrl = await generateThumbnail(file);
      const thumbnailBlob = await (await fetch(thumbnailDataUrl)).blob();

      // Upload video
      setUploadProgress(20);
      const videoFileName = `${user.id}/${Date.now()}_${file.name}`;
      
      // Simulate progress for video upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 75));
      }, 200);

      const { data: videoData, error: videoError } = await supabase.storage
        .from("videos")
        .upload(videoFileName, file);

      clearInterval(progressInterval);
      if (videoError) throw videoError;

      // Upload thumbnail
      setUploadProgress(80);
      const thumbnailFileName = `${user.id}/${Date.now()}_thumbnail.jpg`;
      const { data: thumbnailData, error: thumbnailError } = await supabase.storage
        .from("videos")
        .upload(thumbnailFileName, thumbnailBlob);

      if (thumbnailError) throw thumbnailError;

      // Get public URLs
      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(videoData.path);

      const { data: { publicUrl: thumbnailUrl } } = supabase.storage
        .from("videos")
        .getPublicUrl(thumbnailData.path);

      // Create video record
      setUploadProgress(90);
      const { error: dbError } = await supabase.from("videos").insert({
        user_id: user.id,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        duration: selectedDuration === "15s" ? 15 : selectedDuration === "60s" ? 60 : 0,
      });

      if (dbError) throw dbError;

      setUploadProgress(100);
      toast.success("Video uploaded successfully!");
      
      // Preview the video
      setVideoPreview(URL.createObjectURL(file));

      setTimeout(() => {
        navigate("/feed");
      }, 1000);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload video");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const url = URL.createObjectURL(file);
    setImagePreview(url);
    toast.success("Image loaded! Add filters and effects");
  };

  const getVideoStyle = () => {
    const filterStr = currentFilter.css !== "none" ? currentFilter.css : "";
    const effectsStr = `brightness(${effects.brightness}%) contrast(${effects.contrast}%) saturate(${effects.saturation}%)`;
    return {
      filter: `${filterStr} ${effectsStr}`.trim(),
    };
  };

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-black">
      {/* Hidden inputs */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Camera View Background */}
      <div className="absolute inset-0 z-0">
        {videoPreview ? (
          <div className="relative h-full w-full">
            <video
              ref={videoRef}
              src={videoPreview}
              className="h-full w-full object-cover"
              style={getVideoStyle()}
              autoPlay
              loop
              muted
            />
            {/* Text Overlays */}
            {textOverlays.map((overlay, index) => (
              <div
                key={index}
                style={{
                  position: "absolute",
                  left: `${overlay.x}%`,
                  top: `${overlay.y}%`,
                  fontSize: `${overlay.fontSize}px`,
                  color: overlay.color,
                  fontWeight: "bold",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                  pointerEvents: "none",
                }}
              >
                {overlay.text}
              </div>
            ))}
          </div>
        ) : imagePreview ? (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${imagePreview})`,
              filter: `${currentFilter.css !== "none" ? currentFilter.css : ""} brightness(${effects.brightness}%) contrast(${effects.contrast}%) saturate(${effects.saturation}%)`,
            }}
          >
            <div className="absolute inset-0 bg-black/10" />
            {/* Text Overlays */}
            {textOverlays.map((overlay, index) => (
              <div
                key={index}
                style={{
                  position: "absolute",
                  left: `${overlay.x}%`,
                  top: `${overlay.y}%`,
                  fontSize: `${overlay.fontSize}px`,
                  color: overlay.color,
                  fontWeight: "bold",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                  pointerEvents: "none",
                }}
              >
                {overlay.text}
              </div>
            ))}
          </div>
        ) : (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=1200&fit=crop")',
            }}
          >
            <div className="absolute inset-0 bg-black/10" />
          </div>
        )}
      </div>

      {/* Upload Progress Overlay */}
      {uploading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
          <div className="w-3/4 space-y-4 text-center">
            <p className="text-white text-lg font-semibold">Uploading video...</p>
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-white/80 text-sm">{uploadProgress}%</p>
          </div>
        </div>
      )}

      <div className="relative z-10 flex h-screen flex-col justify-between">
        {/* Top Bar */}
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between text-white">
            <button
              onClick={() => setShowMusic(true)}
              className="flex items-center gap-2 rounded-xl h-10 px-4 glass text-white text-sm font-medium hover:bg-white/30 transition-smooth"
            >
              <Music className="w-4 h-4" />
              <span>{musicUrl ? "Music Added" : "Add Music"}</span>
            </button>
            <div className="flex items-center gap-1 rounded-full glass p-1">
              <button className="flex size-8 items-center justify-center rounded-full hover:bg-white/20 transition-smooth">
                <FlipHorizontal className="w-5 h-5" />
              </button>
              <button className="flex size-8 items-center justify-center rounded-full hover:bg-white/20 transition-smooth">
                <Zap className="w-5 h-5" />
              </button>
              <button className="flex size-8 items-center justify-center rounded-full hover:bg-white/20 transition-smooth">
                <Zap className="w-5 h-5 fill-current" />
              </button>
            </div>
            <button 
              onClick={() => navigate("/feed")}
              className="flex h-10 w-10 items-center justify-center rounded-full glass text-white hover:bg-white/30 transition-smooth"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right-Side Toolbar */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl glass p-2 text-white max-h-[70vh] overflow-y-auto scrollbar-hide">
            <button
              onClick={() => setShowFilters(true)}
              className="flex flex-col items-center gap-0.5 p-1 hover:text-primary transition-smooth"
            >
              <Camera className="w-5 h-5" />
              <span className="text-[10px] font-medium">Filters</span>
            </button>
            <button
              onClick={() => setShowEffects(true)}
              className="flex flex-col items-center gap-0.5 p-1 hover:text-primary transition-smooth"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-[10px] font-medium">Effects</span>
            </button>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex flex-col items-center gap-0.5 p-1 hover:text-primary transition-smooth"
            >
              <ImageIcon className="w-5 h-5" />
              <span className="text-[10px] font-medium">Image</span>
            </button>
            <button
              onClick={() => setShowText(true)}
              className="flex flex-col items-center gap-0.5 p-1 hover:text-primary transition-smooth"
            >
              <Type className="w-5 h-5" />
              <span className="text-[10px] font-medium">Text</span>
            </button>
            <button
              onClick={() => setShowStickers(true)}
              className="flex flex-col items-center gap-0.5 p-1 hover:text-primary transition-smooth"
            >
              <Smile className="w-5 h-5" />
              <span className="text-[10px] font-medium">Sticker</span>
            </button>
            <button
              onClick={() => setShowGifs(true)}
              className="flex flex-col items-center gap-0.5 p-1 hover:text-primary transition-smooth"
            >
              <Film className="w-5 h-5" />
              <span className="text-[10px] font-medium">GIFs</span>
            </button>
            <button
              onClick={() => setShowSpeed(true)}
              className="flex flex-col items-center gap-0.5 p-1 hover:text-primary transition-smooth"
            >
              <Gauge className="w-5 h-5" />
              <span className="text-[10px] font-medium">Speed</span>
            </button>
            <button
              onClick={() => setShowTransitions(true)}
              className="flex flex-col items-center gap-0.5 p-1 hover:text-primary transition-smooth"
            >
              <Shuffle className="w-5 h-5" />
              <span className="text-[10px] font-medium">Trans</span>
            </button>
            <button
              onClick={() => setShowTrim(true)}
              disabled={!videoPreview}
              className="flex flex-col items-center gap-0.5 p-1 hover:text-primary transition-smooth disabled:opacity-50"
            >
              <Scissors className="w-5 h-5" />
              <span className="text-[10px] font-medium">Trim</span>
            </button>
            <button className="flex flex-col items-center gap-0.5 p-1 hover:text-primary transition-smooth">
              <Timer className="w-5 h-5" />
              <span className="text-[10px] font-medium">Timer</span>
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-4 p-4 pb-0">
          {/* Timeline Placeholder */}
          <div className="flex h-10 w-full items-center justify-center">
            <div className="flex h-2 items-center gap-1 rounded-full glass p-2.5">
              <div className="h-1 rounded-full bg-primary-purple" style={{ width: "4rem" }} />
              <div className="h-1 rounded-full bg-white/50" style={{ width: "2rem" }} />
            </div>
          </div>

          {/* Camera Control */}
          <div className="relative flex items-center justify-center gap-8">
            <button 
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading}
              className="flex shrink-0 flex-col items-center justify-center gap-1.5 text-white hover:text-primary transition-smooth disabled:opacity-50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg glass">
                <Upload className="w-6 h-6" />
              </div>
            </button>
            <button 
              disabled={uploading}
              className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-4 border-white bg-transparent p-1 hover:border-primary-purple transition-smooth disabled:opacity-50"
            >
              <div className="h-full w-full rounded-full bg-primary-purple" />
            </button>
            <button 
              onClick={() => navigate("/community")}
              className="flex shrink-0 flex-col items-center justify-center gap-1.5 text-white hover:text-primary transition-smooth"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg glass">
                <Users className="w-6 h-6" />
              </div>
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center justify-center gap-6 py-2 text-sm font-semibold">
            <button
              onClick={() => setSelectedDuration("15s")}
              disabled={uploading}
              className={`transition-smooth disabled:opacity-50 ${
                selectedDuration === "15s" ? "text-white" : "text-white/60 hover:text-white"
              }`}
            >
              15s
            </button>
            <button
              onClick={() => setSelectedDuration("60s")}
              disabled={uploading}
              className={`transition-smooth disabled:opacity-50 ${
                selectedDuration === "60s" ? "text-white" : "text-white/60 hover:text-white"
              }`}
            >
              60s
            </button>
            <button
              onClick={() => setSelectedDuration("chain")}
              disabled={uploading}
              className={`transition-smooth disabled:opacity-50 ${
                selectedDuration === "chain" ? "text-white" : "text-white/60 hover:text-white"
              }`}
            >
              Chain
            </button>
          </div>

          {/* Main App Navigation */}
          <div className="flex w-full items-center justify-around glass backdrop-blur-sm py-2 rounded-t-xl">
            <button 
              onClick={() => navigate("/feed")}
              className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white transition-smooth"
            >
              <Home className="w-6 h-6" />
              <span className="text-xs">Home</span>
            </button>
            <button 
              onClick={() => navigate("/community")}
              className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white transition-smooth"
            >
              <Users className="w-6 h-6" />
              <span className="text-xs">Communities</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 text-white">
              <div className="flex h-7 w-10 items-center justify-center rounded-lg bg-primary-purple">
                <Plus className="w-5 h-5" />
              </div>
            </button>
            <button 
              onClick={() => navigate("/inbox")}
              className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white transition-smooth"
            >
              <Inbox className="w-6 h-6" />
              <span className="text-xs">Inbox</span>
            </button>
            <button 
              onClick={() => navigate("/profile")}
              className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-white transition-smooth"
            >
              <User className="w-6 h-6" />
              <span className="text-xs">Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <FiltersDialog
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onSelectFilter={setCurrentFilter}
        currentFilter={currentFilter}
      />
      <EffectsDialog
        isOpen={showEffects}
        onClose={() => setShowEffects(false)}
        onApplyEffect={setEffects}
      />
      <MusicDialog
        isOpen={showMusic}
        onClose={() => setShowMusic(false)}
        onSelectMusic={(url, volume) => {
          setMusicUrl(url);
          setMusicVolume(volume);
          toast.success("Music added!");
        }}
      />
      <TextOverlayDialog
        isOpen={showText}
        onClose={() => setShowText(false)}
        onAddText={(overlay) => {
          setTextOverlays((prev) => [...prev, { id: Date.now().toString(), ...overlay }]);
          toast.success("Text added!");
        }}
      />
      {videoPreview && videoRef.current && (
        <TrimDialog
          isOpen={showTrim}
          onClose={() => setShowTrim(false)}
          duration={videoRef.current.duration || 0}
          onTrim={(start, end) => {
            toast.success(`Video trimmed: ${start.toFixed(1)}s - ${end.toFixed(1)}s`);
          }}
        />
      )}
      <StickersDialog
        isOpen={showStickers}
        onClose={() => setShowStickers(false)}
        onSelectSticker={(url) => {
          setStickers([...stickers, url]);
          toast.success("Sticker added!");
        }}
      />
      <GifsDialog
        isOpen={showGifs}
        onClose={() => setShowGifs(false)}
        onSelectGif={(url) => {
          setSelectedGif(url);
          toast.success("GIF added!");
        }}
      />
      <SpeedDialog
        isOpen={showSpeed}
        onClose={() => setShowSpeed(false)}
        onSelectSpeed={(speed) => {
          setPlaybackSpeed(speed);
          if (videoRef.current) {
            videoRef.current.playbackRate = speed;
          }
          toast.success(`Speed set to ${speed}x`);
        }}
      />
      <TransitionsDialog
        isOpen={showTransitions}
        onClose={() => setShowTransitions(false)}
        onSelectTransition={(trans) => {
          setTransition(trans);
          toast.success(`${trans} transition applied!`);
        }}
      />
      <GreenScreenDialog
        isOpen={showGreenScreen}
        onClose={() => setShowGreenScreen(false)}
        onApplyGreenScreen={(bgUrl, threshold) => {
          setGreenScreenBg(bgUrl);
          toast.success("Green screen effect applied!");
        }}
      />
    </div>
  );
};

export default Create;
