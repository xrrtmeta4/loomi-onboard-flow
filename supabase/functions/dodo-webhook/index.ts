import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const eventType = body.type || body.event;
    const data = body.data || body;

    // Handle subscription events
    if (eventType === "subscription.active" || eventType === "subscription.created") {
      const userId = data.metadata?.user_id;
      const subscriptionId = data.subscription_id;
      const productId = data.product_id;

      if (userId) {
        console.log("Activating subscription for user:", userId);
        
        const { error } = await supabase
          .from("subscriptions")
          .upsert({
            user_id: userId,
            subscription_id: subscriptionId,
            product_id: productId,
            status: "active",
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

        if (error) {
          console.error("Error updating subscription:", error);
          throw error;
        }
        console.log("Subscription activated successfully");
      }
    } else if (eventType === "subscription.cancelled" || eventType === "subscription.expired") {
      const userId = data.metadata?.user_id;

      if (userId) {
        console.log("Cancelling subscription for user:", userId);
        
        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (error) {
          console.error("Error cancelling subscription:", error);
          throw error;
        }
        console.log("Subscription cancelled successfully");
      }
    } else if (eventType === "payment.succeeded") {
      // Payment succeeded - subscription should be active
      const userId = data.metadata?.user_id;
      const subscriptionId = data.subscription_id;

      if (userId && subscriptionId) {
        console.log("Payment succeeded for user:", userId);
        
        const { error } = await supabase
          .from("subscriptions")
          .upsert({
            user_id: userId,
            subscription_id: subscriptionId,
            status: "active",
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

        if (error) {
          console.error("Error updating subscription after payment:", error);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
