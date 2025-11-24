import { useState, useRef } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface GreenScreenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGreenScreen: (backgroundUrl: string, threshold: number) => void;
}

export const GreenScreenDialog = ({ isOpen, onClose, onApplyGreenScreen }: GreenScreenDialogProps) => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(40);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const url = URL.createObjectURL(file);
    setBackgroundImage(url);
  };

  const handleApply = () => {
    if (!backgroundImage) {
      toast.error("Please select a background image");
      return;
    }
    onApplyGreenScreen(backgroundImage, threshold);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end">
      <div className="w-full bg-background rounded-t-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Green Screen</h2>
          <button onClick={onClose} className="text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Background Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {backgroundImage ? "Change Background" : "Upload Background"}
            </Button>
          </div>

          {/* Preview */}
          {backgroundImage && (
            <div className="rounded-lg overflow-hidden">
              <img src={backgroundImage} alt="Background" className="w-full h-40 object-cover" />
            </div>
          )}

          {/* Threshold Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Sensitivity</label>
              <span className="text-sm text-muted-foreground">{threshold}%</span>
            </div>
            <Slider
              value={[threshold]}
              onValueChange={(v) => setThreshold(v[0])}
              min={10}
              max={100}
              step={5}
            />
          </div>

          <Button onClick={handleApply} className="w-full" disabled={!backgroundImage}>
            Apply Green Screen
          </Button>
        </div>
      </div>
    </div>
  );
};
