import { useState, useEffect } from 'react';
import { supabase } from '../../data/supabase';
import { useToast } from '../../data/toast-context';
import { downloadJSON } from '../../data/export-utils';

interface SystemSetting {
  key: string;
  value: unknown;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'json';
}

const defaultSettings: SystemSetting[] = [
  { key: 'site_name', value: 'ChamaOS', description: 'Platform name shown in UI', type: 'string' },
  { key: 'default_monthly_contribution', value: 5000, description: 'Default monthly contribution for new chamas', type: 'number' },
  { key: 'default_interest_rate', value: 10, description: 'Default loan interest rate (%)', type: 'number' },
  { key: 'mpesa_default_number', value: '0797132940', description: 'Default M-Pesa collection number', type: 'string' },
  { key: 'mpesa_default_account', value: 'ChamaOS', description: 'Default M-Pesa account/business name', type: 'string' },
  { key: 'max_free_chama_members', value: 10, description: 'Max members for free plan', type: 'number' },
  { key: 'max_starter_chama_members', value: 30, description: 'Max members for starter plan', type: 'number' },
  { key: 'max_pro_chama_members', value: 100, description: 'Max members for pro plan', type: 'number' },
  { key: 'max_enterprise_chama_members', value: 500, description: 'Max members for enterprise plan', type: 'number' },
  { key: 'enable_stk_push', value: false, description: 'Enable M-Pesa STK Push (requires Daraja credentials)', type: 'boolean' },
  { key: 'whatsapp_shortcode', value: '24300', description: 'Africa\'s Talking WhatsApp shortcode', type: 'string' },
  { key: 'ai_auditor_enabled', value: true, description: 'Enable weekly AI auditor WhatsApp summary', type: 'boolean' },
  { key: 'ai_auditor_risk_threshold', value: 50, description: 'Risk threshold % for AI auditor warnings', type: 'number' },
  { key: 'email_verification_required', value: false, description: 'Require email verification on signup', type: 'boolean' },
  { key: 'maintenance_mode', value: false, description: 'Put platform in maintenance mode', type: 'boolean' },
];

export default function AdminSystemSettings() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('system_settings').select('*');
      const loaded: Record<string, unknown> = {};
      if (data) {
        data.forEach((row: { key: string; value: unknown }) => {
          loaded[row.key] = row.value;
        });
      }
      defaultSettings.forEach(s => {
        if (!(s.key in loaded)) loaded[s.key] = s.value;
      });
      setSettings(loaded);
    } catch {
      defaultSettings.forEach(s => { settings[s.key] = s.value; });
    }
    setLoading(false);
  };

  const handleChange = (key: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: string) => {
    setSaving(key);
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ key, value: settings[key] }, { onConflict: 'key' });
      if (error) throw error;
      toast.success('Setting saved');
    } catch {
      toast.error('Failed to save');
    }
    setSaving(null);
  };

  const handleExport = () => {
    downloadJSON(settings, 'system_settings');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        setSettings(prev => ({ ...prev, ...imported }));
        toast.success('Settings imported - click Save for each to persist');
      } catch {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">System Settings</h1>
          <p className="text-gray-500 text-sm">Configure platform-wide defaults and features</p>
        </div>
        <div className="flex gap-2">
          <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm cursor-pointer hover:bg-gray-200">
            📥 Import JSON <input type="file" accept=".json" onChange={handleImport} className="sr-only" />
          </label>
          <button onClick={handleExport} className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700">
            📥 Export JSON
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {defaultSettings.map(s => {
            const value = settings[s.key] ?? s.value;
            return (
              <div key={s.key} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-gray-700 block mb-1">{s.key}</label>
                    <p className="text-xs text-gray-500 mb-2">{s.description}</p>
                    {s.type === 'boolean' ? (
                      <label className="relative cursor-pointer shrink-0 ml-4">
                        <input
                          type="checkbox"
                          checked={value as boolean}
                          onChange={e => handleChange(s.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-checked:bg-green-600 rounded-full transition-colors relative">
                          <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                        </div>
                      </label>
                    ) : s.type === 'number' ? (
                      <input
                        type="number"
                        value={value as number}
                        onChange={e => handleChange(s.key, Number(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400"
                        step={s.key.includes('rate') || s.key.includes('threshold') ? '0.1' : '1'}
                      />
                    ) : s.type === 'json' ? (
                      <textarea
                        value={JSON.stringify(value, null, 2)}
                        onChange={e => handleChange(s.key, JSON.parse(e.target.value || '{}'))}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-green-400 min-h-[80px]"
                      />
                    ) : (
                      <input
                        type="text"
                        value={value as string}
                        onChange={e => handleChange(s.key, e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => handleSave(s.key)}
                    disabled={saving === s.key}
                    className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 shrink-0"
                  >
                    {saving === s.key ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}