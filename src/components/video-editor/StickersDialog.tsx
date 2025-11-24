import { useState } from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StickersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker: (stickerUrl: string) => void;
}

const STICKERS = [
  { id: 1, url: "https://em-content.zobj.net/source/apple/391/fire_1f525.png", category: "emoji" },
  { id: 2, url: "https://em-content.zobj.net/source/apple/391/star-struck_1f929.png", category: "emoji" },
  { id: 3, url: "https://em-content.zobj.net/source/apple/391/hundred-points_1f4af.png", category: "emoji" },
  { id: 4, url: "https://em-content.zobj.net/source/apple/391/crown_1f451.png", category: "emoji" },
  { id: 5, url: "https://em-content.zobj.net/source/apple/391/gem-stone_1f48e.png", category: "emoji" },
  { id: 6, url: "https://em-content.zobj.net/source/apple/391/sparkles_2728.png", category: "emoji" },
  { id: 7, url: "https://em-content.zobj.net/source/apple/391/party-popper_1f389.png", category: "emoji" },
  { id: 8, url: "https://em-content.zobj.net/source/apple/391/flexed-biceps_1f4aa.png", category: "emoji" },
];

export const StickersDialog = ({ isOpen, onClose, onSelectSticker }: StickersDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredStickers = STICKERS.filter(sticker =>
    sticker.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end">
      <div className="w-full bg-background rounded-t-3xl p-6 animate-slide-up max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Stickers</h2>
          <button onClick={onClose} className="text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search stickers..."
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-4 gap-3 overflow-y-auto flex-1">
          {filteredStickers.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => {
                onSelectSticker(sticker.url);
                onClose();
              }}
              className="aspect-square rounded-lg bg-muted hover:bg-muted/80 p-2 transition-smooth flex items-center justify-center"
            >
              <img src={sticker.url} alt="Sticker" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
