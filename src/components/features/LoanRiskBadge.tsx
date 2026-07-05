import { useState, useEffect } from 'react';

interface RiskResult {
  riskPct: number;
  reason: string;
}

interface LoanRiskBadgeProps {
  memberId: string;
  memberName: string;
}

export default function LoanRiskBadge({ memberId, memberName }: LoanRiskBadgeProps) {
  const [risk, setRisk] = useState<RiskResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRisk() {
      try {
        const res = await fetch(`/api/loan-risk?memberId=${memberId}&memberName=${encodeURIComponent(memberName)}`);
        if (res.ok) {
          const data = await res.json();
          setRisk(data);
        }
      } catch {
        // Fail silently — risk badge is non-critical
      } finally {
        setLoading(false);
      }
    }
    fetchRisk();
  }, [memberId, memberName]);

  if (loading) return <span className="text-xs text-gray-400">Analyzing...</span>;
  if (!risk) return null;

  const isHigh = risk.riskPct >= 50;
  const isMedium = risk.riskPct >= 30;

  return (
    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
      isHigh ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
      isMedium ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
      'bg-green-500/20 text-green-400 border border-green-500/30'
    }`}>
      Default risk: {risk.riskPct}% — {risk.reason}
    </div>
  );
}
