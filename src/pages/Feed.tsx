import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Home, Users, Plus, Inbox, User, Heart, MessageCircle, Share2, Bookmark, Music } from "lucide-react";

interface Video {
  id: string;
  video_url: string;
  thumbnail_url: string | null;
  title: string | null;
  description: string | null;
  like_count: number;
  comment_count: number;
  user_id: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

const Feed = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchLikedVideos(user.id);
      }
    });

    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select(`
          *,
          profiles (
            username,
            display_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      console.error("Error fetching videos:", error);
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedVideos = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("video_likes")
        .select("video_id")
        .eq("user_id", userId);

      if (error) throw error;
      const liked = new Set(data?.map((like) => like.video_id) || []);
      setLikedVideos(liked);
    } catch (error: any) {
      console.error("Error fetching likes:", error);
    }
  };

  const handleLike = async (videoId: string) => {
    if (!user) {
      toast.error("Please sign in to like videos");
      navigate("/");
      return;
    }

    const isLiked = likedVideos.has(videoId);

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from("video_likes")
          .delete()
          .eq("video_id", videoId)
          .eq("user_id", user.id);

        setLikedVideos((prev) => {
          const newSet = new Set(prev);
          newSet.delete(videoId);
          return newSet;
        });

        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId ? { ...v, like_count: Math.max(0, v.like_count - 1) } : v
          )
        );
      } else {
        // Like
        await supabase.from("video_likes").insert({
          video_id: videoId,
          user_id: user.id,
        });

        setLikedVideos((prev) => new Set([...prev, videoId]));

        setVideos((prev) =>
          prev.map((v) => (v.id === videoId ? { ...v, like_count: v.like_count + 1 } : v))
        );
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleShare = async (video: Video) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title || "Check out this video on Loomi!",
          text: video.description || "",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  useEffect(() => {
    if (videoRef.current && videos[currentVideoIndex]) {
      videoRef.current.play().catch(console.error);
    }
  }, [currentVideoIndex, videos]);

  // Handle scroll to change videos
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollY = containerRef.current.scrollTop;
      const videoHeight = window.innerHeight;
      const newIndex = Math.round(scrollY / videoHeight);
      if (newIndex !== currentVideoIndex && newIndex < videos.length) {
        setCurrentVideoIndex(newIndex);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [currentVideoIndex, videos]);

  if (loading) {
    return (
      <div className="mx-auto max-w-sm min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading videos...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="mx-auto max-w-sm min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <p className="text-white text-lg mb-4">No videos yet</p>
        <button
          onClick={() => navigate("/create")}
          className="bg-primary-purple text-white px-6 py-3 rounded-lg hover:bg-primary-purple/90 transition-smooth"
        >
          Upload First Video
        </button>
      </div>
    );
  }

  const currentVideo = videos[currentVideoIndex];

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
      <main
        ref={containerRef}
        className="relative flex-grow h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="relative h-screen w-full snap-start flex items-center justify-center bg-black"
          >
            {/* Video */}
            {index === currentVideoIndex ? (
              <video
                ref={videoRef}
                src={video.video_url}
                className="absolute inset-0 w-full h-full object-cover"
                loop
                playsInline
                muted={false}
                poster={video.thumbnail_url || undefined}
              />
            ) : (
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${video.thumbnail_url})` }}
              />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />

            {/* UI Overlays */}
            <div className="relative z-10 flex flex-col justify-end h-full w-full pb-20">
              {/* Right Action Bar */}
              <aside className="absolute right-2 bottom-24 flex flex-col items-center gap-4">
                {/* Profile */}
                <div className="relative flex flex-col items-center">
                  <img
                    alt={video.profiles.display_name || video.profiles.username}
                    className="size-12 rounded-full border-2 border-white object-cover"
                    src={
                      video.profiles.avatar_url ||
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                    }
                  />
                  {user?.id !== video.user_id && (
                    <button className="absolute -bottom-2.5 flex items-center justify-center size-5 rounded-full bg-primary-purple text-white hover:bg-primary-purple/90 transition-smooth">
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Like */}
                <div className="flex flex-col items-center gap-1 text-center text-white">
                  <button
                    onClick={() => handleLike(video.id)}
                    className="rounded-full bg-black/30 p-3 backdrop-blur-sm hover:bg-black/40 transition-smooth"
                  >
                    <Heart
                      className={`w-7 h-7 ${
                        likedVideos.has(video.id) ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </button>
                  <p className="text-xs font-semibold leading-normal">
                    {video.like_count > 0 ? (video.like_count >= 1000 ? `${(video.like_count / 1000).toFixed(1)}K` : video.like_count) : "0"}
                  </p>
                </div>

                {/* Comment */}
                <div className="flex flex-col items-center gap-1 text-center text-white">
                  <button className="rounded-full bg-black/30 p-3 backdrop-blur-sm hover:bg-black/40 transition-smooth">
                    <MessageCircle className="w-7 h-7" />
                  </button>
                  <p className="text-xs font-semibold leading-normal">
                    {video.comment_count > 0 ? (video.comment_count >= 1000 ? `${(video.comment_count / 1000).toFixed(1)}K` : video.comment_count) : "0"}
                  </p>
                </div>

                {/* Bookmark */}
                <div className="flex flex-col items-center gap-1 text-center text-white">
                  <button className="rounded-full bg-black/30 p-3 backdrop-blur-sm hover:bg-black/40 transition-smooth">
                    <Bookmark className="w-7 h-7" />
                  </button>
                </div>

                {/* Share */}
                <div className="flex flex-col items-center gap-1 text-center text-white">
                  <button
                    onClick={() => handleShare(video)}
                    className="rounded-full bg-black/30 p-3 backdrop-blur-sm hover:bg-black/40 transition-smooth"
                  >
                    <Share2 className="w-7 h-7" />
                  </button>
                </div>
              </aside>

              {/* Bottom Content Info */}
              <div className="px-4 text-white pb-4">
                <p className="text-white text-base font-bold leading-normal pb-2">
                  @{video.profiles.username}
                </p>
                <p className="text-white/90 text-sm font-normal leading-normal pb-3">
                  {video.description || video.title || ""}
                </p>
                <div className="flex items-center gap-3 min-h-10 overflow-hidden">
                  <Music className="text-white w-5 h-5 shrink-0" />
                  <div className="flex-1 whitespace-nowrap overflow-hidden">
                    <p className="text-white text-sm font-medium leading-normal animate-marquee inline-block">
                      {video.title || "Original Sound"} ♫
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
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
