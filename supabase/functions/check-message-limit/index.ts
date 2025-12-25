import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FREE_MESSAGE_LIMIT = 5;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const today = new Date().toISOString().split("T")[0];

    // Check subscription status
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .single();

    const isPremium = subscription?.status === "active";

    if (isPremium) {
      return new Response(JSON.stringify({ 
        canSend: true, 
        isPremium: true,
        messagesUsed: 0,
        messagesRemaining: -1,
        limit: -1
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get today's message count
    const { data: countData } = await supabase
      .from("daily_message_counts")
      .select("message_count")
      .eq("user_id", user.id)
      .eq("message_date", today)
      .single();

    const messagesUsed = countData?.message_count || 0;
    const canSend = messagesUsed < FREE_MESSAGE_LIMIT;

    return new Response(JSON.stringify({ 
      canSend,
      isPremium: false,
      messagesUsed,
      messagesRemaining: Math.max(0, FREE_MESSAGE_LIMIT - messagesUsed),
      limit: FREE_MESSAGE_LIMIT
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Check limit error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
