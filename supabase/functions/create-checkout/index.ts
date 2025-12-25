import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, returnUrl } = await req.json();
    const DODO_API_KEY = Deno.env.get("DODO_API_KEY");

    if (!DODO_API_KEY) {
      throw new Error("DODO_API_KEY is not configured");
    }

    console.log("Creating checkout session for user:", userId);

    // Create checkout session with Dodo Payments
    const response = await fetch("https://api.dodopayments.com/checkout_sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DODO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [
          {
            product_id: "pdt_0NUq7VsjGs5CmcJ6s1wlO",
            quantity: 1,
          },
        ],
        customer: {
          email: email,
        },
        metadata: {
          user_id: userId,
        },
        return_url: returnUrl || `${req.headers.get("origin")}/chat`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Dodo API error:", response.status, errorText);
      throw new Error(`Dodo API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Checkout session created:", data.session_id);

    return new Response(JSON.stringify({ url: data.url, sessionId: data.session_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
