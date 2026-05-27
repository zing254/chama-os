import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const stripeSecret = Deno.env.get('VITE_STRIPE_SECRET_KEY');
if (!stripeSecret) {
  console.error('VITE_STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(stripeSecret ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const PLANS: Record<string, { priceId: string; name: string }> = {
  starter: { priceId: 'price_1Tbox4GcXpG5kzwDEeo7L1Ow', name: 'Starter' },
  pro: { priceId: 'price_1Tbox6GcXpG5kzwDsiK6jMyB', name: 'Pro' },
  enterprise: { priceId: 'price_1Tbox8GcXpG5kzwDouIYZlg6', name: 'Enterprise' },
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { plan, email, chamaId } = await req.json();

    if (!plan || !email || !chamaId) {
      return new Response(JSON.stringify({ error: 'plan, email, and chamaId are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const planConfig = PLANS[plan];
    if (!planConfig) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: chama, error: chamaError } = await supabase
      .from('chamas')
      .select('id')
      .eq('id', chamaId)
      .single();

    if (chamaError || !chama) {
      return new Response(JSON.stringify({ error: 'Chama not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      customer_email: email,
      metadata: { chama_id: chamaId, plan },
      success_url: `${Deno.env.get('PUBLIC_SITE_URL') || 'http://localhost:5173'}/settings?payment=success`,
      cancel_url: `${Deno.env.get('PUBLIC_SITE_URL') || 'http://localhost:5173'}/settings?payment=cancelled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('stripe-checkout error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
