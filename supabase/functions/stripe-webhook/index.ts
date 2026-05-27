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

const processedEvents = new Set<string>();

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret || !signature) {
      return new Response(JSON.stringify({ error: 'Webhook secret or signature missing' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (processedEvents.has(event.id)) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    processedEvents.add(event.id);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const chamaId = session.metadata?.chama_id;
        const plan = session.metadata?.plan;

        if (session.customer_email && !isValidEmail(session.customer_email)) {
          console.error(`Invalid email in session ${session.id}: ${session.customer_email}`);
        }

        if (chamaId && plan) {
          const { error } = await supabase
            .from('chamas')
            .update({ plan })
            .eq('id', chamaId);

          if (error) {
            console.error(`Failed to update chama ${chamaId} to plan ${plan}:`, error);
          } else {
            console.log(`Chama ${chamaId} upgraded to ${plan} plan`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const chamaId = invoice.metadata?.chama_id;
        console.error(`Payment failed for invoice ${invoice.id}, chama: ${chamaId ?? 'unknown'}`);

        if (chamaId) {
          await supabase
            .from('notifications')
            .insert({
              chama_id: chamaId,
              type: 'payment_failed',
              message: 'Your subscription payment failed. Please update your payment method.',
            });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const chamaId = subscription.metadata?.chama_id;
        console.log(`Subscription ${subscription.id} deleted, chama: ${chamaId ?? 'unknown'}`);

        if (chamaId) {
          await supabase
            .from('chamas')
            .update({ plan: 'free' })
            .eq('id', chamaId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const chamaId = subscription.metadata?.chama_id;
        const plan = subscription.metadata?.plan;

        if (chamaId && plan) {
          await supabase
            .from('chamas')
            .update({ plan })
            .eq('id', chamaId);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('stripe-webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
