import { supabase } from './supabase';

const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '') + '/functions/v1';

interface MpesaTransaction {
  id: string;
  phone: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  mpesaRef: string;
  description: string;
  createdAt: string;
}

async function callEdgeFunction(phone: string, amount: number, accountRef: string): Promise<{ success: boolean; mpesaRef?: string; error?: string }> {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) throw new Error('No auth session');

  const resp = await fetch(`${SUPABASE_FUNCTIONS_URL}/mpesa-stkpush`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone, amount, accountRef }),
  });
  const data = await resp.json();
  if (data.ResponseCode === '0') {
    return { success: true, mpesaRef: data.CheckoutRequestID };
  }
  return { success: false, error: data.ResponseDescription || data.error || 'Payment failed' };
}

class MpesaService {
  async stkPush(phone: string, amount: number, description: string): Promise<{ success: boolean; mpesaRef?: string; error?: string }> {
    try {
      return await callEdgeFunction(phone, amount, description);
    } catch (error) {
      console.error('STK Push error:', error);
      return { success: false, error: 'Payment request failed' };
    }
  }

  async simulatePayment(phone: string, amount: number, description: string): Promise<{ success: boolean; mpesaRef: string }> {
    const mpesaRef = `MPS${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    await this.saveTransaction({ phone, amount, status: 'completed', mpesaRef, description });
    return { success: true, mpesaRef };
  }

  private async saveTransaction(tx: Omit<MpesaTransaction, 'id' | 'createdAt'>): Promise<void> {
    await supabase.from('transactions').insert({
      id: crypto.randomUUID(),
      phone: tx.phone,
      amount: tx.amount,
      status: tx.status,
      mpesa_ref: tx.mpesaRef,
      description: tx.description,
    });
  }

  async getTransactions(limit = 50): Promise<MpesaTransaction[]> {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return (data || []).map(d => ({
      id: d.id,
      phone: d.phone,
      amount: d.amount,
      status: d.status,
      mpesaRef: d.mpesa_ref,
      description: d.description,
      createdAt: d.created_at,
    }));
  }
}

export const mpesa = new MpesaService();
