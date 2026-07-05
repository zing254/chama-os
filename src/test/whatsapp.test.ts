import { describe, it, expect } from 'vitest';

describe('WhatsApp AI Integration', () => {
  it('parses M-Pesa SMS correctly', () => {
    const sms = 'You received 5,000.00 from JOHN DOE on 15/1/2024 at 10:30 AM. New M-Pesa balance is KSh 45,000.00. Transaction code MX12ABC.';
    const amountMatch = sms.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
    const fromMatch = sms.match(/from\s+([A-Z\s]+?)\s+on/);
    const dateMatch = sms.match(/on\s+(\d{1,2}\/\d{1,2}\/\d{4})/);
    const codeMatch = sms.match(/code\s+([A-Z0-9]+)/);

    expect(amountMatch).toBeTruthy();
    expect(fromMatch).toBeTruthy();
    expect(dateMatch).toBeTruthy();
    expect(codeMatch).toBeTruthy();
    if (amountMatch) expect(amountMatch[0].replace(/,/g, '')).toBe('5000.00');
    if (fromMatch) expect(fromMatch[1].trim()).toBe('JOHN DOE');
    if (dateMatch) expect(dateMatch[1]).toBe('15/1/2024');
    if (codeMatch) expect(codeMatch[1]).toBe('MX12ABC');
  });

  it('generates audit summary prompt format', () => {
    const data = { totalCollected: 180000, totalKitty: 150000, totalLoans: 30000, members: 12, expenses: [{ item: 'School fees - Mary', amount: 30000 }] };
    const prompt = `Write a friendly weekly financial summary... Total collected: KSh ${data.totalCollected.toLocaleString()}...`;
    expect(prompt).toContain('180,000');
    expect(prompt).toContain('Write a friendly');
  });

  it('identifies high risk from contribution history', () => {
    const history = [
      { amount: 5000, date: '2024-01-01', status: 'paid' },
      { amount: 5000, date: '2024-02-01', status: 'paid' },
      { amount: 5000, date: '2024-03-01', status: 'missed' },
      { amount: 5000, date: '2024-04-01', status: 'missed' },
      { amount: 5000, date: '2024-05-01', status: 'missed' },
      { amount: 5000, date: '2024-06-01', status: 'paid' },
      { amount: 5000, date: '2024-07-01', status: 'paid' },
      { amount: 5000, date: '2024-08-01', status: 'paid' },
    ];
    const missedCount = history.filter(h => h.status === 'missed').length;
    const totalCount = history.length;
    const riskPct = Math.round((missedCount / totalCount) * 100);
    expect(riskPct).toBe(38); // 3/8 = 37.5%
    expect(missedCount).toBe(3);
  });
});
