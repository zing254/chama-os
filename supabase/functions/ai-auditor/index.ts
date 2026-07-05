import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const cronSecret = req.headers.get('x-cron-secret');
    const cronAllowed = Deno.env.get('CRON_SECRET') ?? '';

    if (!authHeader && cronSecret !== cronAllowed) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const geminiKey = Deno.env.get('VITE_GEMINI_API_KEY') ?? '';
    const atUsername = Deno.env.get('AT_USERNAME') ?? '';
    const atApiKey = Deno.env.get('AT_API_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader ?? `Bearer ${supabaseKey}` } },
    });

    if (cronSecret !== cronAllowed) {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const { data: chamas } = await supabase.from('chamas').select('id, name');

    if (!chamas?.length) {
      return new Response(JSON.stringify({ ok: true, results: [] }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const results: Array<{
      chamaId: string;
      chamaName: string;
      totalCollected: number;
      totalKitty: number;
      totalLoaned: number;
      memberCount: number;
      sent: number;
      summary: string;
    }> = [];

    for (const chama of chamas) {
      const { data: contributions } = await supabase
        .from('contributions')
        .select('amount')
        .eq('chama_id', chama.id)
        .eq('status', 'paid')
        .gte('date', oneWeekAgo);

      const { data: loans } = await supabase
        .from('loans')
        .select('amount')
        .eq('chama_id', chama.id)
        .gte('disbursed_date', oneWeekAgo);

      const { count: memberCount } = await supabase
        .from('profiles')
        .select('*', { head: true, count: 'exact' })
        .eq('chama_id', chama.id);

      const totalCollected = contributions?.reduce((sum, c) => sum + Number(c.amount), 0) ?? 0;
      const totalLoaned = loans?.reduce((sum, l) => sum + Number(l.amount), 0) ?? 0;
      const totalKitty = totalCollected - totalLoaned;

      let summary = '';

      if (geminiKey) {
        try {
          const prompt = `You are a friendly chama auditor. Write a 3-4 sentence weekly summary for the chama "${chama.name}". Include these stats: KSh ${totalCollected} collected, KSh ${totalKitty} in kitty, KSh ${totalLoaned} in loans, ${memberCount} members. Mix English and Kiswahili naturally. End with "Reply PING to confirm or DISPUTE to flag an issue."`;

          const geminiResp = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            },
          );

          const geminiData = await geminiResp.json();
          summary = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        } catch (err) {
          console.error(`Gemini call failed for chama ${chama.id}:`, err);
        }
      }

      if (!summary) {
        summary = `Weekly summary: Collected KSh ${totalCollected}, Kitty KSh ${totalKitty}, Loans KSh ${totalLoaned}, Members ${memberCount}. Reply PING to confirm or DISPUTE to flag.`;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('phone')
        .eq('chama_id', chama.id)
        .not('phone', 'is', null);

      let sent = 0;

      if (profiles?.length && atUsername && atApiKey) {
        for (const profile of profiles) {
          if (!profile.phone) continue;
          try {
            const waNumber = profile.phone.startsWith('+') ? profile.phone.slice(1) : profile.phone;
            const formData = new URLSearchParams();
            formData.append('username', atUsername);
            formData.append('to', waNumber);
            formData.append('message', summary);

            const waResp = await fetch('https://api.sandbox.africastalking.com/version1/messaging', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'ApiKey': atApiKey,
              },
              body: formData.toString(),
            });

            if (waResp.ok) sent++;
          } catch (err) {
            console.error(`Failed to send to ${profile.phone}:`, err);
          }
        }
      }

      results.push({
        chamaId: chama.id,
        chamaName: chama.name,
        totalCollected,
        totalKitty,
        totalLoaned,
        memberCount: memberCount ?? 0,
        sent,
        summary,
      });
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('ai-auditor error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
