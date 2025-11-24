import { useNavigate } from "react-router-dom";
import { Home, Users, Plus, Inbox, User, Heart, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Community = () => {
  const navigate = useNavigate();

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
          <Button variant="secondary" className="h-9 px-4 shrink-0">
            Joined
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border px-4">
          <div className="flex gap-6 overflow-x-auto">
            <button className="flex flex-col items-center justify-center border-b-[3px] border-b-primary text-primary pb-3 pt-4 whitespace-nowrap">
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Feed</p>
            </button>
            <button className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-muted-foreground pb-3 pt-4 hover:text-foreground transition-smooth whitespace-nowrap">
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Q&A</p>
            </button>
            <button className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-muted-foreground pb-3 pt-4 hover:text-foreground transition-smooth whitespace-nowrap">
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Challenges</p>
            </button>
            <button className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-muted-foreground pb-3 pt-4 hover:text-foreground transition-smooth whitespace-nowrap">
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">Info</p>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {/* Challenge Banner Card */}
        <div className="p-4">
          <div className="flex flex-col items-stretch justify-between gap-4 rounded-xl glass-card p-4 shadow-sm border border-border">
            <div className="flex justify-between items-start gap-3">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <p className="text-foreground text-base font-bold leading-tight">
                  This Week: #RetroEdits Challenge
                </p>
                <p className="text-muted-foreground text-sm font-normal leading-normal">
                  Show off your best retro-style video edits and win a prize!
                </p>
              </div>
              <button className="text-muted-foreground hover:text-foreground transition-smooth shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div
              className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1614149162883-504ce0a27a2c?w=600&h=400&fit=crop")',
              }}
            />
            <Button variant="default" className="w-full h-10">
              View Challenge
            </Button>
          </div>
        </div>

        {/* Trending Topics */}
        <h3 className="text-foreground text-lg font-bold leading-tight tracking-tight px-4 pb-2 pt-4">
          Trending Topics
        </h3>
        <div className="flex gap-2 p-4 pt-1 overflow-x-auto">
          <div className="flex h-8 shrink-0 items-center justify-center gap-x-1.5 rounded-full bg-primary/20 text-primary px-3">
            <span className="material-symbols-outlined text-base">tag</span>
            <p className="text-sm font-medium leading-normal">#80sVibes</p>
          </div>
          <div className="flex h-8 shrink-0 items-center justify-center gap-x-1.5 rounded-full bg-secondary text-secondary-foreground px-3 hover:bg-secondary/80 transition-smooth cursor-pointer">
            <span className="material-symbols-outlined text-base">tag</span>
            <p className="text-sm font-medium leading-normal">#GlitchArt</p>
          </div>
          <div className="flex h-8 shrink-0 items-center justify-center gap-x-1.5 rounded-full bg-secondary text-secondary-foreground px-3 hover:bg-secondary/80 transition-smooth cursor-pointer">
            <span className="material-symbols-outlined text-base">tag</span>
            <p className="text-sm font-medium leading-normal">#VintageLook</p>
          </div>
          <div className="flex h-8 shrink-0 items-center justify-center gap-x-1.5 rounded-full bg-secondary text-secondary-foreground px-3 hover:bg-secondary/80 transition-smooth cursor-pointer">
            <span className="material-symbols-outlined text-base">tag</span>
            <p className="text-sm font-medium leading-normal">#VHS</p>
          </div>
        </div>

        {/* Video Feed */}
        <div className="grid grid-cols-1 gap-4 px-4">
          {/* Video Post 1 */}
          <div className="flex flex-col gap-3">
            <div
              className="bg-center bg-no-repeat aspect-[9/16] bg-cover rounded-xl w-full cursor-pointer hover:opacity-90 transition-smooth"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=700&fit=crop")',
              }}
            />
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full bg-cover bg-center shrink-0"
                style={{
                  backgroundImage:
                    'url("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop")',
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-bold text-sm">My latest neon edit, what do you think?</p>
                <p className="text-muted-foreground text-xs">Alex • 2 hours ago</p>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground shrink-0">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">1.2k</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">241</span>
                </div>
              </div>
            </div>
          </div>

          {/* Video Post 2 */}
          <div className="flex flex-col gap-3">
            <div
              className="bg-center bg-no-repeat aspect-[9/16] bg-cover rounded-xl w-full cursor-pointer hover:opacity-90 transition-smooth"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=700&fit=crop")',
              }}
            />
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full bg-cover bg-center shrink-0"
                style={{
                  backgroundImage:
                    'url("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop")',
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-bold text-sm">Testing out some new transition effects!</p>
                <p className="text-muted-foreground text-xs">Sarah • 5 hours ago</p>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground shrink-0">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">980</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">102</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
          <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-smooth">
            <Inbox className="w-6 h-6" />
            <span className="text-xs font-medium">Inbox</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-smooth">
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Community;
