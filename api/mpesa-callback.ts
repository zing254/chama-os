import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    const { Body } = req.body;
    if (!Body?.stkCallback?.ResultCode || Body.stkCallback.ResultCode !== 0) {
      return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const callbackData = Body.stkCallback;
    const items = callbackData.CallbackMetadata?.Item || [];
    const amount = items.find((i: any) => i.Name === 'Amount')?.Value;
    const mpesaRef = items.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
    const phone = String(items.find((i: any) => i.Name === 'PhoneNumber')?.Value || '');

    await supabase
      .from('transactions')
      .update({ status: 'completed', mpesa_ref: String(mpesaRef) })
      .eq('mpesa_ref', '');

    console.log(`M-Pesa payment: ${mpesaRef}, KSh ${amount}, phone ${phone}`);
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (err) {
    console.error('M-Pesa callback error:', err);
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
