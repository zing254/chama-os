import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';

webpush.setVapidDetails(
  'mailto:admin@chama-os.app',
  vapidPublicKey,
  vapidPrivateKey,
);

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { chamaId, title, body } = await req.json();

    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'title and body are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let query = supabase.from('push_subscriptions').select('*');
    if (chamaId) {
      const { data: members } = await supabase.from('profiles').select('user_id').eq('chama_id', chamaId);
      const userIds = members?.map(m => m.user_id) ?? [];
      query = query.in('user_id', userIds);
    }

    const { data: subscriptions, error: subError } = await query;
    if (subError) throw subError;
    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let sent = 0;
    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: sub.keys,
        };
        await webpush.sendNotification(pushSubscription, JSON.stringify({ title, body, icon: '/favicon.ico' }));
        sent++;
      } catch (err) {
        const statusCode = err?.statusCode;
        if (statusCode === 410 || statusCode === 404) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        }
      }
    }

    return new Response(JSON.stringify({ sent, total: subscriptions.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
