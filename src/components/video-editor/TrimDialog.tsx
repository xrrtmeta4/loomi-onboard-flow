import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface TrimDialogProps {
  isOpen: boolean;
  onClose: () => void;
  duration: number;
  onTrim: (start: number, end: number) => void;
}

export const TrimDialog = ({ isOpen, onClose, duration, onTrim }: TrimDialogProps) => {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(duration);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleApply = () => {
    onTrim(start, end);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end">
      <div className="w-full bg-background rounded-t-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Trim Video</h2>
          <button onClick={onClose} className="text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Start Time</label>
              <span className="text-sm text-muted-foreground">{formatTime(start)}</span>
            </div>
            <Slider
              value={[start]}
              onValueChange={(v) => setStart(Math.min(v[0], end - 1))}
              min={0}
              max={duration}
              step={0.1}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-foreground">End Time</label>
              <span className="text-sm text-muted-foreground">{formatTime(end)}</span>
            </div>
            <Slider
              value={[end]}
              onValueChange={(v) => setEnd(Math.max(v[0], start + 1))}
              min={0}
              max={duration}
              step={0.1}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-foreground">
              Duration: <span className="font-semibold">{formatTime(end - start)}</span>
            </p>
          </div>

          <Button onClick={handleApply} className="w-full">
            Apply Trim
          </Button>
        </div>
      </div>
    </div>
  );
};
