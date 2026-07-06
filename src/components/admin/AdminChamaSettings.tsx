import { useState, useEffect } from 'react';
import { supabase } from '../../data/supabase';
import { useToast } from '../../data/toast-context';
import { downloadCSV } from '../../data/export-utils';

interface ChamaSummary {
  id: string;
  name: string;
  registration_number: string;
  location: string;
  meeting_schedule: string;
  monthly_contribution: number;
  loan_interest_rate: number;
  total_fund: number;
  total_members: number;
  total_loans_out: number;
  plan: string;
  mpesa_number: string;
  created_at: string;
}

export default function AdminChamaSettings() {
  const [chamas, setChamas] = useState<ChamaSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ChamaSummary>>({});
  const toast = useToast();

  useEffect(() => {
    loadChamas();
  }, []);

  const loadChamas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('chamas')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setChamas(data as ChamaSummary[]);
    else if (error) toast.error('Failed to load chamas');
    setLoading(false);
  };

  const handleEdit = (chama: ChamaSummary) => {
    setEditingId(chama.id);
    setEditData({
      name: chama.name,
      registration_number: chama.registration_number,
      location: chama.location,
      meeting_schedule: chama.meeting_schedule,
      monthly_contribution: chama.monthly_contribution,
      loan_interest_rate: chama.loan_interest_rate,
      plan: chama.plan,
      mpesa_number: chama.mpesa_number,
    });
  };

  const handleSave = async (id: string) => {
    const { error } = await supabase
      .from('chamas')
      .update({
        name: editData.name,
        registration_number: editData.registration_number,
        location: editData.location,
        meeting_schedule: editData.meeting_schedule,
        monthly_contribution: editData.monthly_contribution,
        loan_interest_rate: editData.loan_interest_rate,
        plan: editData.plan,
        mpesa_number: editData.mpesa_number,
      })
      .eq('id', id);
    if (error) {
      toast.error('Failed to save');
    } else {
      toast.success('Chama updated');
      await loadChamas();
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this chama and all its data?')) return;
    const { error } = await supabase.from('chamas').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else {
      toast.success('Chama deleted');
      await loadChamas();
    }
  };

  const handleExport = () => {
    downloadCSV(chamas.map(c => ({
      Name: c.name,
      Registration: c.registration_number,
      Location: c.location,
      Schedule: c.meeting_schedule,
      'Monthly Contribution': c.monthly_contribution,
      'Interest Rate': c.loan_interest_rate,
      'Total Fund': c.total_fund,
      Members: c.total_members,
      'Active Loans': c.total_loans_out,
      Plan: c.plan,
      'M-Pesa Number': c.mpesa_number,
      Created: c.created_at,
    })), 'all_chamas');
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading chamas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Chama Settings</h1>
          <p className="text-gray-500 text-sm">Manage all chamas in the system</p>
        </div>
        <button onClick={handleExport} className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700">
          📥 Export All Chama CSV
        </button>
      </div>

      {chamas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
          No chamas found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Reg Number', 'Location', 'Schedule', 'Monthly (KSh)', 'Rate %', 'Fund (KSh)', 'Members', 'Loans', 'Plan', 'M-Pesa', 'Actions'].map(h => (
                    <th key={h} className="text-left p-4 text-xs font-bold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {chamas.map(c => editingId === c.id ? (
                  <tr key={c.id} className="bg-green-50">
                    <td className="p-4"><input value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></td>
                    <td className="p-4"><input value={editData.registration_number || ''} onChange={e => setEditData({...editData, registration_number: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono" /></td>
                    <td className="p-4"><input value={editData.location || ''} onChange={e => setEditData({...editData, location: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></td>
                    <td className="p-4"><input value={editData.meeting_schedule || ''} onChange={e => setEditData({...editData, meeting_schedule: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></td>
                    <td className="p-4"><input type="number" value={editData.monthly_contribution || 0} onChange={e => setEditData({...editData, monthly_contribution: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></td>
                    <td className="p-4"><input type="number" step="0.1" value={editData.loan_interest_rate || 0} onChange={e => setEditData({...editData, loan_interest_rate: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" /></td>
                    <td className="p-4 text-gray-400 text-sm">{c.total_fund.toLocaleString()}</td>
                    <td className="p-4 text-gray-400 text-sm">{c.total_members}</td>
                    <td className="p-4 text-gray-400 text-sm">{c.total_loans_out}</td>
                    <td className="p-4">
                      <select value={editData.plan || c.plan} onChange={e => setEditData({...editData, plan: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                        <option value="free">Free</option>
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                      </select>
                    </td>
                    <td className="p-4"><input value={editData.mpesa_number || ''} onChange={e => setEditData({...editData, mpesa_number: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono" /></td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleSave(c.id)} className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">Save</button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300">Cancel</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-900">{c.name}</td>
                    <td className="p-4 text-gray-500 text-sm font-mono">{c.registration_number || '—'}</td>
                    <td className="p-4 text-gray-600">{c.location || '—'}</td>
                    <td className="p-4 text-gray-500 text-sm">{c.meeting_schedule || '—'}</td>
                    <td className="p-4 text-gray-700">{c.monthly_contribution.toLocaleString()}</td>
                    <td className="p-4 text-gray-700">{c.loan_interest_rate}%</td>
                    <td className="p-4 font-bold text-green-600">KSh {c.total_fund.toLocaleString()}</td>
                    <td className="p-4 text-gray-600">{c.total_members}</td>
                    <td className="p-4 text-gray-600">{c.total_loans_out}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        c.plan === 'free' ? 'bg-gray-100 text-gray-600' :
                        c.plan === 'starter' ? 'bg-green-100 text-green-700' :
                        c.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>{c.plan}</span>
                    </td>
                    <td className="p-4 text-sm font-mono text-gray-500">{c.mpesa_number?.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3') || '—'}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(c)} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">Edit</button>
                        <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}