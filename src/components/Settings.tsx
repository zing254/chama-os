import { useState, useEffect } from 'react';
import { useData } from '../data/context';
import { supabase } from '../data/supabase';
import { useAuth } from '../data/auth-context';
import { DEFAULT_MONTHLY_CONTRIBUTION, DEFAULT_INTEREST_RATE } from '../data/constants';

interface NotificationSettings {
  contribution_reminders: boolean;
  loan_repayment_reminders: boolean;
  mpesa_payment_alerts: boolean;
  meeting_notifications: boolean;
  monthly_statement: boolean;
  overdue_loan_escalations: boolean;
  reminder_days_before: string;
}

const defaultNotificationSettings: NotificationSettings = {
  contribution_reminders: true,
  loan_repayment_reminders: true,
  mpesa_payment_alerts: true,
  meeting_notifications: true,
  monthly_statement: false,
  overdue_loan_escalations: true,
  reminder_days_before: '7 days before',
};

const notificationItems: { key: keyof NotificationSettings; label: string; desc: string }[] = [
  { key: 'contribution_reminders', label: 'Contribution Reminders', desc: 'SMS/WhatsApp reminders before contribution deadline' },
  { key: 'loan_repayment_reminders', label: 'Loan Repayment Reminders', desc: 'Automated reminders for upcoming loan due dates' },
  { key: 'mpesa_payment_alerts', label: 'M-Pesa Payment Alerts', desc: 'Instant notification when payment is received' },
  { key: 'meeting_notifications', label: 'Meeting Notifications', desc: 'Agenda and reminder 48 hours before meeting' },
  { key: 'monthly_statement', label: 'Monthly Statement', desc: 'Automated PDF statement at end of month' },
  { key: 'overdue_loan_escalations', label: 'Overdue Loan Escalations', desc: 'Weekly escalation SMS for overdue loans' },
];

