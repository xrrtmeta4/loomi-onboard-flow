import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Dodo Payments API URLs - use live.dodopayments.com for production
const DODO_API_URL = "https://live.dodopayments.com";

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
    const response = await fetch(`${DODO_API_URL}/checkout_sessions`, {
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
      
      return new Response(JSON.stringify({ 
        error: `Payment error: ${response.status}` 
      }), {
        status: response.status >= 500 ? 503 : response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("Checkout session created:", data.session_id);

    return new Response(JSON.stringify({ url: data.url, sessionId: data.session_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isNetworkError = errorMessage.includes("dns") || errorMessage.includes("network") || errorMessage.includes("fetch");
    
    return new Response(JSON.stringify({ 
      error: isNetworkError 
        ? "Payment service temporarily unavailable. Please try again later."
        : errorMessage 
    }), {
      status: isNetworkError ? 503 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
