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
    const { from, text, media, type } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const geminiKey = Deno.env.get('VITE_GEMINI_API_KEY') ?? '';
    const geminiModel = Deno.env.get('GEMINI_MODEL') || 'gemini-2.0-flash';
    const atUsername = Deno.env.get('AT_USERNAME') ?? '';
    const atApiKey = Deno.env.get('AT_API_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseKey);

    let session;
    const { data: existingSessions } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('wa_id', from)
      .maybeSingle();

    if (existingSessions) {
      session = existingSessions;
    } else {
      const { data: linkedProfile } = await supabase
        .from('profiles')
        .select('user_id, chama_id')
        .eq('phone', from)
        .maybeSingle();

      const { data: newSession } = await supabase
        .from('whatsapp_sessions')
        .insert({
          wa_id: from,
          user_id: linkedProfile?.user_id ?? null,
          chama_id: linkedProfile?.chama_id ?? null,
          state: 'idle',
          context: { chama_id: linkedProfile?.chama_id ?? null },
        })
        .select()
        .maybeSingle();

      session = newSession;
    }

    if (!session) {
      return new Response(JSON.stringify({ error: 'Could not create session' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sessionId = session.id;
    const chamaId = session.chama_id || session.context?.chama_id;

    if (type === 'voice' && media?.url) {
      try {
        const audioResp = await fetch(media.url);
        const audioBuffer = await audioResp.arrayBuffer();
        const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

        const sttKey = Deno.env.get('VITE_GOOGLE_STT_API_KEY') || geminiKey;

        const sttRes = await fetch(
          `https://speech.googleapis.com/v1/speech:recognize?key=${sttKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              config: {
                encoding: 'OGG_OPUS',
                sampleRateHertz: 16000,
                languageCode: 'sw-KE',
                alternativeLanguageCodes: ['en-US'],
              },
              audio: { content: audioBase64 },
            }),
          }
        );
        const sttData = await sttRes.json();
        const transcript = sttData.results
          ?.map((r: any) => r.alternatives?.[0]?.transcript || '')
          .join(' ') || '';

        if (transcript && chamaId && session.user_id) {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/${geminiModel}:generateContent?key=${geminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `Structure this voice note transcript into meeting minutes format:\n\n${transcript}\n\nReturn JSON: {title, date, summary, decisions: string[], actionItems: string[]}. Use today's date. Minutes language: Swahili or English based on transcript.`,
                  }],
                }],
              }),
            }
          );
          const geminiData = await geminiRes.json();
          const jsonText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const jsonMatch = jsonText.match(/\{[\s\S]*\}/);

          if (jsonMatch) {
            const minutes = JSON.parse(jsonMatch[0]);
            await supabase.from('minutes_archive').insert({
              chama_id: chamaId,
              created_by: session.user_id,
              title: minutes.title || 'Voice Note',
              summary: minutes.summary || transcript.slice(0, 500),
              decisions: minutes.decisions || [],
              action_items: minutes.actionItems || [],
            });
          }
        }

        await supabase.from('whatsapp_messages').insert({
          wa_id: from,
          chama_id: chamaId,
          direction: 'inbound',
          msg_type: 'voice_transcribed',
          content: { text: transcript || '[unintelligible]', url: media.url },
          session_id: sessionId,
        });

        await sendReply(from, atUsername, atApiKey, transcript
          ? `Voice note transcribed:\n\n"${transcript.slice(0, 200)}${transcript.length > 200 ? '…' : ''}"\n\nMinutes saved to your chama archive. ✅`
          : 'Voice note received but could not be transcribed. Please try again.');
      } catch (e) {
        console.error('Voice transcription error:', e);
        await sendReply(from, atUsername, atApiKey, 'Sorry, there was an error processing your voice note. Please try again.');
      }

      return new Response(JSON.stringify({ ok: true, voice: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await supabase.from('whatsapp_messages').insert({
      wa_id: from,
      chama_id: chamaId,
      direction: 'inbound',
      msg_type: 'text',
      content: { text: text ?? '' },
      session_id: sessionId,
    });

    let result: Response;

    switch (session.state) {
      case 'awaiting_mpesa':
        result = await handleMpesaSms(from, text, chamaId, supabase, atUsername, atApiKey, geminiKey, sessionId);
        break;
      case 'disputing':
        result = await handleDispute(from, text, chamaId, supabase, atUsername, atApiKey, geminiKey, sessionId);
        break;
      default:
        result = await handleDefault(from, text, chamaId, supabase, atUsername, atApiKey, geminiKey, sessionId);
        break;
    }

    return result;
  } catch (error) {
    console.error('whatsapp-webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendReply(to: string, username: string, apiKey: string, message: string) {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('to', to);
  formData.append('message', message);
  await fetch('https://api.sandbox.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'ApiKey': apiKey,
    },
    body: formData.toString(),
  });
}

async function handleMpesaSms(
  from: string,
  text: string,
  chamaId: string,
  supabase: any,
  atUsername: string,
  atApiKey: string,
  geminiKey: string,
  sessionId: string,
): Promise<Response> {
  try {
    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Extract the amount (number only), sender name, date, and M-Pesa code from this SMS. Return ONLY a JSON object with keys: amount, sender, date, code.

SMS: "${text}"

Example: {"amount": 5000, "sender": "John Kamau", "date": "05/07/2026", "code": "ABC123XYZ"}`,
                },
              ],
            },
          ],
        }),
      },
    );

    const geminiData = await geminiResp.json();
    const replyText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    const jsonMatch = replyText.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { amount: 0, sender: '', date: '', code: '' };

    const { data: member } = await supabase
      .from('members')
      .select('id, name')
      .eq('chama_id', chamaId)
      .or(`phone.eq.${from},name.ilike.%${parsed.sender}%`)
      .limit(1)
      .maybeSingle();

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    await supabase.from('contributions').insert({
      chama_id: chamaId,
      member_id: member?.id ?? 'unknown',
      member_name: member?.name ?? parsed.sender ?? 'Unknown',
      amount: parsed.amount,
      date: parsed.date || now.toISOString().split('T')[0],
      month,
      type: 'monthly',
      status: 'completed',
      mpesa_ref: parsed.code,
    });

    const reply = `Received! KSh ${parsed.amount} from ${member?.name || parsed.sender || 'Unknown'} logged as contribution ✅`;
    await sendReply(from, atUsername, atApiKey, reply);

    await supabase.from('whatsapp_sessions').update({ state: 'idle' }).eq('id', sessionId);

    return new Response(JSON.stringify({ ok: true, mpesa: true, parsed }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('handleMpesaSms error:', error);
    await sendReply(from, atUsername, atApiKey, 'Sorry, could not process the M-Pesa message. Please try again.');
    return new Response(JSON.stringify({ ok: false, error: 'M-Pesa processing failed' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleDispute(
  from: string,
  text: string,
  chamaId: string,
  supabase: any,
  atUsername: string,
  atApiKey: string,
  geminiKey: string,
  sessionId: string,
): Promise<Response> {
  await supabase.from('audit_logs').insert({
    chama_id: chamaId,
    action: 'whatsapp_dispute',
    details: text,
    level: 'warning',
  });

  await sendReply(from, atUsername, atApiKey, 'Your dispute has been noted. The admin will review it shortly. ✅');

  await supabase.from('whatsapp_sessions').update({ state: 'idle' }).eq('id', sessionId);

  return new Response(JSON.stringify({ ok: true, dispute: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleDefault(
  from: string,
  text: string,
  chamaId: string,
  supabase: any,
  atUsername: string,
  atApiKey: string,
  geminiKey: string,
  sessionId: string,
): Promise<Response> {
  const upper = (text || '').toUpperCase().trim();

  if (upper === 'PING') {
    await sendReply(from, atUsername, atApiKey, 'Confirmed! ✅');
    return new Response(JSON.stringify({ ok: true, reply: 'ping' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (upper === 'DISPUTE') {
    await supabase.from('whatsapp_sessions').update({ state: 'disputing' }).eq('id', sessionId);
    await sendReply(from, atUsername, atApiKey, 'Please describe the issue you want to dispute:');
    return new Response(JSON.stringify({ ok: true, reply: 'dispute_prompt' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (upper === 'HELP' || upper === 'MENU') {
    const menu = [
      '📋 *ChamaOS Commands*',
      '',
      '🔹 *DISPUTE* – Report an issue',
      '🔹 *PING* – Check connection',
      '🔹 *HELP* / *MENU* – Show this menu',
      '',
      '📱 *M-Pesa* – Forward your M-Pesa confirmation SMS to automatically log a contribution.',
      '',
      'Need more help? Contact your chama admin.',
    ].join('\n');
    await sendReply(from, atUsername, atApiKey, menu);
    return new Response(JSON.stringify({ ok: true, reply: 'menu' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const mpesaPattern = /RECEIVED.*FROM.*\d[\d,]*/i;
  if (mpesaPattern.test(text || '')) {
    await supabase.from('whatsapp_sessions').update({ state: 'awaiting_mpesa' }).eq('id', sessionId);
    return await handleMpesaSms(from, text, chamaId, supabase, atUsername, atApiKey, geminiKey, sessionId);
  }

  const welcome = [
    '👋 *Welcome to ChamaOS!*',
    '',
    'Reply *HELP* to see available commands.',
    'Forward M-Pesa confirmation SMS to log contributions automatically.',
  ].join('\n');
  await sendReply(from, atUsername, atApiKey, welcome);
  return new Response(JSON.stringify({ ok: true, reply: 'welcome' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
