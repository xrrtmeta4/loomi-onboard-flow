import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Home, Users, Plus, Inbox, User, Settings, Grid3X3, Heart, Share2, ChevronLeft, Upload, Camera, Trash2, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { FollowButton } from "@/components/FollowButton";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { RecentFollowersCarousel } from "@/components/RecentFollowersCarousel";

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"videos" | "liked">("videos");
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [likedVideos, setLikedVideos] = useState<any[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      subscribeToVideoLikes(user.id);
    }
  }, [user]);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      await getProfile(user.id);
      subscribeToProfile(user.id);
    } else {
      navigate("/auth");
    }
    setLoading(false);
  };

  const subscribeToVideoLikes = (userId: string) => {
    // Subscribe to video_likes changes
    const likesChannel = supabase
      .channel('video-likes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_likes',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Video like change:', payload);
          // Refetch liked videos when there's a change
          fetchLikedVideos(userId);
        }
      )
      .subscribe();

    // Subscribe to videos table to update like counts in real-time
    const videosChannel = supabase
      .channel('user-videos-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'videos',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Video update:', payload);
          // Update the specific video in the list
          setUserVideos((prev) =>
            prev.map((video) =>
              video.id === payload.new.id ? { ...video, ...payload.new } : video
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(videosChannel);
    };
  };

  const subscribeToProfile = (userId: string) => {
    const profileChannel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log('Profile updated:', payload);
          setProfile(payload.new);
        }
      )
      .subscribe();

    // Subscribe to follows table to get immediate updates
    const followsChannel = supabase
      .channel('follows-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${userId}`
        },
        (payload) => {
          console.log('Follow change (follower):', payload);
          // The profile will be updated by the trigger, which will trigger the profile update above
          // But we can show a toast notification
          if (payload.eventType === 'INSERT') {
            toast.success("New follower!");
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `follower_id=eq.${userId}`
        },
        (payload) => {
          console.log('Follow change (following):', payload);
          // The profile will be updated by the trigger
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(followsChannel);
    };
  };

  const getProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    setProfile(data);
    setFormData({
      username: data.username || "",
      display_name: data.display_name || "",
      bio: data.bio || "",
      avatar_url: data.avatar_url || "",
    });
    fetchUserVideos(userId);
    fetchLikedVideos(userId);
  };

  const fetchUserVideos = async (userId: string) => {
    setVideosLoading(true);
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserVideos(data || []);
    } catch (error: any) {
      console.error("Error fetching user videos:", error);
      toast.error("Failed to load videos");
    } finally {
      setVideosLoading(false);
    }
  };

  const fetchLikedVideos = async (userId: string) => {
    setVideosLoading(true);
    try {
      const { data, error } = await supabase
        .from("video_likes")
        .select(`
          video_id,
          videos (
            id,
            video_url,
            thumbnail_url,
            title,
            description,
            like_count,
            comment_count,
            created_at,
            user_id
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const videos = data?.map((item: any) => item.videos).filter(Boolean) || [];
      setLikedVideos(videos);
    } catch (error: any) {
      console.error("Error fetching liked videos:", error);
      toast.error("Failed to load liked videos");
    } finally {
      setVideosLoading(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!videoToDelete || !user) return;

    try {
      // Delete video record from database
      const { error: dbError } = await supabase
        .from("videos")
        .delete()
        .eq("id", videoToDelete)
        .eq("user_id", user.id);

      if (dbError) throw dbError;

      toast.success("Video deleted successfully");
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
      fetchUserVideos(user.id);
    } catch (error: any) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    }
  };

  const handleUpdate = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update(formData)
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update profile");
      console.error(error);
      return;
    }

    toast.success("Profile updated successfully!");
    setIsEditing(false);
    getProfile(user.id);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Delete old avatar if exists
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (existingFiles && existingFiles.length > 0) {
        await supabase.storage
          .from('avatars')
          .remove([`${user.id}/${existingFiles[0].name}`]);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setFormData({ ...formData, avatar_url: publicUrl });
      toast.success("Avatar updated successfully!");
      await getProfile(user.id);
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 glass backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => navigate("/feed")} className="flex items-center gap-2 text-foreground">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{profile?.username || "Profile"}</h1>
          <button onClick={() => setIsEditing(!isEditing)} className="text-foreground">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <main className="flex-1 p-4">
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-4 pb-6">
          <div className="relative group">
            <div
              className="w-24 h-24 rounded-full bg-cover bg-center border-4 border-border cursor-pointer"
              style={{
                backgroundImage: profile?.avatar_url
                  ? `url(${profile.avatar_url})`
                  : 'url("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop")',
              }}
              onClick={() => fileInputRef.current?.click()}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth"
              disabled={uploading}
            >
              {uploading ? "..." : <Camera className="w-4 h-4" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          
          {isEditing ? (
            <div className="w-full max-w-md space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Username</label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Display Name</label>
                <Input
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Display Name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Bio</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Avatar URL</label>
                <Input
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdate} className="flex-1">Save Changes</Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <h2 className="text-xl font-bold text-foreground">{profile?.display_name || "User"}</h2>
                  {profile?.is_verified && (
                    <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500" />
                  )}
                </div>
                <p className="text-muted-foreground">@{profile?.username || "username"}</p>
              </div>

              {profile?.bio && (
                <p className="text-center text-foreground max-w-md">{profile.bio}</p>
              )}

              <div className="flex gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-foreground">
                    <AnimatedCounter value={profile?.following_count || 0} />
                  </p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    <AnimatedCounter value={profile?.follower_count || 0} />
                  </p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">0</p>
                  <p className="text-sm text-muted-foreground">Likes</p>
                </div>
              </div>

              <div className="flex gap-2 w-full max-w-xs">
                <Button variant="default" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button onClick={() => supabase.auth.signOut().then(() => navigate("/auth"))} variant="outline" className="flex-1">
                  Sign Out
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Recent Followers Carousel */}
        {user && !isEditing && (
          <RecentFollowersCarousel userId={user.id} />
        )}

        {/* Tabs */}
        {!isEditing && (
          <>
            <div className="border-b border-border mb-4">
              <div className="flex justify-around">
                <button
                  onClick={() => setActiveTab("videos")}
                  className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 flex-1 transition-smooth ${
                    activeTab === "videos"
                      ? "border-b-primary text-primary"
                      : "border-b-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5 mb-1" />
                  <p className="text-xs font-medium">Videos</p>
                </button>
                <button
                  onClick={() => setActiveTab("liked")}
                  className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 flex-1 transition-smooth ${
                    activeTab === "liked"
                      ? "border-b-primary text-primary"
                      : "border-b-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Heart className="w-5 h-5 mb-1" />
                  <p className="text-xs font-medium">Liked</p>
                </button>
              </div>
            </div>

            {/* Videos Grid */}
            {videosLoading ? (
              <div className="flex justify-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                {activeTab === "videos" && (
                  <>
                    {userVideos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Grid3X3 className="w-16 h-16 text-muted-foreground mb-4" />
                        <p className="text-foreground font-medium">No videos yet</p>
                        <p className="text-muted-foreground text-sm mt-1 mb-4">
                          Start creating to see your videos here
                        </p>
                        <Button onClick={() => navigate("/create")} className="gap-2">
                          <Upload className="w-4 h-4" />
                          Upload Video
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-1">
                        {userVideos.map((video) => (
                          <div key={video.id} className="relative aspect-[9/16] group">
                            <div
                              className="w-full h-full bg-cover bg-center cursor-pointer"
                              style={{
                                backgroundImage: `url(${
                                  video.thumbnail_url ||
                                  "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=700&fit=crop"
                                })`,
                              }}
                              onClick={() => navigate(`/feed`)}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setVideoToDelete(video.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs">
                              <Heart className="w-3 h-3 fill-current" />
                              <span>{video.like_count || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === "liked" && (
                  <>
                    {likedVideos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Heart className="w-16 h-16 text-muted-foreground mb-4" />
                        <p className="text-foreground font-medium">No liked videos</p>
                        <p className="text-muted-foreground text-sm mt-1">
                          Videos you like will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-1">
                        {likedVideos.map((video) => (
                          <div
                            key={video.id}
                            className="relative aspect-[9/16] cursor-pointer"
                            onClick={() => navigate(`/feed`)}
                          >
                            <div
                              className="w-full h-full bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${
                                  video.thumbnail_url ||
                                  "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=700&fit=crop"
                                })`,
                              }}
                            />
                            <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs">
                              <Heart className="w-3 h-3 fill-current" />
                              <span>{video.like_count || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 glass backdrop-blur-sm border-t border-border">
        <div className="flex justify-around items-center h-20">
          <button
            onClick={() => navigate("/feed")}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-smooth"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => navigate("/community")}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-smooth"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs font-medium">Communities</span>
          </button>
          <button
            onClick={() => navigate("/create")}
            className="w-14 h-14 rounded-xl bg-primary-purple text-primary-purple-foreground flex items-center justify-center shadow-lg shadow-primary-purple/30 transform -translate-y-4 hover:bg-primary-purple/90 transition-smooth"
          >
            <Plus className="w-8 h-8" />
          </button>
          <button
            onClick={() => navigate("/inbox")}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-smooth"
          >
            <Inbox className="w-6 h-6" />
            <span className="text-xs font-medium">Inbox</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-primary">
            <User className="w-6 h-6 fill-current" />
            <span className="text-xs font-bold">Profile</span>
          </button>
        </div>
      </nav>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this video? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setVideoToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVideo} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
