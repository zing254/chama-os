import { useState } from 'react';
import { useData } from '../../data/context';
import { supabase } from '../../data/supabase';

export default function AdminReports() {
  const { members, contributions, loans, meetings, chama, loading } = useData();
  const [reportType, setReportType] = useState<'summary' | 'members' | 'contributions' | 'loans' | 'meetings'>('summary');
  const [exporting, setExporting] = useState(false);

  const sanitizeCSV = (val: unknown): string => {
    const str = val == null ? '' : String(val);
    const dangerous = /^[=+\-@\t\r]/;
    const escaped = dangerous.test(str) ? `'${str}` : str;
    if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
      return `"${escaped.replace(/"/g, '""')}"`;
    }
    return escaped;
  };

  const generateCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => sanitizeCSV(row[h])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportData = async () => {
    if (!chama) return;
    setExporting(true);
    try {
      const q = supabase.from('members').select('*').eq('chama_id', chama.id);
      switch (reportType) {
        case 'members':
          const { data: membersData } = await q.order('name');
          generateCSV(membersData || [], 'members');
          break;
        case 'contributions':
          const { data: contribData } = await supabase.from('contributions').select('*').eq('chama_id', chama.id).order('date', { ascending: false });
          generateCSV(contribData || [], 'contributions');
          break;
        case 'loans':
          const { data: loansData } = await supabase.from('loans').select('*').eq('chama_id', chama.id).order('created_at', { ascending: false });
          generateCSV(loansData || [], 'loans');
          break;
        case 'meetings':
          const { data: meetingsData } = await supabase.from('meetings').select('*').eq('chama_id', chama.id).order('date', { ascending: false });
          generateCSV(meetingsData || [], 'meetings');
          break;
        case 'summary':
          const summary = [{
            metric: 'Total Members',
            value: members.length,
          }, {
            metric: 'Total Contributions (MTD)',
            value: contributions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0),
          }, {
            metric: 'Active Loans',
            value: loans.filter(l => l.status === 'active').length,
          }, {
            metric: 'Loans Outstanding',
            value: loans.filter(l => l.status !== 'paid').reduce((s, l) => s + l.balance, 0),
          }, {
            metric: 'Upcoming Meetings',
            value: meetings.filter(m => m.status === 'upcoming').length,
          }];
          generateCSV(summary, 'summary_report');
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
    }
    setExporting(false);
  };

  const generatePDF = () => {
    alert('PDF export coming soon! Use CSV for now.');
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  const stats = {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    totalContributions: contributions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0),
    totalLoans: loans.filter(l => l.status === 'active').length,
    overdueLoans: loans.filter(l => l.status === 'overdue').length,
    totalLoansOutstanding: loans.filter(l => l.status !== 'paid').reduce((s, l) => s + l.balance, 0),
    upcomingMeetings: meetings.filter(m => m.status === 'upcoming').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm">Export and analyze your chama data</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-gray-500 text-xs font-medium">Total Members</p>
          <p className="text-2xl font-black text-gray-900">{stats.totalMembers}</p>
          <p className="text-xs text-green-600">{stats.activeMembers} active</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-gray-500 text-xs font-medium">Contributions (MTD)</p>
          <p className="text-2xl font-black text-green-600">KSh {(stats.totalContributions / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-gray-500 text-xs font-medium">Loans Outstanding</p>
          <p className="text-2xl font-black text-orange-600">KSh {(stats.totalLoansOutstanding / 1000).toFixed(0)}K</p>
          <p className="text-xs text-gray-500">{stats.overdueLoans} overdue</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-gray-500 text-xs font-medium">Upcoming Meetings</p>
          <p className="text-2xl font-black text-blue-600">{stats.upcomingMeetings}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Export Data</h2>
        
        <div className="flex flex-wrap gap-3 mb-6">
          {(['summary', 'members', 'contributions', 'loans', 'meetings'] as const).map(type => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 rounded-xl font-medium text-sm ${
                reportType === type 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={exportData}
            disabled={exporting}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : '📥 Export CSV'}
          </button>
          <button
            onClick={generatePDF}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl"
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Average Contribution per Member</span>
            <span className="font-bold text-gray-900">KSh {stats.totalMembers ? Math.round(stats.totalContributions / stats.totalMembers).toLocaleString() : 0}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Average Loan Amount</span>
            <span className="font-bold text-gray-900">KSh {stats.totalLoans ? Math.round(stats.totalLoansOutstanding / stats.totalLoans).toLocaleString() : 0}</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Member Retention Rate</span>
            <span className="font-bold text-green-600">{stats.totalMembers ? Math.round((stats.activeMembers / stats.totalMembers) * 100) : 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}