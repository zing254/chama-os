import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const MIN_AMOUNT = 10;
const MAX_AMOUNT = 150_000;

function isValidKenyanPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return /^2547\d{8}$/.test(digits);
}

async function getAccessToken() {
  const key = Deno.env.get('MPESA_CONSUMER_KEY') ?? '';
  const secret = Deno.env.get('MPESA_CONSUMER_SECRET') ?? '';
  const auth = btoa(`${key}:${secret}`);
  const resp = await fetch(
    'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } },
  );
  const data = await resp.json();
  if (!data.access_token) throw new Error('M-Pesa auth failed');
  return data.access_token;
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

    const { phone, amount, accountRef, chamaId } = await req.json();

    if (!phone || !amount) {
      return new Response(JSON.stringify({ error: 'phone and amount are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!isValidKenyanPhone(phone)) {
      return new Response(JSON.stringify({ error: 'Invalid phone number. Use 2547XX format (12 digits)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || !Number.isInteger(numericAmount)) {
      return new Response(JSON.stringify({ error: 'Amount must be a positive integer' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (numericAmount < MIN_AMOUNT || numericAmount > MAX_AMOUNT) {
      return new Response(JSON.stringify({ error: `Amount must be between KSh ${MIN_AMOUNT} and KSh ${MAX_AMOUNT}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = await getAccessToken();
    const passkey = Deno.env.get('MPESA_PASSKEY') ?? '';
    const shortCode = Deno.env.get('MPESA_SHORTCODE') ?? '247247';
    const env = Deno.env.get('MPESA_ENV') ?? 'sandbox';
    const baseUrl = env === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = btoa(`${shortCode}${passkey}${timestamp}`);

    const cleanPhone = phone.replace(/\D/g, '');

    const resp = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: numericAmount,
        PartyA: cleanPhone,
        PartyB: shortCode,
        PhoneNumber: cleanPhone,
        CallBackURL: `${Deno.env.get('PUBLIC_SITE_URL')}/api/mpesa-callback`,
        AccountReference: accountRef || 'ChamaOS',
        TransactionDesc: 'ChamaOS Payment',
      }),
    });

    const result = await resp.json();

    if (chamaId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      );
      await supabase.from('transactions').insert({
        chama_id: chamaId,
        phone,
        amount: numericAmount,
        status: result.ResponseCode === '0' ? 'pending' : 'failed',
        mpesa_ref: result.MerchantRequestID || '',
        description: accountRef || 'ChamaOS Payment',
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('mpesa-stkpush error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