export default function Settings() {
  const { user } = useAuth();
  const { chama, refresh, loading } = useData();
  const [activeTab, setActiveTab] = useState('chama');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [auditorEnabled, setAuditorEnabled] = useState(true);
  const [riskThreshold, setRiskThreshold] = useState(50);

  useEffect(() => {
    if (!user?.id || activeTab !== 'notifications') return;
    setNotifLoading(true);
    (async () => {
      const { data, error } = await supabase.from('user_settings').select('settings').eq('user_id', user.id).maybeSingle();
      if (!error && data?.settings) {
        setNotifSettings({ ...defaultNotificationSettings, ...data.settings as Partial<NotificationSettings> });
      }
      setNotifLoading(false);
    })();
  }, [user?.id, activeTab]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chama?.id || saving) return;
    setSaving(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    try {
      const monthlyContribution = parseInt(formData.get('monthlyContribution') as string) || 0;
      const loanInterestRate = parseFloat(formData.get('loanInterestRate') as string) || 0;
      const { error } = await supabase.from('chamas').update({
        name: formData.get('name') as string,
        location: formData.get('location') as string,
        meeting_schedule: formData.get('meetingSchedule') as string,
        monthly_contribution: monthlyContribution,
        loan_interest_rate: loanInterestRate,
      }).eq('id', chama.id);
      if (error) throw error;
      setSaved(true);
      await refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Save error:', err);
    }
    setSaving(false);
  };

  const saveNotificationSettings = async (settings: NotificationSettings) => {
    if (!user?.id) return;
    setNotifSaving(true);
    try {
      const { error } = await supabase.from('user_settings').upsert({
        user_id: user.id,
        chama_id: chama?.id,
        settings,
      }, { onConflict: 'user_id' });
      if (error) throw error;
      setToast('Notification settings saved');
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      console.error('Save notification error:', err);
      setToast('Failed to save notification settings');
      setTimeout(() => setToast(null), 3000);
    }
    setNotifSaving(false);
  };

  const toggleNotifSetting = (key: keyof NotificationSettings) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
    saveNotificationSettings(updated);
  };

  const handlePasswordChange = async () => {
    if (!user?.email) return;
    if (!currentPassword) {
      setToast('Please enter your current password');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    if (newPassword.length < 6) {
      setToast('New password must be at least 6 characters');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast('New passwords do not match');
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setPasswordSaving(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) {
        setToast('Current password is incorrect');
        setTimeout(() => setToast(null), 3000);
        setPasswordSaving(false);
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setToast('Password updated successfully');
      setTimeout(() => setToast(null), 3000);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password change error:', err);
      setToast('Failed to update password');
      setTimeout(() => setToast(null), 3000);
    }
    setPasswordSaving(false);
  };

  const tabs = [
    { id: 'chama', label: '🏛️ Chama Info', },
    { id: 'notifications', label: '🔔 Notifications', },
    { id: 'payments', label: '💳 M-Pesa', },
    { id: 'security', label: '🔐 Security', },
    { id: 'whatsapp', label: '💬 WhatsApp', },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your chama configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === t.id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Chama Info Tab */}
      {activeTab === 'chama' && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">Chama Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ['Chama Name', 'name', chama?.name || '', 'text'],
              ['Registration Number', 'registrationNumber', chama?.registrationNumber || '', 'text'],
              ['Location', 'location', chama?.location || '', 'text'],
              ['Monthly Contribution (KSh)', 'monthlyContribution', chama?.monthlyContribution || DEFAULT_MONTHLY_CONTRIBUTION, 'number'],
              ['Loan Interest Rate (%)', 'loanInterestRate', chama?.loanInterestRate || DEFAULT_INTEREST_RATE, 'number'],
              ['Meeting Schedule', 'meetingSchedule', chama?.meetingSchedule || '', 'text'],
            ].map(([label, name, val, type]) => (
              <div key={name as string}>
                <label htmlFor={name as string} className="text-sm font-semibold text-gray-700 block mb-1">{label}</label>
                <input id={name as string} type={type as string} name={name as string} defaultValue={val as string | number}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${saved ? 'bg-green-500 text-white' : 'bg-green-600 hover:bg-green-700 text-white'} disabled:opacity-50`}>
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">Notification Preferences</h2>
          {notifLoading ? (
            <div className="text-center text-gray-500 py-4 text-sm">Loading preferences...</div>
          ) : (
            <>
              <div className="space-y-4">
                {notificationItems.map(item => (
                  <div key={item.key} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                    </div>
                    <label className="relative cursor-pointer shrink-0 ml-4">
                      <input type="checkbox" checked={!!notifSettings[item.key]} onChange={() => toggleNotifSetting(item.key)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-checked:bg-green-600 rounded-full transition-colors relative">
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Reminder Days Before Deadline</label>
                <select value={notifSettings.reminder_days_before} onChange={e => {
                  const updated = { ...notifSettings, reminder_days_before: e.target.value };
                  setNotifSettings(updated);
                  saveNotificationSettings(updated);
                }} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-green-400">
                  <option>7 days before</option>
                  <option>5 days before</option>
                  <option>3 days before</option>
                  <option>1 day before</option>
                </select>
              </div>
              <button onClick={() => saveNotificationSettings(notifSettings)} disabled={notifSaving}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${saved ? 'bg-green-500 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
                {notifSaving ? 'Saving...' : 'Save Notification Settings'}
              </button>
            </>
          )}
        </div>
      )}

      {/* M-Pesa Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">M-Pesa Integration</h2>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white text-lg font-black">M</div>
            <div>
              <div className="font-bold text-green-900">Manual M-Pesa Collection</div>
              <div className="text-sm text-green-700">Send to 0797 132 940</div>
            </div>
            <span className="ml-auto text-xs font-bold bg-green-600 text-white px-2.5 py-1 rounded-full">ACTIVE</span>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            <strong>How it works:</strong> Members send contributions to 0797 132 940 via M-Pesa. The admin then records the payment in the app using the M-Pesa confirmation code from the member's SMS. No M-Pesa API keys required.
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ['M-Pesa Number', '0797 132 940'],
              ['Account Name', 'ChamaOS'],
              ['Consumer Key', 'Not configured'],
              ['Consumer Secret', 'Not configured'],
              ['Passkey', 'Not configured'],
            ].map(([label, val]) => (
              <div key={label as string}>
                <label className="text-sm font-semibold text-gray-700 block mb-1">{label}</label>
                <input type="text" defaultValue={val as string} readOnly={val === '0797 132 940'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-green-400 font-mono" />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setToast('Manual collection confirmed. No credentials needed.'); setTimeout(() => setToast(null), 3000); }} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-700 text-white transition-all">
              Save M-Pesa Settings
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">Security & Access</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400" />
            </div>
          </div>
          <button onClick={handlePasswordChange} disabled={passwordSaving}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-700 text-white transition-all disabled:opacity-50">
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
          <div className="space-y-3">
            {[
              { label: 'Two-Factor Authentication (2FA)', desc: 'Receive OTP via SMS before every login', checked: true },
              { label: 'Login Notifications', desc: 'Email & SMS alert on each new login', checked: true },
              { label: 'Require PIN for loan approvals', desc: 'Extra confirmation step for issuing loans', checked: false },
              { label: 'Read-only mode for regular members', desc: 'Members can view but not edit records', checked: true },
            ].map(item => (
              <div key={item.label} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                </div>
                <label className="relative cursor-pointer shrink-0 ml-4">
                  <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-checked:bg-green-600 rounded-full transition-colors relative">
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
                  </div>
                </label>
              </div>
            ))}
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="font-bold text-red-800 text-sm mb-1">⚠️ Danger Zone</div>
            <div className="text-xs text-red-700 mb-3">These actions are irreversible. Proceed with caution.</div>
            <div className="flex gap-2">
              {confirming === 'export' ? (
                <div className="flex items-center gap-2 bg-red-100 rounded-lg px-3 py-1.5">
                  <span className="text-xs text-red-800">Are you sure? This will export all chama data.</span>
                  <button onClick={() => { console.log('Export confirmed'); setConfirming(null); }} className="text-xs font-bold text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700">Confirm</button>
                  <button onClick={() => setConfirming(null)} className="text-xs font-bold text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirming('export')} className="text-sm font-bold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  Export All Data
                </button>
              )}
              {confirming === 'delete' ? (
                <div className="flex items-center gap-2 bg-red-100 rounded-lg px-3 py-1.5">
                  <span className="text-xs text-red-800">Are you sure? This will permanently delete all chama data.</span>
                  <button onClick={() => { console.log('Delete confirmed'); setConfirming(null); }} className="text-xs font-bold text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700">Confirm</button>
                  <button onClick={() => setConfirming(null)} className="text-xs font-bold text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirming('delete')} className="text-sm font-bold text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  Delete Chama Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white">WhatsApp Integration</h3>
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">AI Auditor</p>
                <p className="text-gray-400 text-sm">Weekly Sunday audit summary sent via WhatsApp</p>
              </div>
              <button
                onClick={() => setAuditorEnabled(!auditorEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${auditorEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${auditorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Risk Threshold ({riskThreshold}%)</label>
              <input
                type="range"
                min="30"
                max="90"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Loans above this risk % will show a warning badge</p>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-4">
              <p className="text-sm text-gray-300">
                <span className="text-green-400">●</span> Africa's Talking sandbox connected
              </p>
              <p className="text-xs text-gray-500 mt-1">Shortcode: 24300</p>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm max-w-sm z-50 animate-in fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
