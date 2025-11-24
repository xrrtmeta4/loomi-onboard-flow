import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Onboarding from "./pages/Onboarding";
import Topics from "./pages/Topics";
import Preferences from "./pages/Preferences";
import Feed from "./pages/Feed";
import Community from "./pages/Community";
import Create from "./pages/Create";
import Profile from "./pages/Profile";
import Inbox from "./pages/Inbox";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Install from "./pages/Install";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes - redirect to feed if authenticated */}
      <Route
        path="/"
        element={user ? <Navigate to="/feed" replace /> : <Onboarding />}
      />
      <Route
        path="/auth"
        element={user ? <Navigate to="/feed" replace /> : <Auth />}
      />
      <Route
        path="/topics"
        element={user ? <Navigate to="/feed" replace /> : <Topics />}
      />
      <Route path="/install" element={<Install />} />

      {/* Protected routes - require authentication */}
      <Route element={<ProtectedRoute />}>
        <Route path="/feed" element={<Feed />} />
        <Route path="/community" element={<Community />} />
        <Route path="/create" element={<Create />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/preferences" element={<Preferences />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
