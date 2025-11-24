import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Home, Users, Plus, User, Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow";
  is_read: boolean;
  created_at: string;
  actor: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  video_id?: string;
}

const Inbox = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    subscribeToNotifications();

    return () => {
      supabase.channel("notifications").unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/");
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select(`
          id,
          type,
          is_read,
          created_at,
          video_id,
          actor:profiles!notifications_actor_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedData = (data || []).map((notif: any) => ({
        ...notif,
        actor: notif.actor,
      }));

      setNotifications(formattedData);
      setUnreadCount(formattedData.filter((n: Notification) => !n.is_read).length);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        async (payload) => {
          // Fetch the full notification with actor data
          const { data } = await supabase
            .from("notifications")
            .select(`
              id,
              type,
              is_read,
              created_at,
              video_id,
              actor:profiles!notifications_actor_id_fkey (
                username,
                display_name,
                avatar_url
              )
            `)
            .eq("id", payload.new.id)
            .single();

          if (data) {
            const formattedNotif: Notification = {
              id: data.id,
              type: data.type as "like" | "comment" | "follow",
              is_read: data.is_read,
              created_at: data.created_at,
              video_id: data.video_id,
              actor: data.actor as any,
            };
            setNotifications((prev) => [formattedNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
            toast.success("New notification!");
          }
        }
      )
      .subscribe();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error: any) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) return date.toLocaleDateString();
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const getNotificationText = (notification: Notification) => {
    const name = notification.actor.display_name || notification.actor.username;
    
    switch (notification.type) {
      case "like":
        return `${name} liked your video`;
      case "comment":
        return `${name} commented on your video`;
      case "follow":
        return `${name} started following you`;
      default:
        return "";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-sm min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
      </header>

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 p-4">
            <Bell className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No notifications yet
            </p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              When people like, comment, or follow you, you'll see it here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  if (!notification.is_read) {
                    markAsRead(notification.id);
                  }
                  if (notification.video_id) {
                    navigate("/feed");
                  }
                }}
                className={`flex gap-3 p-4 cursor-pointer hover:bg-muted transition-smooth ${
                  !notification.is_read ? "bg-primary/5" : ""
                }`}
              >
                <img
                  src={
                    notification.actor.avatar_url ||
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                  }
                  alt={notification.actor.username}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-foreground">
                      {getNotificationText(notification)}
                    </p>
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(notification.created_at)}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 flex h-20 items-center justify-around bg-background border-t border-border">
        <button
          onClick={() => navigate("/feed")}
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-smooth"
        >
          <Home className="w-7 h-7" />
          <p className="text-xs font-medium">Home</p>
        </button>
        <button
          onClick={() => navigate("/community")}
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-smooth"
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
        <button className="flex flex-col items-center gap-1 text-foreground">
          <div className="relative">
            <Bell className="w-7 h-7" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs font-bold">Inbox</p>
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-smooth"
        >
          <User className="w-7 h-7" />
          <p className="text-xs font-medium">Profile</p>
        </button>
      </nav>
    </div>
  );
};

export default Inbox;
