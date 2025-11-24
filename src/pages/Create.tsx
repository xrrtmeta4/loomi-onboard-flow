import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Layers
} from "lucide-react";

const Create = () => {
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState("15s");

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-black">
      {/* Camera View Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=1200&fit=crop")',
          }}
        >
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </div>

      <div className="relative z-10 flex h-screen flex-col justify-between">
        {/* Top Bar */}
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between text-white">
            <button className="flex items-center gap-2 rounded-xl h-10 px-4 glass text-white text-sm font-medium hover:bg-white/30 transition-smooth">
              <Music className="w-4 h-4" />
              <span>Add Music</span>
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
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl glass p-2 text-white">
            <button className="flex flex-col items-center gap-1 p-1 hover:text-primary transition-smooth">
              <Camera className="w-6 h-6" />
              <span className="text-xs font-medium">Filters</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-1 hover:text-primary transition-smooth">
              <Sparkles className="w-6 h-6" />
              <span className="text-xs font-medium">Effects</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-1 hover:text-primary transition-smooth">
              <RotateCcw className="w-6 h-6" />
              <span className="text-xs font-medium">Remix</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-1 hover:text-primary transition-smooth">
              <Layers className="w-6 h-6" />
              <span className="text-xs font-medium">Templates</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-1 hover:text-primary transition-smooth">
              <Timer className="w-6 h-6" />
              <span className="text-xs font-medium">Timer</span>
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
            <button className="flex shrink-0 flex-col items-center justify-center gap-1.5 text-white hover:text-primary transition-smooth">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg glass">
                <Upload className="w-6 h-6" />
              </div>
            </button>
            <button className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-4 border-white bg-transparent p-1 hover:border-primary-purple transition-smooth">
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
              className={`transition-smooth ${
                selectedDuration === "15s" ? "text-white" : "text-white/60 hover:text-white"
              }`}
            >
              15s
            </button>
            <button
              onClick={() => setSelectedDuration("60s")}
              className={`transition-smooth ${
                selectedDuration === "60s" ? "text-white" : "text-white/60 hover:text-white"
              }`}
            >
              60s
            </button>
            <button
              onClick={() => setSelectedDuration("chain")}
              className={`transition-smooth ${
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
    </div>
  );
};

export default Create;
