import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Send, Mic, MicOff, Plus, Menu, X, Trash2, Sparkles, Crown, Loader2, Settings, User, CreditCard, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import WellnessTools from "@/components/WellnessTools";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Session {
  id: string;
  title: string;
  created_at: string;
}

interface MessageLimit {
  canSend: boolean;
  isPremium: boolean;
  messagesUsed: number;
  messagesRemaining: number;
  limit: number;
}

interface Profile {
  avatar_url: string | null;
  display_name: string | null;
  chat_background: string | null;
  selected_psychologist_id: string | null;
}

interface Psychologist {
  id: string;
  name: string;
  avatar_url: string | null;
}

const BACKGROUND_CLASSES: Record<string, string> = {
  default: "bg-background",
  forest: "bg-gradient-to-br from-green-900/20 to-emerald-800/20",
  ocean: "bg-gradient-to-br from-blue-900/20 to-cyan-800/20",
  sunset: "bg-gradient-to-br from-orange-900/20 to-pink-800/20",
  mountains: "bg-gradient-to-br from-slate-900/20 to-stone-800/20",
  meadow: "bg-gradient-to-br from-lime-900/20 to-green-800/20",
};

const TherapyChat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedPsychologist, setSelectedPsychologist] = useState<Psychologist | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wellnessToolsOpen, setWellnessToolsOpen] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [messageLimit, setMessageLimit] = useState<MessageLimit | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      loadSessions(session.user.id);
      loadProfile(session.user.id);
      checkMessageLimit();
    });
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("avatar_url, display_name, chat_background, selected_psychologist_id")
      .eq("id", userId)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);

      // Load selected psychologist if any
      if (profileData.selected_psychologist_id) {
        const { data: psychData } = await supabase
          .from("psychologists")
          .select("id, name, avatar_url")
          .eq("id", profileData.selected_psychologist_id)
          .maybeSingle();

        if (psychData) {
          setSelectedPsychologist(psychData);
        }
      }
    }
  };

  const checkMessageLimit = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-message-limit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessageLimit(data);
      }
    } catch (error) {
      console.error("Error checking message limit:", error);
    }
  };

  const incrementMessageCount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/increment-message-count`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      // Refresh the limit
      await checkMessageLimit();
    } catch (error) {
      console.error("Error incrementing message count:", error);
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    setIsCheckingOut(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            returnUrl: window.location.href,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const loadSessions = async (userId: string) => {
    const { data, error } = await supabase
      .from("therapy_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading sessions:", error);
      return;
    }

    setSessions(data || []);
    if (data && data.length > 0) {
      loadSession(data[0].id);
    }
  };

  const loadSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    const { data, error } = await supabase
      .from("therapy_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    setMessages(
      (data || []).map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
      }))
    );
    setSidebarOpen(false);
  };

  const createNewSession = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("therapy_sessions")
      .insert({ user_id: user.id, title: "New Session" })
      .select()
      .single();

    if (error) {
      toast({ title: "Error creating session", variant: "destructive" });
      return;
    }

    setSessions((prev) => [data, ...prev]);
    setCurrentSessionId(data.id);
    setMessages([]);
    setSidebarOpen(false);
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from("therapy_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      toast({ title: "Error deleting session", variant: "destructive" });
      return;
    }

    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
  };

  const clearConversation = async () => {
    if (!currentSessionId) return;

    const { error } = await supabase
      .from("therapy_messages")
      .delete()
      .eq("session_id", currentSessionId);

    if (error) {
      toast({ title: "Error clearing conversation", variant: "destructive" });
      return;
    }

    setMessages([]);
    toast({ title: "Conversation cleared" });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    if (!currentSessionId || !user) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Save user message to database
    await supabase.from("therapy_messages").insert({
      session_id: currentSessionId,
      user_id: user.id,
      role: "user",
      content: userMessage,
    });

    // Update session title if first message
    if (messages.length === 0) {
      const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "");
      await supabase
        .from("therapy_sessions")
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", currentSessionId);
      setSessions((prev) =>
        prev.map((s) => (s.id === currentSessionId ? { ...s, title } : s))
      );
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/therapy-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let assistantId = crypto.randomUUID();

      // Add empty assistant message
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      let buffer = "";
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Save assistant message to database
      await supabase.from("therapy_messages").insert({
        session_id: currentSessionId,
        user_id: user.id,
        role: "assistant",
        content: assistantContent,
      });

      // Update session timestamp
      await supabase
        .from("therapy_sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", currentSessionId);

    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Check message limit for free users
    if (messageLimit && !messageLimit.isPremium && !messageLimit.canSend) {
      setShowUpgradeDialog(true);
      return;
    }

    if (!currentSessionId) {
      await createNewSession();
    }

    // Increment message count for free users
    if (messageLimit && !messageLimit.isPremium) {
      await incrementMessageCount();
    }

    const message = input.trim();
    setInput("");
    await streamChat(message);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      toast({ title: "Voice recording stopped" });
    } else {
      setIsRecording(true);
      toast({ title: "Voice recording started", description: "Speak now..." });
      // Voice recording would integrate with a speech-to-text service
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleMeditationSelect = async (prompt: string) => {
    if (!currentSessionId) {
      await createNewSession();
    }
    setInput("");
    await streamChat(prompt);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  const chatBackground = profile?.chat_background || "default";

  return (
    <div className={cn("min-h-screen flex", BACKGROUND_CLASSES[chatBackground] || BACKGROUND_CLASSES.default)}>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary">Loomi</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 space-y-2">
            <Button onClick={createNewSession} className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
            <Button
              onClick={() => {
                setSidebarOpen(false);
                setWellnessToolsOpen(true);
              }}
              className="w-full"
              variant="secondary"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Wellness Tools
            </Button>
          </div>

          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2 pb-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => loadSession(session.id)}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer flex items-center justify-between group transition-colors",
                    currentSessionId === session.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <span className="truncate text-sm">{session.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => deleteSession(session.id, e)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border space-y-1">
            <Button 
              variant="ghost" 
              onClick={() => { setSidebarOpen(false); navigate("/profile"); }} 
              className="w-full justify-start"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => { setSidebarOpen(false); navigate("/subscription"); }} 
              className="w-full justify-start"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Subscription
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center px-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="font-medium truncate flex-1">
            {currentSessionId
              ? sessions.find((s) => s.id === currentSessionId)?.title || "Chat"
              : "Start a new conversation"}
          </h2>
          {currentSessionId && messages.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Eraser className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Conversation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all messages in this session. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearConversation}>Clear</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWellnessToolsOpen(true)}
            className="hidden lg:flex gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Wellness Tools
          </Button>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-4xl">🧠</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Welcome to Loomi</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  I'm here to listen and support you. Feel free to share what's on your
                  mind – this is a safe, judgment-free space.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-4",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={selectedPsychologist?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10">
                      <span className="text-sm">🧠</span>
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-4 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={selectedPsychologist?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10">
                    <span className="text-sm">🧠</span>
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Share what's on your mind..."
                className="min-h-[52px] max-h-32 resize-none pr-24"
                disabled={isLoading}
              />
              <div className="absolute right-2 bottom-2 flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant={isRecording ? "destructive" : "ghost"}
                  onClick={toggleRecording}
                  className="h-8 w-8"
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="h-8 w-8"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
          {messageLimit && !messageLimit.isPremium && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              {messageLimit.messagesRemaining} of {messageLimit.limit} free messages remaining today
            </p>
          )}
          <p className="text-xs text-muted-foreground text-center mt-1">
            Loomi is an AI companion. For serious concerns, please consult a professional.
          </p>
        </div>
      </div>

      <WellnessTools
        isOpen={wellnessToolsOpen}
        onClose={() => setWellnessToolsOpen(false)}
        onSelectMeditation={handleMeditationSelect}
      />

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Upgrade to Premium
            </DialogTitle>
            <DialogDescription>
              You've used all 5 free messages for today. Upgrade to Premium for unlimited conversations with Loomi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
              <h4 className="font-semibold text-lg">Premium Plan</h4>
              <p className="text-3xl font-bold mt-2">$6<span className="text-base font-normal text-muted-foreground">/month</span></p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Unlimited daily messages
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Priority AI responses
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> All wellness tools included
                </li>
              </ul>
            </div>
            <Button 
              onClick={handleUpgrade} 
              className="w-full" 
              size="lg"
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TherapyChat;
