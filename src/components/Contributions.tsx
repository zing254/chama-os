import { useState } from 'react';
import { contributions, members, addContribution } from '../data/store';

export default function Contributions() {
  const [filterMonth, setFilterMonth] = useState('November 2024');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showRecord, setShowRecord] = useState(false);
  const [showMpesa, setShowMpesa] = useState(false);
  const [mpesaStep, setMpesaStep] = useState(0);
  
  const [newContribution, setNewContribution] = useState({
    memberId: '',
    amount: 5000,
    mpesaRef: '',
    type: 'monthly' as const,
    status: 'paid' as const,
    date: new Date().toISOString().split('T')[0],
  });
  const [contribError, setContribError] = useState('');
  const [contribSuccess, setContribSuccess] = useState(false);

  const months = ['November 2024', 'October 2024', 'September 2024', 'August 2024'];

  const filtered = contributions.filter(c => {
    const matchMonth = c.month === filterMonth;
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchMonth && matchStatus;
  });

  const totalCollected = contributions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0);
  const totalPending = contributions.filter(c => c.status !== 'paid').reduce((s, c) => s + c.amount, 0);
  const paidCount = contributions.filter(c => c.status === 'paid').length;
  const collectionRate = Math.round((paidCount / contributions.length) * 100);

  const handleMpesaNext = () => {
    if (mpesaStep < 3) setMpesaStep(mpesaStep + 1);
    else { setShowMpesa(false); setMpesaStep(0); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Contributions</h1>
          <p className="text-gray-500 text-sm">Track and manage all member contributions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowMpesa(true)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all">
            <span>📱</span> M-Pesa Sync
          </button>
          <button onClick={() => setShowRecord(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all">
            + Manual Entry
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Collected', value: `KSh ${totalCollected.toLocaleString()}`, icon: '✅', color: 'from-green-500 to-emerald-600' },
          { label: 'Pending', value: `KSh ${totalPending.toLocaleString()}`, icon: '⏳', color: 'from-yellow-500 to-orange-500' },
          { label: 'Collection Rate', value: `${collectionRate}%`, icon: '📊', color: 'from-blue-500 to-blue-700' },
          { label: 'This Month Target', value: `KSh ${(contributions.length * 5000).toLocaleString()}`, icon: '🎯', color: 'from-purple-500 to-purple-700' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-xl font-black">{s.value}</div>
            <div className="text-xs text-white/80 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold text-gray-900">November Collection Progress</div>
          <span className="text-lg font-black text-green-600">{collectionRate}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all flex items-center justify-end pr-2"
            style={{ width: `${collectionRate}%` }}
          >
            <span className="text-white text-xs font-black">{paidCount}/{contributions.length}</span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{paidCount} paid</span>
          <span>{contributions.length - paidCount} remaining</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-green-400">
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <div className="flex gap-2">
          {['all', 'paid', 'pending', 'overdue'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${filterStatus === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Member', 'Month', 'Amount', 'Type', 'M-Pesa Ref', 'Date', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                        {c.memberName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{c.memberName.split(' ').slice(0, 2).join(' ')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{c.month}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">KSh {c.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full capitalize">{c.type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{c.mpesaRef || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{c.date || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                      c.status === 'paid' ? 'bg-green-100 text-green-700' :
                      c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {c.status !== 'paid' && (
                      <button className="text-xs text-green-600 font-bold hover:underline whitespace-nowrap">Record →</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">{filtered.length} records</span>
          <button className="text-xs text-green-600 font-bold hover:underline">Export to Excel →</button>
        </div>
      </div>

      {/* M-Pesa Sync Modal */}
      {showMpesa && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">M</div>
            <h2 className="font-black text-gray-900 text-xl mb-2">M-Pesa Sync</h2>
            {mpesaStep === 0 && (
              <>
                <p className="text-gray-500 text-sm mb-6">We'll pull all contributions paid to your Paybill in the last 30 days and auto-match them to members.</p>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-left mb-4">
                  <div className="text-xs font-bold text-green-800">Paybill: 247247</div>
                  <div className="text-xs text-green-600">Account: UMOJAWETU</div>
                </div>
                <button onClick={handleMpesaNext} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors">
                  Start Sync
                </button>
              </>
            )}
            {mpesaStep === 1 && (
              <>
                <div className="my-6">
                  <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-600 text-sm mt-4">Connecting to M-Pesa Daraja API...</p>
                </div>
                <button onClick={handleMpesaNext} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors">
                  Continue
                </button>
              </>
            )}
            {mpesaStep === 2 && (
              <>
                <p className="text-green-600 font-bold text-sm mb-4">✅ Sync Complete! Found 9 matching transactions</p>
                <div className="space-y-2 text-left mb-4">
                  {[
                    { name: 'Grace W.', ref: 'QHJ4K7P2X1', amount: 5000 },
                    { name: 'David O.', ref: 'QHJ4K7P2X2', amount: 5000 },
                    { name: 'Faith N.', ref: 'QHJ4K7P2X3', amount: 5000 },
                  ].map(t => (
                    <div key={t.ref} className="flex items-center justify-between bg-green-50 rounded-lg p-2.5 text-sm">
                      <span className="font-semibold text-gray-800">{t.name}</span>
                      <span className="text-xs text-gray-500 font-mono">{t.ref}</span>
                      <span className="font-bold text-green-700">KSh {t.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="text-xs text-center text-gray-400">...and 6 more</div>
                </div>
                <button onClick={handleMpesaNext} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors">
                  Apply All Matches
                </button>
              </>
            )}
            {mpesaStep === 3 && (
              <>
                <div className="text-5xl my-4">🎉</div>
                <p className="text-gray-800 font-bold mb-1">9 payments recorded!</p>
                <p className="text-gray-500 text-sm mb-6">KSh 45,000 matched and posted to members' accounts.</p>
                <button onClick={() => { setShowMpesa(false); setMpesaStep(0); }} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors">
                  Done ✓
                </button>
              </>
            )}
            {mpesaStep < 3 && mpesaStep > 0 && (
              <button onClick={() => { setShowMpesa(false); setMpesaStep(0); }} className="mt-3 text-sm text-gray-400 hover:text-gray-600 w-full">Cancel</button>
            )}
            {mpesaStep === 0 && (
              <button onClick={() => setShowMpesa(false)} className="mt-3 text-sm text-gray-400 hover:text-gray-600 w-full">Cancel</button>
            )}
          </div>
        </div>
      )}

      {/* Manual Record Modal */}
      {showRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 text-lg">Record Manual Payment</h2>
              <button onClick={() => { setShowRecord(false); setContribError(''); setContribSuccess(false); }} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>
            {contribSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-4 text-sm font-semibold">
                ✅ Payment recorded successfully!
              </div>
            )}
            {contribError && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-4 text-sm">
                {contribError}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Member</label>
                <select 
                  value={newContribution.memberId}
                  onChange={(e) => setNewContribution({ ...newContribution, memberId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400"
                >
                  <option value="">Select member...</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Amount (KSh)</label>
                <input 
                  type="number" 
                  value={newContribution.amount}
                  onChange={(e) => setNewContribution({ ...newContribution, amount: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400" 
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">M-Pesa Reference</label>
                <input 
                  type="text" 
                  placeholder="e.g. QHJ4K7P2X1"
                  value={newContribution.mpesaRef}
                  onChange={(e) => setNewContribution({ ...newContribution, mpesaRef: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 font-mono" 
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Contribution Type</label>
                <select 
                  value={newContribution.type}
                  onChange={(e) => setNewContribution({ ...newContribution, type: e.target.value as any })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400"
                >
                  <option value="monthly">Monthly Contribution</option>
                  <option value="shares">Shares</option>
                  <option value="fine">Fine</option>
                  <option value="special">Special Levy</option>
                </select>
              </div>
              <button 
                onClick={() => {
                  if (!newContribution.memberId) {
                    setContribError('Please select a member');
                    return;
                  }
                  if (newContribution.amount <= 0) {
                    setContribError('Please enter a valid amount');
                    return;
                  }
                  const member = members.find(m => m.id === newContribution.memberId);
                  if (!member) return;
                  try {
                    addContribution({
                      ...newContribution,
                      memberName: member.name,
                    });
                    setContribSuccess(true);
                    setTimeout(() => {
                      setShowRecord(false);
                      setContribSuccess(false);
                      setNewContribution({
                        memberId: '',
                        amount: 5000,
                        mpesaRef: '',
                        type: 'monthly',
                        status: 'paid',
                        date: new Date().toISOString().split('T')[0],
                      });
                    }, 1500);
                  } catch (err) {
                    setContribError('Failed to record payment');
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl mt-1 transition-colors"
              >
                ✅ Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
