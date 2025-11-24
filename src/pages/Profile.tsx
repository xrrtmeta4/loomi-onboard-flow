import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Home, Users, Plus, Inbox, User, Settings, Grid3X3, Heart, Share2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      await getProfile(user.id);
    } else {
      navigate("/onboarding");
    }
    setLoading(false);
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
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full bg-cover bg-center border-4 border-border"
              style={{
                backgroundImage: profile?.avatar_url
                  ? `url(${profile.avatar_url})`
                  : 'url("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop")',
              }}
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
                <h2 className="text-xl font-bold text-foreground">{profile?.display_name || "User"}</h2>
                <p className="text-muted-foreground">@{profile?.username || "username"}</p>
              </div>

              {profile?.bio && (
                <p className="text-center text-foreground max-w-md">{profile.bio}</p>
              )}

              <div className="flex gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-foreground">0</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">0</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">0</p>
                  <p className="text-sm text-muted-foreground">Likes</p>
                </div>
              </div>

              <Button variant="default" className="w-full max-w-xs">
                <Share2 className="w-4 h-4 mr-2" />
                Share Profile
              </Button>
            </>
          )}
        </div>

        {/* Tabs */}
        {!isEditing && (
          <>
            <div className="border-b border-border mb-4">
              <div className="flex justify-around">
                <button className="flex flex-col items-center justify-center border-b-2 border-b-primary text-primary pb-3 pt-2 flex-1">
                  <Grid3X3 className="w-5 h-5 mb-1" />
                  <p className="text-xs font-medium">Videos</p>
                </button>
                <button className="flex flex-col items-center justify-center border-b-2 border-b-transparent text-muted-foreground pb-3 pt-2 flex-1 hover:text-foreground transition-smooth">
                  <Heart className="w-5 h-5 mb-1" />
                  <p className="text-xs font-medium">Liked</p>
                </button>
              </div>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Grid3X3 className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-foreground font-medium">No videos yet</p>
              <p className="text-muted-foreground text-sm mt-1">Start creating to see your videos here</p>
            </div>
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
    </div>
  );
};

export default Profile;
