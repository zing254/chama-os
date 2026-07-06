import { useState } from 'react';
import { useData } from '../../data/context';
import { supabase } from '../../data/supabase';
import { downloadCSV, downloadPDF } from '../../data/export-utils';

export default function AdminReports() {
  const { members, contributions, loans, meetings, chama, loading } = useData();
  const [reportType, setReportType] = useState<'summary' | 'members' | 'contributions' | 'loans' | 'meetings'>('summary');
  const [exporting, setExporting] = useState(false);

  const fetchAndExport = async (table: string, filename: string, orderColumn: string) => {
    if (!chama) return;
    const { data } = await supabase.from(table).select('*').eq('chama_id', chama.id).order(orderColumn, { ascending: false });
    downloadCSV((data || []) as Record<string, unknown>[], filename);
  };

  const exportData = async () => {
    if (!chama) return;
    setExporting(true);
    try {
      switch (reportType) {
        case 'members':
          await fetchAndExport('members', 'members', 'name');
          break;
        case 'contributions':
          await fetchAndExport('contributions', 'contributions', 'date');
          break;
        case 'loans':
          await fetchAndExport('loans', 'loans', 'created_at');
          break;
        case 'meetings':
          await fetchAndExport('meetings', 'meetings', 'date');
          break;
        case 'summary':
          downloadCSV([{
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
          }] as Record<string, unknown>[], 'summary_report');
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
    }
    setExporting(false);
  };

  const generatePDF = () => {
    const title = reportType === 'summary' ? 'Summary Report'
      : `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;

    let rows: string[] = [];
    if (reportType === 'summary') {
      rows = [
        `<td style="padding:8px 12px;border:1px solid #ddd">Total Members</td><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold">${stats.totalMembers}</td>`,
        `<td style="padding:8px 12px;border:1px solid #ddd">Active Members</td><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold">${stats.activeMembers}</td>`,
        `<td style="padding:8px 12px;border:1px solid #ddd">Contributions (MTD)</td><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold">KSh ${(stats.totalContributions / 1000).toFixed(0)}K</td>`,
        `<td style="padding:8px 12px;border:1px solid #ddd">Active Loans</td><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold">${stats.totalLoans}</td>`,
        `<td style="padding:8px 12px;border:1px solid #ddd">Overdue Loans</td><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold">${stats.overdueLoans}</td>`,
        `<td style="padding:8px 12px;border:1px solid #ddd">Loans Outstanding</td><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold">KSh ${(stats.totalLoansOutstanding / 1000).toFixed(0)}K</td>`,
        `<td style="padding:8px 12px;border:1px solid #ddd">Upcoming Meetings</td><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold">${stats.upcomingMeetings}</td>`,
      ];
    } else {
      const data = reportType === 'members' ? members
        : reportType === 'contributions' ? contributions
        : reportType === 'loans' ? loans
        : meetings;
      const keys = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'id' && k !== 'chama_id') : [];
      rows = data.map(row =>
        keys.map(k => `<td style="padding:8px 12px;border:1px solid #ddd;font-size:12px">${(row as Record<string, unknown>)[k] ?? ''}</td>`).join('')
      );
    }
    downloadPDF(title, rows, reportType);
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