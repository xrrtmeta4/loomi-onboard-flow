import { useState } from "react";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface GifsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (gifUrl: string) => void;
}

const TRENDING_GIFS = [
  "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
  "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
  "https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif",
  "https://media.giphy.com/media/3oEjHWTuLfI3CFjHKo/giphy.gif",
  "https://media.giphy.com/media/26BRzozg4TCBXv6QU/giphy.gif",
  "https://media.giphy.com/media/3oEjHV0z8S7WM4MwnK/giphy.gif",
];

export const GifsDialog = ({ isOpen, onClose, onSelectGif }: GifsDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const handleSearch = () => {
    if (searchTerm.trim()) {
      toast.info("GIF search coming soon!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end">
      <div className="w-full bg-background rounded-t-3xl p-6 animate-slide-up max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">GIFs</h2>
          <button onClick={onClose} className="text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search GIFs..."
            className="pl-10"
          />
        </div>

        <h3 className="text-sm font-medium text-foreground mb-3">Trending</h3>
        <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1">
          {TRENDING_GIFS.map((gif, index) => (
            <button
              key={index}
              onClick={() => {
                onSelectGif(gif);
                onClose();
              }}
              className="aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-80 transition-smooth"
            >
              <img src={gif} alt="GIF" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
