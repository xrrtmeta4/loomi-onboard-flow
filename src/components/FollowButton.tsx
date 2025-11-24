import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface FollowButtonProps {
  profileId: string;
  currentUserId: string | undefined;
  onFollowChange?: () => void;
}

export const FollowButton = ({ profileId, currentUserId, onFollowChange }: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUserId) {
      checkFollowStatus();
    }
  }, [currentUserId, profileId]);

  const checkFollowStatus = async () => {
    if (!currentUserId) return;

    const { data } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUserId)
      .eq("following_id", profileId)
      .single();

    setIsFollowing(!!data);
  };

  const handleFollow = async () => {
    if (!currentUserId) {
      toast.error("Please log in to follow users");
      return;
    }

    setLoading(true);

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", profileId);

        if (error) throw error;
        setIsFollowing(false);
        toast.success("Unfollowed");
      } else {
        const { error } = await supabase
          .from("follows")
          .insert([{ follower_id: currentUserId, following_id: profileId }]);

        if (error) throw error;
        setIsFollowing(true);
        toast.success("Following");
      }

      onFollowChange?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to update follow status");
    } finally {
      setLoading(false);
    }
  };

  if (currentUserId === profileId) return null;

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
    >
      {loading ? "..." : isFollowing ? "Following" : "Follow"}
    </Button>
  );
};
