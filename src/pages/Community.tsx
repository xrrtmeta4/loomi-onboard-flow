import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Users, Plus, Inbox, User, Heart, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Community = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("feed");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    avatar_url: "",
  });

  const handleCreateCommunity = async () => {
    if (!newCommunity.name.trim()) {
      toast.error("Community name is required");
      return;
    }

    const { error } = await supabase
      .from("communities")
      .insert([newCommunity]);

    if (error) {
      toast.error("Failed to create community");
      console.error(error);
      return;
    }

    toast.success("Community created successfully!");
    setIsCreateDialogOpen(false);
    setNewCommunity({ name: "", description: "", avatar_url: "" });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 glass backdrop-blur-sm">
        {/* Top App Bar */}
        <div className="flex items-center p-4 pt-4 pb-2 justify-between">
          <div className="flex items-center gap-3">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop")',
              }}
            />
            <div className="flex flex-col flex-1 min-w-0">
              <h2 className="text-foreground text-lg font-bold leading-tight tracking-tight truncate">
                Video Editors Hub
              </h2>
              <p className="text-muted-foreground text-sm font-normal truncate">2.4M Members</p>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="h-9 px-4 shrink-0">
                Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Community</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium">Community Name</label>
                  <Input
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                    placeholder="e.g., Video Editors Hub"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                    placeholder="What's your community about?"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Avatar URL (optional)</label>
                  <Input
                    value={newCommunity.avatar_url}
                    onChange={(e) => setNewCommunity({ ...newCommunity, avatar_url: e.target.value })}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleCreateCommunity} className="w-full">
                  Create Community
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <div className="border-b border-border px-4">
          <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setActiveTab("feed")}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 whitespace-nowrap transition-smooth ${
                activeTab === "feed" 
                  ? "border-b-primary text-primary" 
                  : "border-b-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Feed</p>
            </button>
            <button 
              onClick={() => setActiveTab("qa")}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 whitespace-nowrap transition-smooth ${
                activeTab === "qa" 
                  ? "border-b-primary text-primary" 
                  : "border-b-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Q&A</p>
            </button>
            <button 
              onClick={() => setActiveTab("challenges")}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 whitespace-nowrap transition-smooth ${
                activeTab === "challenges" 
                  ? "border-b-primary text-primary" 
                  : "border-b-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Challenges</p>
            </button>
            <button 
              onClick={() => setActiveTab("info")}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 whitespace-nowrap transition-smooth ${
                activeTab === "info" 
                  ? "border-b-primary text-primary" 
                  : "border-b-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Info</p>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === "feed" && (
          <>
            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Users className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No posts yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Be the first to share something with this community!
              </p>
            </div>
          </>
        )}

        {activeTab === "qa" && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Q&A Coming Soon</h3>
            <p className="text-muted-foreground max-w-sm">
              Ask questions and get answers from the community
            </p>
          </div>
        )}

        {activeTab === "challenges" && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No Challenges</h3>
            <p className="text-muted-foreground max-w-sm">
              Check back later for exciting community challenges
            </p>
          </div>
        )}

        {activeTab === "info" && (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">About</h3>
              <p className="text-muted-foreground">
                A community for video editors to share tips, tricks, and showcase their work.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">Rules</h3>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2">
                <li>Be respectful to all members</li>
                <li>No spam or self-promotion</li>
                <li>Share quality content</li>
                <li>Give credit to original creators</li>
              </ol>
            </div>
          </div>
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
          <button className="flex flex-col items-center gap-1 text-primary">
            <Users className="w-6 h-6 fill-current" />
            <span className="text-xs font-bold">Communities</span>
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
          <button 
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-smooth"
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Community;
