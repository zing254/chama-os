const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';

export interface MpesaParseResult {
  amount: number;
  sender: string;
  date: string;
  code: string;
}

export interface AuditorData {
  totalCollected: number;
  totalKitty: number;
  totalLoans: number;
  members: number;
  expenses: { item: string; amount: number }[];
}

export interface RiskResult {
  riskPct: number;
  reason: string;
}

export interface MinutesDoc {
  agenda: string[];
  decisions: string[];
  actions: { who: string; what: string }[];
  nextMeeting: string;
}

interface Contribution {
  amount: number;
  date: string;
  status: string;
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(`${BASE}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Gemini API error:', err);
    throw new Error(`Gemini API error: ${res.status}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function parseJsonResponse<T>(prompt: string): Promise<T> {
  const text = await callGemini(prompt);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse Gemini JSON response');
  return JSON.parse(jsonMatch[0]) as T;
}

export const ai = {
  async parseMpesaSms(rawText: string): Promise<MpesaParseResult> {
    return parseJsonResponse<MpesaParseResult>(
      `Extract amount, sender name, date, and M-Pesa code from this SMS: "${rawText}". Return JSON with keys: amount (number), sender (string), date (string), code (string).`
    );
  },

  async generateAuditorSummary(data: AuditorData): Promise<string> {
    const expensesStr = data.expenses.map(e => `${e.item}: KSh ${e.amount.toLocaleString()}`).join(', ');
    return callGemini(
      `Write a friendly weekly financial summary in plain language for a chama. Total collected: KSh ${data.totalCollected.toLocaleString()}. Total in kitty: KSh ${data.totalKitty.toLocaleString()}. Total loans: KSh ${data.totalLoans.toLocaleString()}. Members: ${data.members}. Expenses: ${expensesStr || 'None'}. Use simple English or Kiswahili. Keep it to 3-4 sentences.`
    );
  },

  async predictLoanRisk(history: Contribution[]): Promise<RiskResult> {
    const data = history.map(h => `Amount: ${h.amount}, Date: ${h.date}, Status: ${h.status}`).join('\n');
    return parseJsonResponse<RiskResult>(
      `Analyze this member's contribution pattern:\n${data}\nCalculate default risk percentage (0-100) and one-line reason. Return JSON with keys: riskPct (number), reason (string).`
    );
  },

  async structureMinutes(transcript: string): Promise<MinutesDoc> {
    return parseJsonResponse<MinutesDoc>(
      `Turn this meeting transcript into structured minutes:\n"${transcript}"\nInclude: agenda (string[]), decisions (string[]), actions ({who: string, what: string}[]), nextMeeting (string). Return JSON.`
    );
  },
};
