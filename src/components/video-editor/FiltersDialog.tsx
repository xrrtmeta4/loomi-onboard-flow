import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

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
  { name: "Fade", css: "opacity(0.8) brightness(1.2)" },
  { name: "Sharp", css: "contrast(1.5) brightness(0.9)" },
  { name: "Sunset", css: "sepia(0.3) saturate(1.4) hue-rotate(-10deg)" },
  { name: "Arctic", css: "hue-rotate(200deg) saturate(1.3) brightness(1.1)" },
  { name: "Noir", css: "grayscale(1) contrast(1.8) brightness(0.9)" },
  { name: "Dream", css: "saturate(1.5) brightness(1.1) blur(0.5px)" },
  { name: "Neon", css: "saturate(2.5) contrast(1.3) brightness(1.2)" },
  { name: "Retro", css: "sepia(0.4) saturate(1.6) hue-rotate(-30deg)" },
  { name: "Pastel", css: "saturate(0.6) brightness(1.3) contrast(0.9)" },
  { name: "Cinematic", css: "saturate(0.8) contrast(1.2) brightness(0.95)" },
];

interface FiltersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFilter: (filter: Filter) => void;
  currentFilter: Filter;
}

export const FiltersDialog = ({
  isOpen,
  onClose,
  onSelectFilter,
  currentFilter,
}: FiltersDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end">
      <div className="w-full bg-background rounded-t-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Filters</h2>
          <button onClick={onClose} className="text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto">
          {FILTERS.map((filter) => (
            <button
              key={filter.name}
              onClick={() => {
                onSelectFilter(filter);
                onClose();
              }}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-smooth ${
                currentFilter.name === filter.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              <div
                className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-secondary"
                style={{ filter: filter.css }}
              />
              <span className="text-xs font-medium">{filter.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface EffectsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyEffect: (effect: { brightness: number; contrast: number; saturation: number }) => void;
}

export const EffectsDialog = ({ isOpen, onClose, onApplyEffect }: EffectsDialogProps) => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyEffect({ brightness, contrast, saturation });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end">
      <div className="w-full bg-background rounded-t-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Effects</h2>
          <button onClick={onClose} className="text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Brightness</label>
              <span className="text-sm text-muted-foreground">{brightness}%</span>
            </div>
            <Slider
              value={[brightness]}
              onValueChange={(v) => setBrightness(v[0])}
              min={0}
              max={200}
              step={1}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Contrast</label>
              <span className="text-sm text-muted-foreground">{contrast}%</span>
            </div>
            <Slider
              value={[contrast]}
              onValueChange={(v) => setContrast(v[0])}
              min={0}
              max={200}
              step={1}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Saturation</label>
              <span className="text-sm text-muted-foreground">{saturation}%</span>
            </div>
            <Slider
              value={[saturation]}
              onValueChange={(v) => setSaturation(v[0])}
              min={0}
              max={200}
              step={1}
            />
          </div>

          <Button onClick={handleApply} className="w-full">
            Apply Effects
          </Button>
        </div>
      </div>
    </div>
  );
};
