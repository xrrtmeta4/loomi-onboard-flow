import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon } from "lucide-react";

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
            emailRedirectTo: `${window.location.origin}/feed`,
          },
        });

        if (error) throw error;

        if (data.user) {
          toast.success("Account created! Redirecting...");
          navigate("/feed");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        toast.success("Logged in successfully!");
        navigate("/feed");
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
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 h-1/2 w-3/4 bg-primary-purple/20 dark:bg-primary-purple/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-1/4 right-0 h-1/2 w-1/2 bg-primary-purple/20 dark:bg-primary-purple/10 rounded-full blur-3xl opacity-40" />
      </div>

      <main className="relative z-10 flex w-full max-w-md flex-col items-center justify-center px-4 py-8 text-center sm:py-12">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <svg
            className="text-primary-purple"
            fill="none"
            height="32"
            viewBox="0 0 32 32"
            width="32"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 3.5C9.09644 3.5 3.5 9.09644 3.5 16C3.5 22.9036 9.09644 28.5 16 28.5C22.9036 28.5 28.5 22.9036 28.5 16C28.5 9.09644 22.9036 3.5 16 3.5Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
            <path
              d="M16 10.5V16L21.5 18.75"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
          </svg>
          <h1 className="text-4xl font-extrabold text-foreground">Loomi</h1>
        </div>

        {/* Headline */}
        <h2 className="text-foreground tracking-tight text-3xl sm:text-4xl font-bold leading-tight pb-10">
          Your community is waiting.
        </h2>

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

          <Button type="submit" variant="primary-purple" className="w-full h-14" disabled={loading}>
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        {/* Toggle Login/Signup */}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-muted-foreground text-sm font-normal leading-normal pt-8 underline cursor-pointer hover:text-foreground transition-smooth"
        >
          {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
        </button>

        {/* Legal */}
        <p className="text-muted-foreground text-xs font-normal leading-normal pt-12 max-w-xs">
          By signing up you agree to our{" "}
          <a className="font-medium underline hover:text-foreground transition-smooth" href="#">
            Terms of Service
          </a>{" "}
          and{" "}
          <a className="font-medium underline hover:text-foreground transition-smooth" href="#">
            Privacy Policy
          </a>
          .
        </p>
      </main>
    </div>
  );
};

export default Onboarding;
