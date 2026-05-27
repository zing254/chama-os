import { useState } from 'react';
import { useAuth } from '../../data/auth-context';

export default function UserManagement() {
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviteStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-member`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email: inviteEmail,
            chamaId: user?.chamaId,
            memberId: `m${Date.now()}`,
          }),
        },
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to send invite');
      }

      setInviteStatus('sent');
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteStatus('idle');
        setInviteEmail('');
      }, 2000);
    } catch (err: any) {
      setInviteStatus('error');
      setErrorMessage(err.message || 'Failed to send invite');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm">Manage members and send invites</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl"
        >
          + Invite Member
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">👥</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Member Accounts</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          Invite your chama members to create their own accounts. They'll get access to 
          their personal dashboard showing their contributions, loans, and meetings.
        </p>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl"
        >
          Send Member Invite
        </button>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Invite Member</h2>
            {inviteStatus === 'sent' ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <p className="font-bold text-green-700">Invite sent successfully!</p>
                <p className="text-sm text-gray-500 mt-1">They'll receive an email to set up their account.</p>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member Email</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl"
                    placeholder="member@example.com"
                  />
                </div>
                {inviteStatus === 'error' && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}
                {inviteStatus === 'sending' && (
                  <p className="text-sm text-gray-500">Sending invite...</p>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteStatus('idle');
                      setInviteEmail('');
                    }}
                    className="flex-1 px-4 py-2 border rounded-xl hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteStatus === 'sending'}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
                  >
                    Send Invite
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
