import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface Follower {
  id: string;
  follower_id: string;
  created_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface RecentFollowersCarouselProps {
  userId: string;
}

export const RecentFollowersCarousel = ({ userId }: RecentFollowersCarouselProps) => {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentFollowers();
    subscribeToNewFollowers();
  }, [userId]);

  const fetchRecentFollowers = async () => {
    try {
      const { data, error } = await supabase
        .from("follows")
        .select(`
          id,
          follower_id,
          created_at,
          profiles!follows_follower_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq("following_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setFollowers(data as any || []);
    } catch (error) {
      console.error("Error fetching recent followers:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNewFollowers = () => {
    const channel = supabase
      .channel("new-followers")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "follows",
          filter: `following_id=eq.${userId}`,
        },
        async (payload) => {
          console.log("New follower!", payload);
          
          // Fetch the full follower data
          const { data } = await supabase
            .from("follows")
            .select(`
              id,
              follower_id,
              created_at,
              profiles!follows_follower_id_fkey (
                username,
                display_name,
                avatar_url
              )
            `)
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setFollowers((prev) => [data as any, ...prev.slice(0, 9)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (loading || followers.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden py-4">
      <h3 className="text-sm font-semibold text-foreground mb-3 px-4">Recent Followers</h3>
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 scroll-smooth snap-x snap-mandatory">
          {followers.map((follower, index) => (
            <div
              key={follower.id}
              className="flex-shrink-0 snap-start animate-slide-in-right"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "both",
              }}
            >
              <div
                onClick={() => navigate(`/profile/${follower.follower_id}`)}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-primary/50 group-hover:border-primary transition-all group-hover:scale-110">
                    <AvatarImage
                      src={follower.profiles?.avatar_url || undefined}
                      alt={follower.profiles?.username}
                    />
                    <AvatarFallback>
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                </div>
                <span className="text-xs font-medium text-foreground max-w-[80px] truncate">
                  @{follower.profiles?.username}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
