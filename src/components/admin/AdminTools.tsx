import { useState, useEffect } from 'react';
import { supabase } from '../../data/supabase';
import { useAuth } from '../../data/auth-context';

type LogLevel = 'all' | 'info' | 'warning' | 'error';

interface LogEntry {
  id: string;
  created_at: string;
  level: string;
  action: string;
  details: string;
}

export default function AdminTools() {
  const [filterLevel, setFilterLevel] = useState<LogLevel>('all');
  const [activeTab, setActiveTab] = useState<'logs' | 'backup' | 'cache'>('logs');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const chamaId = user?.chamaId;

  useEffect(() => {
    if (!chamaId) {
      setLoading(false);
      return;
    }
    supabase
      .from('audit_logs')
      .select('*')
      .eq('chama_id', chamaId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setLogs((data as LogEntry[]) || []);
        setLoading(false);
      });
  }, [chamaId]);

  const filteredLogs = filterLevel === 'all'
    ? logs
    : logs.filter(l => l.level === filterLevel);

  const levelColors: Record<string, string> = {
    info: 'bg-blue-100 text-blue-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Tools & Logs</h1>
        <p className="text-gray-500 text-sm">System maintenance and activity logs</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl font-medium ${activeTab === 'logs' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          📋 Activity Logs
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 rounded-xl font-medium ${activeTab === 'backup' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          💾 Backup
        </button>
        <button
          onClick={() => setActiveTab('cache')}
          className={`px-4 py-2 rounded-xl font-medium ${activeTab === 'cache' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          🗑️ Clear Cache
        </button>
      </div>

      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <select
              value={filterLevel}
              onChange={e => setFilterLevel(e.target.value as LogLevel)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <button className="text-sm text-green-600 hover:underline">Export Logs</button>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No logs found.</div>
            ) : (
              filteredLogs.map(log => (
                <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-gray-50">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${levelColors[log.level]}`}>
                    {log.level.toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{log.action}</p>
                    <p className="text-sm text-gray-500">{log.details}</p>
                  </div>
                  <span className="text-xs text-gray-400">{log.created_at}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Database Backup</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Latest Backup</p>
                <p className="text-sm text-gray-500">Apr 1, 2026 10:00 AM</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                Success
              </span>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Backup Size</p>
                <p className="text-sm text-gray-500">2.4 MB</p>
              </div>
            </div>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl">
              Create New Backup
            </button>
          </div>
        </div>
      )}

      {activeTab === 'cache' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Clear Cache</h2>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Local Storage</p>
                <p className="text-sm text-gray-500">Clear cached data in browser</p>
              </div>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                Clear
              </button>
            </div>
            <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Session Storage</p>
                <p className="text-sm text-gray-500">Clear session data</p>
              </div>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                Clear
              </button>
            </div>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl">
              Clear All Cache
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
