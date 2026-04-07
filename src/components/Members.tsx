import { useState } from 'react';
import { members, Member, addMember } from '../data/store';

const roleColors: Record<string, string> = {
  chairman: 'bg-yellow-100 text-yellow-800',
  treasurer: 'bg-green-100 text-green-800',
  secretary: 'bg-blue-100 text-blue-800',
  member: 'bg-gray-100 text-gray-700',
};

const roleIcons: Record<string, string> = {
  chairman: '👑',
  treasurer: '💼',
  secretary: '📝',
  member: '👤',
};

export default function Members() {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'member' as Member['role'],
  });
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search);
    const matchRole = filterRole === 'all' || m.role === filterRole;
    return matchSearch && matchRole;
  });

  const totalContributed = members.reduce((s, m) => s + m.totalContributed, 0);
  const activeMembers = members.filter(m => m.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Members</h1>
          <p className="text-gray-500 text-sm">{activeMembers} active · {members.length - activeMembers} inactive</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm">
          + Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: members.length, icon: '👥', color: 'bg-blue-50 border-blue-100' },
          { label: 'Active', value: activeMembers, icon: '✅', color: 'bg-green-50 border-green-100' },
          { label: 'Total Contributed', value: `KSh ${(totalContributed/1000).toFixed(0)}K`, icon: '💰', color: 'bg-emerald-50 border-emerald-100' },
          { label: 'Avg. Shares', value: Math.round(members.reduce((s, m) => s + m.shares, 0) / members.length), icon: '📊', color: 'bg-purple-50 border-purple-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-black text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-600">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text" placeholder="🔍  Search by name or phone..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
        />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-green-400">
          <option value="all">All Roles</option>
          <option value="chairman">Chairman</option>
          <option value="treasurer">Treasurer</option>
          <option value="secretary">Secretary</option>
          <option value="member">Member</option>
        </select>
      </div>

      {/* Members grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(m => (
          <div
            key={m.id}
            onClick={() => setSelectedMember(m)}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-green-300 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {m.avatar}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm leading-tight">{m.name}</div>
                  <div className="text-xs text-gray-500">{m.phone}</div>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {m.status}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${roleColors[m.role]}`}>
                {roleIcons[m.role]} {m.role}
              </span>
              <span className="text-xs text-gray-400">Joined {new Date(m.joinDate).getFullYear()}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-3">
              <div>
                <div className="text-xs text-gray-500">Total Contributed</div>
                <div className="text-sm font-black text-green-700">KSh {m.totalContributed.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Shares</div>
                <div className="text-sm font-black text-blue-700">{m.shares} units</div>
              </div>
              {m.totalLoans > 0 && (
                <div className="col-span-2">
                  <div className="text-xs text-gray-500">Active Loan Balance</div>
                  <div className="text-sm font-black text-orange-600">KSh {m.totalLoans.toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center font-black text-2xl text-green-700">
                  {selectedMember.avatar}
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-lg">{selectedMember.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${roleColors[selectedMember.role]}`}>
                      {roleIcons[selectedMember.role]} {selectedMember.role}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedMember.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {selectedMember.status}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['📱 Phone', selectedMember.phone],
                  ['📧 Email', selectedMember.email],
                  ['📅 Joined', new Date(selectedMember.joinDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })],
                  ['🏷️ Reg. No.', `KCH/M/${selectedMember.id.toUpperCase()}`],
                ].map(([label, value]) => (
                  <div key={label as string} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="text-sm font-semibold text-gray-800 mt-0.5">{value}</div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4">
                <div className="font-bold text-gray-800 mb-3">Financial Summary</div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-lg font-black text-green-700">KSh {(selectedMember.totalContributed / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-gray-500">Contributed</div>
                  </div>
                  <div>
                    <div className="text-lg font-black text-blue-700">{selectedMember.shares}</div>
                    <div className="text-xs text-gray-500">Shares</div>
                  </div>
                  <div>
                    <div className={`text-lg font-black ${selectedMember.totalLoans > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                      {selectedMember.totalLoans > 0 ? `KSh ${(selectedMember.totalLoans / 1000).toFixed(0)}K` : 'None'}
                    </div>
                    <div className="text-xs text-gray-500">Loan Balance</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
                  📱 Send SMS
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
                  📋 View Statement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add member modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 text-lg">Add New Member</h2>
              <button onClick={() => { setShowAddForm(false); setAddError(''); setNewMember({ name: '', phone: '', email: '', role: 'member' }); }} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>
            {addSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-4 text-sm font-semibold">
                ✅ Member added successfully! Welcome SMS will be sent shortly.
              </div>
            )}
            {addError && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-4 text-sm">
                {addError}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jane Wanjiku Kamau" 
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" 
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="07XX XXX XXX"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" 
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="jane@email.com"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" 
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Role</label>
                <select 
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as Member['role'] })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400"
                >
                  <option value="member">Member</option>
                  <option value="secretary">Secretary</option>
                  <option value="treasurer">Treasurer</option>
                  <option value="chairman">Chairman</option>
                </select>
              </div>
              <button
                onClick={() => {
                  if (!newMember.name.trim()) {
                    setAddError('Please enter member name');
                    return;
                  }
                  if (!newMember.phone.trim()) {
                    setAddError('Please enter phone number');
                    return;
                  }
                  try {
                    addMember(newMember);
                    setAddSuccess(true);
                    setTimeout(() => {
                      setShowAddForm(false);
                      setAddSuccess(false);
                      setNewMember({ name: '', phone: '', email: '', role: 'member' });
                    }, 1500);
                  } catch (err) {
                    setAddError('Failed to add member');
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl mt-2 transition-colors"
              >
                ✅ Add Member & Send Welcome SMS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
