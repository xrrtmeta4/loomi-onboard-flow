import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Crown, Check, Loader2, AlertCircle } from "lucide-react";
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

interface Subscription {
  id: string;
  subscription_id: string | null;
  status: string;
  product_id: string | null;
  created_at: string;
  updated_at: string;
}

const SubscriptionManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate("/auth");
      return;
    }
    setUser(session.user);

    const { data: subData } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();

    setSubscription(subData);
    setIsLoading(false);
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

  const isPremium = subscription?.status === "active";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/chat")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Subscription</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your subscription status</CardDescription>
              </div>
              <Badge variant={isPremium ? "default" : "secondary"}>
                {isPremium ? "Premium" : "Free"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isPremium ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <Crown className="h-8 w-8" />
                  <div>
                    <p className="font-semibold text-lg">Premium Member</p>
                    <p className="text-sm text-muted-foreground">
                      Unlimited messages • Priority support
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Subscribed since {new Date(subscription?.created_at || "").toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <AlertCircle className="h-8 w-8" />
                  <div>
                    <p className="font-semibold text-lg text-foreground">Free Plan</p>
                    <p className="text-sm">Limited to 5 messages per day</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plans Comparison */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Free Plan */}
          <Card className={!isPremium ? "ring-2 ring-primary" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Free
                {!isPremium && <Badge variant="outline">Current</Badge>}
              </CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  5 messages per day
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  Access to all psychologists
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  Basic wellness tools
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className={isPremium ? "ring-2 ring-primary" : "bg-gradient-to-br from-primary/5 to-primary/10"}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Premium
                </span>
                {isPremium && <Badge>Current</Badge>}
              </CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">$6</span>
                <span className="text-muted-foreground">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  <strong>Unlimited</strong> messages
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  Priority AI responses
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  All wellness tools
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  Custom chat backgrounds
                </li>
              </ul>
              {!isPremium && (
                <Button 
                  onClick={handleUpgrade} 
                  className="w-full"
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Upgrade to Premium"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cancel Subscription */}
        {isPremium && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Cancel Subscription</CardTitle>
              <CardDescription>
                Your subscription will remain active until the end of the billing period.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will lose access to unlimited messages and premium features at the end of your billing period.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        toast({
                          title: "Contact Support",
                          description: "Please contact support to cancel your subscription.",
                        });
                      }}
                    >
                      Cancel Anyway
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManagement;
