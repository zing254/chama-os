import { useState, useEffect } from 'react';

interface AuditData {
  summary: string;
  generatedAt: string;
}

export default function AuditorPanel({ chamaId }: { chamaId: string }) {
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatest() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const sb = createClient(
          import.meta.env.VITE_SUPABASE_URL || '',
          import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        );
        const { data: logs } = await sb
          .from('audit_logs')
          .select('details, created_at')
          .eq('chama_id', chamaId)
          .eq('action', 'auditor_summary')
          .order('created_at', { ascending: false })
          .limit(1);

        if (logs && logs.length > 0) {
          setAudit({
            summary: logs[0].details,
            generatedAt: logs[0].created_at,
          });
        }
      } catch {
        // Fail silently
      } finally {
        setLoading(false);
      }
    }
    fetchLatest();
  }, [chamaId]);

  if (loading) return null;
  if (!audit) return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-2">📊 Auditor Summary</h3>
      <p className="text-gray-400 text-sm">No weekly audit yet. The AI auditor runs every Sunday.</p>
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">📊 Auditor Summary</h3>
        <span className="text-xs text-gray-500">
          {new Date(audit.generatedAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{audit.summary}</p>
    </div>
  );
}
