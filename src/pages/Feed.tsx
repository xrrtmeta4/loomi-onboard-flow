import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Users, Plus, Inbox, User, Play, Heart, MessageCircle, Repeat2, Bookmark, Share2, Music } from "lucide-react";

const Feed = () => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

  return (
    <div className="mx-auto max-w-sm min-h-screen bg-black overflow-hidden relative flex flex-col">
      {/* Header: Top Tabs */}
      <header className="absolute top-0 left-0 right-0 z-20 pt-10">
        <div className="flex border-b border-white/10 mx-4 justify-between">
          <button className="flex flex-col items-center justify-center border-b-[3px] border-b-white text-white pb-3 pt-4 flex-1">
            <p className="text-white text-sm font-bold leading-normal tracking-[0.015em]">For You</p>
          </button>
          <button className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-gray-400 pb-3 pt-4 flex-1 hover:text-white transition-smooth">
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Following</p>
          </button>
          <button 
            onClick={() => navigate("/community")}
            className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-gray-400 pb-3 pt-4 flex-1 hover:text-white transition-smooth"
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Communities</p>
          </button>
        </div>
      </header>

      {/* Main Content: Video Player */}
      <main className="relative flex-grow h-full w-full">
        {/* Video Background */}
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=800&fit=crop")'
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
          
          {/* Play Button */}
          <button className="z-10 flex shrink-0 items-center justify-center rounded-full size-20 bg-black/40 text-white/80 backdrop-blur-sm hover:bg-black/50 transition-smooth">
            <Play className="w-12 h-12 fill-current" />
          </button>
        </div>

        {/* UI Overlays */}
        <div className="relative z-10 flex flex-col justify-end h-full w-full pb-20">
          {/* Right Action Bar */}
          <aside className="absolute right-2 bottom-24 flex flex-col items-center gap-4">
            {/* Profile */}
            <div className="relative flex flex-col items-center">
              <img
                alt="Creator profile"
                className="size-12 rounded-full border-2 border-white object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
              />
              <button className="absolute -bottom-2.5 flex items-center justify-center size-5 rounded-full bg-primary-purple text-white hover:bg-primary-purple/90 transition-smooth">
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Like */}
            <div className="flex flex-col items-center gap-1 text-center text-white">
              <button 
                onClick={() => setLiked(!liked)}
                className="rounded-full bg-black/30 p-3 backdrop-blur-sm hover:bg-black/40 transition-smooth"
              >
                <Heart className={`w-7 h-7 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
              <p className="text-xs font-semibold leading-normal">1.2M</p>
            </div>

            {/* Comment */}
            <div className="flex flex-col items-center gap-1 text-center text-white">
              <button className="rounded-full bg-black/30 p-3 backdrop-blur-sm hover:bg-black/40 transition-smooth">
                <MessageCircle className="w-7 h-7" />
              </button>
              <p className="text-xs font-semibold leading-normal">8.5K</p>
            </div>

            {/* Remix */}
            <div className="flex flex-col items-center gap-1 text-center text-white">
              <button className="rounded-full bg-black/30 p-3 backdrop-blur-sm hover:bg-black/40 transition-smooth">
                <Repeat2 className="w-7 h-7" />
              </button>
              <p className="text-xs font-semibold leading-normal">Remix</p>
            </div>

            {/* Save */}
            <div className="flex flex-col items-center gap-1 text-center text-white">
              <button className="rounded-full bg-black/30 p-3 backdrop-blur-sm hover:bg-black/40 transition-smooth">
                <Bookmark className="w-7 h-7" />
              </button>
              <p className="text-xs font-semibold leading-normal">Save</p>
            </div>

            {/* Share */}
            <div className="flex flex-col items-center gap-1 text-center text-white">
              <button className="rounded-full bg-black/30 p-3 backdrop-blur-sm hover:bg-black/40 transition-smooth">
                <Share2 className="w-7 h-7" />
              </button>
              <p className="text-xs font-semibold leading-normal">Share</p>
            </div>
          </aside>

          {/* Bottom Content Info */}
          <div className="px-4 text-white pb-4">
            <p className="text-white text-base font-bold leading-normal pb-2">@sarah_creator</p>
            <p className="text-white/90 text-sm font-normal leading-normal pb-3">
              This is an amazing dance challenge! Who wants to try it next? #loomi #dancechallenge #fyp #trending
            </p>
            <div className="flex items-center gap-3 min-h-10 overflow-hidden">
              <Music className="text-white w-5 h-5 shrink-0" />
              <div className="flex-1 whitespace-nowrap overflow-hidden">
                <p className="text-white text-sm font-medium leading-normal animate-marquee inline-block">
                  Vibes - Catchy Beats & Lofi ♫ Trending Sound
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="absolute bottom-0 left-0 right-0 z-20 flex h-20 items-center justify-around bg-black text-gray-400">
        <button className="flex flex-col items-center gap-1 text-white transition-smooth">
          <Home className="w-7 h-7" />
          <p className="text-xs font-bold">Home</p>
        </button>
        <button 
          onClick={() => navigate("/community")}
          className="flex flex-col items-center gap-1 hover:text-white transition-smooth"
        >
          <Users className="w-7 h-7" />
          <p className="text-xs font-medium">Communities</p>
        </button>
        <button 
          onClick={() => navigate("/create")}
          className="flex h-12 w-16 items-center justify-center rounded-xl bg-primary-purple text-white hover:bg-primary-purple/90 transition-smooth"
        >
          <Plus className="w-8 h-8" />
        </button>
        <button 
          onClick={() => navigate("/inbox")}
          className="flex flex-col items-center gap-1 hover:text-white transition-smooth"
        >
          <Inbox className="w-7 h-7" />
          <p className="text-xs font-medium">Inbox</p>
        </button>
        <button 
          onClick={() => navigate("/profile")}
          className="flex flex-col items-center gap-1 hover:text-white transition-smooth"
        >
          <User className="w-7 h-7" />
          <p className="text-xs font-medium">Profile</p>
        </button>
      </nav>
    </div>
  );
};

export default Feed;
