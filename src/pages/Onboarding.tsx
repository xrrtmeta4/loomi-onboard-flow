import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon } from "lucide-react";
import loomiLogo from "@/assets/loomi-logo.jpg";

const Onboarding = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    display_name: "",
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
              display_name: formData.display_name,
            },
            emailRedirectTo: `${window.location.origin}/chat`,
          },
        });

        if (error) throw error;

        if (data.user) {
          toast.success("Account created! Redirecting...");
          navigate("/chat");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        toast.success("Logged in successfully!");
        navigate("/chat");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 h-1/2 w-3/4 bg-primary/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-1/4 right-0 h-1/2 w-1/2 bg-primary/20 rounded-full blur-3xl opacity-40" />
      </div>

      <main className="relative z-10 flex w-full max-w-md flex-col items-center justify-center px-4 py-8 text-center sm:py-12">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10">
            <img
              src={loomiLogo}
              alt="Loomi"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-4xl font-extrabold text-foreground">Loomi</h1>
        </div>

        {/* Headline */}
        <h2 className="text-foreground tracking-tight text-2xl sm:text-3xl font-bold leading-tight pb-2">
          Your AI Companion for Mental Wellness
        </h2>
        <p className="text-muted-foreground text-sm pb-8">
          Talk through your thoughts with a supportive AI therapist
        </p>

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="w-full space-y-4">
          {isSignUp && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Username
                </label>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="johndoe"
                  required={isSignUp}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Display Name
                </label>
                <Input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="John Doe"
                  required={isSignUp}
                  className="h-12"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              required
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
              minLength={6}
              className="h-12"
            />
          </div>

          <Button type="submit" className="w-full h-14" disabled={loading}>
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center mt-8 mb-4">
          <div className="space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">💬</span>
            </div>
            <p className="text-xs text-muted-foreground">Text Chat</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">🎙️</span>
            </div>
            <p className="text-xs text-muted-foreground">Voice Chat</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg">🔒</span>
            </div>
            <p className="text-xs text-muted-foreground">Private</p>
          </div>
        </div>

        {/* Toggle Login/Signup */}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-muted-foreground text-sm font-normal leading-normal pt-6 underline cursor-pointer hover:text-foreground"
        >
          {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
        </button>

        {/* Legal */}
        <p className="text-muted-foreground text-xs font-normal leading-normal pt-8 max-w-xs">
          By signing up you agree to our{" "}
          <a className="font-medium underline hover:text-foreground" href="#">
            Terms of Service
          </a>{" "}
          and{" "}
          <a className="font-medium underline hover:text-foreground" href="#">
            Privacy Policy
          </a>
          .
        </p>
      </main>
    </div>
  );
};

export default Onboarding;
