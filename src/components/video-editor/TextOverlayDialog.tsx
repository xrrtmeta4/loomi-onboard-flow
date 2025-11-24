import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

interface TextOverlayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddText: (overlay: Omit<TextOverlay, "id">) => void;
}

export const TextOverlayDialog = ({
  isOpen,
  onClose,
  onAddText,
}: TextOverlayDialogProps) => {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [color, setColor] = useState("#ffffff");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!text.trim()) return;
    
    onAddText({
      text: text.trim(),
      x: 50,
      y: 50,
      fontSize,
      color,
    });
    setText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end">
      <div className="w-full bg-background rounded-t-3xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Add Text</h2>
          <button onClick={onClose} className="text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Text
            </label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text..."
              maxLength={100}
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Font Size</label>
              <span className="text-sm text-muted-foreground">{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={(v) => setFontSize(v[0])}
              min={16}
              max={72}
              step={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>

          <Button onClick={handleAdd} className="w-full" disabled={!text.trim()}>
            Add Text
          </Button>
        </div>
      </div>
    </div>
  );
};
