import { useState, useRef } from "react";
import { X, Upload, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface MusicDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMusic: (audioUrl: string, volume: number) => void;
}

const PRESET_MUSIC = [
  { name: "Upbeat Pop", url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8b3f22c.mp3" },
  { name: "Chill Vibes", url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" },
  { name: "Epic Cinematic", url: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_4080d6a5c0.mp3" },
  { name: "Lo-fi Beats", url: "https://cdn.pixabay.com/download/audio/2022/08/23/audio_d1718ab41b.mp3" },
];

export const MusicDialog = ({ isOpen, onClose, onSelectMusic }: MusicDialogProps) => {
  const [volume, setVolume] = useState(50);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [uploadedMusic, setUploadedMusic] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      toast.error("Please select an audio file");
      return;
    }

    const url = URL.createObjectURL(file);
    setUploadedMusic(url);
    setSelectedMusic(url);
    toast.success("Music uploaded!");
  };

  const handleApply = () => {
    if (!selectedMusic) {
      toast.error("Please select music");
      return;
    }
    onSelectMusic(selectedMusic, volume / 100);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end">
      <div className="w-full bg-background rounded-t-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Add Music</h2>
          <button onClick={onClose} className="text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Upload Music */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Your Music
            </Button>
          </div>

          {/* Preset Music */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Preset Music</h3>
            <div className="space-y-2">
              {PRESET_MUSIC.map((music) => (
                <button
                  key={music.name}
                  onClick={() => setSelectedMusic(music.url)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-smooth ${
                    selectedMusic === music.url
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <Music2 className="w-5 h-5" />
                  <span className="text-sm font-medium">{music.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Volume Control */}
          {selectedMusic && (
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Volume</label>
                <span className="text-sm text-muted-foreground">{volume}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={(v) => setVolume(v[0])}
                min={0}
                max={100}
                step={1}
              />
            </div>
          )}

          <Button onClick={handleApply} className="w-full" disabled={!selectedMusic}>
            Apply Music
          </Button>
        </div>
      </div>
    </div>
  );
};
