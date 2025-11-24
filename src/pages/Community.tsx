import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Users, Plus, Inbox, User, Heart, MessageCircle, X, Send } from "lucide-react";
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
  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    avatar_url: "",
  });

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    if (activeTab === "qa") {
      fetchQuestions();
    }
  }, [activeTab, selectedCommunity]);

  const fetchCommunities = async () => {
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching communities:", error);
      return;
    }

    setCommunities(data || []);
    if (data && data.length > 0 && !selectedCommunity) {
      setSelectedCommunity(data[0]);
    }
  };

  const fetchQuestions = async () => {
    if (!selectedCommunity) return;

    const { data, error } = await supabase
      .from("community_posts")
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
      .eq("community_id", selectedCommunity.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching questions:", error);
      return;
    }

    setQuestions(data || []);
  };

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
    fetchCommunities();
  };

  const handleAskQuestion = async () => {
    if (!newQuestion.trim() || !selectedCommunity) {
      toast.error("Please enter a question");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to ask questions");
      navigate("/auth");
      return;
    }

    const { error } = await supabase
      .from("community_posts")
      .insert([{
        community_id: selectedCommunity.id,
        user_id: user.id,
        content: newQuestion,
      }]);

    if (error) {
      toast.error("Failed to post question");
      console.error(error);
      return;
    }

    toast.success("Question posted!");
    setNewQuestion("");
    fetchQuestions();
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
                backgroundImage: selectedCommunity?.avatar_url
                  ? `url(${selectedCommunity.avatar_url})`
                  : 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop")',
              }}
            />
            <div className="flex flex-col flex-1 min-w-0">
              <h2 className="text-foreground text-lg font-bold leading-tight tracking-tight truncate">
                {selectedCommunity?.name || "Communities"}
              </h2>
              <p className="text-muted-foreground text-sm font-normal truncate">
                {selectedCommunity?.member_count || 0} Members
              </p>
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
          <div className="p-4 space-y-4">
            {/* Ask Question */}
            <div className="glass-card p-4 rounded-xl border border-border space-y-3">
              <h3 className="text-lg font-bold text-foreground">Ask a Question</h3>
              <Textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="What would you like to know?"
                rows={3}
              />
              <Button onClick={handleAskQuestion} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Post Question
              </Button>
            </div>

            {/* Questions List */}
            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No questions yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  Be the first to ask a question!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <div key={question.id} className="glass-card p-4 rounded-xl border border-border">
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full bg-cover bg-center shrink-0"
                        style={{
                          backgroundImage: question.profiles?.avatar_url
                            ? `url(${question.profiles.avatar_url})`
                            : 'url("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop")',
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-bold text-foreground">@{question.profiles?.username || "User"}</p>
                        <p className="text-muted-foreground text-sm">{new Date(question.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-foreground mb-3">{question.content}</p>
                    <div className="flex items-center gap-4 text-muted-foreground text-sm">
                      <button className="flex items-center gap-1 hover:text-primary transition-smooth">
                        <Heart className="w-4 h-4" />
                        <span>{question.like_count || 0}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary transition-smooth">
                        <MessageCircle className="w-4 h-4" />
                        <span>{question.comment_count || 0}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
