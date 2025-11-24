import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpeedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSpeed: (speed: number) => void;
}

const SPEED_OPTIONS = [
  { label: "0.5x", value: 0.5 },
  { label: "0.75x", value: 0.75 },
  { label: "1x", value: 1 },
  { label: "1.25x", value: 1.25 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
];

export const SpeedDialog = ({ isOpen, onClose, onSelectSpeed }: SpeedDialogProps) => {
  const [selectedSpeed, setSelectedSpeed] = useState(1);

  if (!isOpen) return null;

  const handleApply = () => {
    onSelectSpeed(selectedSpeed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end">
      <div className="w-full bg-background rounded-t-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Playback Speed</h2>
          <button onClick={onClose} className="text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {SPEED_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedSpeed(option.value)}
              className={`p-4 rounded-lg font-medium transition-smooth ${
                selectedSpeed === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <Button onClick={handleApply} className="w-full">
          Apply Speed
        </Button>
      </div>
    </div>
  );
};
