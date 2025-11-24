import { useNavigate } from "react-router-dom";
import { Home, Users, Plus, Inbox as InboxIcon, User, Search, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";

const Inbox = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 glass backdrop-blur-sm border-b border-border">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
            <button className="text-foreground hover:text-primary transition-smooth">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border px-4">
          <div className="flex gap-6">
            <button className="flex flex-col items-center justify-center border-b-2 border-b-primary text-primary pb-3 pt-2">
              <p className="text-sm font-bold">All</p>
            </button>
            <button className="flex flex-col items-center justify-center border-b-2 border-b-transparent text-muted-foreground pb-3 pt-2 hover:text-foreground transition-smooth">
              <p className="text-sm font-bold">Unread</p>
            </button>
          </div>
        </div>
      </div>

      {/* Messages List - Empty State */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
          <InboxIcon className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">No messages yet</h2>
        <p className="text-muted-foreground max-w-sm">
          When someone sends you a message, it will appear here. Start following others and engage with the community!
        </p>
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
          <button className="flex flex-col items-center gap-1 text-primary">
            <InboxIcon className="w-6 h-6 fill-current" />
            <span className="text-xs font-bold">Inbox</span>
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

export default Inbox;
