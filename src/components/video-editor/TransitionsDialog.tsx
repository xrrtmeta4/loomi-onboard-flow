import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransitionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTransition: (transition: string) => void;
}

const TRANSITIONS = [
  { name: "Fade", value: "fade" },
  { name: "Slide", value: "slide" },
  { name: "Zoom", value: "zoom" },
  { name: "Wipe", value: "wipe" },
  { name: "Dissolve", value: "dissolve" },
  { name: "Flash", value: "flash" },
];

export const TransitionsDialog = ({ isOpen, onClose, onSelectTransition }: TransitionsDialogProps) => {
  const [selectedTransition, setSelectedTransition] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApply = () => {
    if (selectedTransition) {
      onSelectTransition(selectedTransition);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end">
      <div className="w-full bg-background rounded-t-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Transitions</h2>
          <button onClick={onClose} className="text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {TRANSITIONS.map((transition) => (
            <button
              key={transition.value}
              onClick={() => setSelectedTransition(transition.value)}
              className={`p-4 rounded-lg font-medium transition-smooth ${
                selectedTransition === transition.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {transition.name}
            </button>
          ))}
        </div>

        <Button onClick={handleApply} className="w-full" disabled={!selectedTransition}>
          Apply Transition
        </Button>
      </div>
    </div>
  );
};
