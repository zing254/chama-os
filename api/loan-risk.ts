import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { memberId, memberName } = req.query;
  if (!memberId) {
    return res.status(400).json({ error: 'memberId required' });
  }

  const geminiKey = process.env.VITE_GEMINI_API_KEY;
  if (!geminiKey) {
    return res.status(200).json({ riskPct: 0, reason: 'AI not configured' });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

    const historyRes = await fetch(
      `${supabaseUrl}/rest/v1/contributions?member_id=eq.${memberId}&select=amount,date,status&order=date.desc&limit=12`,
      {
        headers: {
          'apikey': anonKey || '',
          'Authorization': `Bearer ${anonKey || ''}`,
        },
      }
    );
    const history = await historyRes.json();

    const dataStr = (Array.isArray(history) ? history : []).map((h: any) =>
      `Amount: ${h.amount}, Date: ${h.date}, Status: ${h.status}`
    ).join('\n');

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this member's (${memberName}) contribution pattern:\n${dataStr}\nCalculate default risk percentage (0-100) and one-line reason. Return ONLY valid JSON with keys: riskPct (number), reason (string).`
            }]
          }],
        }),
      }
    );

    const geminiData = await geminiRes.json();
    const jsonText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return res.status(200).json(result);
    }

    return res.status(200).json({ riskPct: 0, reason: 'Could not analyze' });
  } catch (e) {
    console.error('Loan risk error:', e);
    return res.status(500).json({ error: 'Failed to analyze risk' });
  }
}
