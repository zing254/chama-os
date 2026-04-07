import { useState } from 'react';
import { meetings, members, Meeting, addMeeting } from '../data/store';

export default function Meetings() {
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showNew, setShowNew] = useState(false);
  
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '10:00',
    venue: '',
    agenda: '',
  });
  const [meetingError, setMeetingError] = useState('');
  const [meetingSuccess, setMeetingSuccess] = useState(false);

  const upcoming = meetings.filter(m => m.status === 'upcoming');
  const completed = meetings.filter(m => m.status === 'completed');

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name.split(' ').slice(0, 2).join(' ') || id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Meetings</h1>
          <p className="text-gray-500 text-sm">Manage agendas, minutes and attendance</p>
        </div>
        <button onClick={() => setShowNew(true)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm">
          + Schedule Meeting
        </button>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">📅 Upcoming</h2>
          {upcoming.map(m => (
            <div
              key={m.id}
              onClick={() => setSelectedMeeting(m)}
              className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white cursor-pointer hover:from-blue-500 hover:to-blue-700 transition-all shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-blue-200 text-xs font-bold uppercase tracking-widest">Upcoming Meeting</span>
                  <h3 className="text-xl font-black mt-1">{m.title}</h3>
                  <p className="text-blue-200 text-sm mt-1">📅 {new Date(m.date).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })} · {m.time}</p>
                  <p className="text-blue-200 text-sm">📍 {m.venue}</p>
                </div>
                <div className="bg-blue-500/50 rounded-xl p-3 text-center min-w-[60px]">
                  <div className="text-2xl font-black">{new Date(m.date).getDate()}</div>
                  <div className="text-blue-200 text-xs">{new Date(m.date).toLocaleString('en-KE', { month: 'short' })}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-blue-200 text-xs font-bold mb-2">AGENDA ITEMS</div>
                <div className="flex flex-wrap gap-2">
                  {m.agenda.map((item, i) => (
                    <span key={i} className="bg-blue-500/40 text-blue-100 text-xs px-2 py-1 rounded-lg">{i + 1}. {item}</span>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={e => { e.stopPropagation(); }} className="bg-white text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                  📤 Share Agenda
                </button>
                <button onClick={e => { e.stopPropagation(); }} className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-400 transition-colors">
                  📱 WhatsApp Reminder
                </button>
                <button onClick={e => { e.stopPropagation(); }} className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-400 transition-colors">
                  ✅ Take Attendance
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past meetings */}
      <div>
        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">📁 Past Meetings ({completed.length})</h2>
        <div className="space-y-3">
          {completed.map(m => (
            <div
              key={m.id}
              onClick={() => setSelectedMeeting(m)}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-green-300 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="bg-gray-100 rounded-xl p-3 text-center min-w-[52px]">
                  <div className="text-lg font-black text-gray-700">{new Date(m.date).getDate()}</div>
                  <div className="text-gray-500 text-xs">{new Date(m.date).toLocaleString('en-KE', { month: 'short' })}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{m.title}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      m.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{m.status}</span>
                  </div>
                  <p className="text-sm text-gray-500">📍 {m.venue} · {m.time}</p>
                  <p className="text-sm text-gray-500">👥 {m.attendees.length} attendees</p>
                  {m.minutes && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{m.minutes.substring(0, 100)}...</p>
                  )}
                </div>
                <div className="text-green-600 text-sm font-bold shrink-0">View →</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meeting Detail Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 text-lg">{selectedMeeting.title}</h2>
              <button onClick={() => setSelectedMeeting(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['📅 Date', new Date(selectedMeeting.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })],
                  ['⏰ Time', selectedMeeting.time],
                  ['📍 Venue', selectedMeeting.venue],
                ].map(([label, val]) => (
                  <div key={label as string} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="text-xs font-bold text-gray-900 mt-0.5">{val}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="font-bold text-gray-900 mb-2">📋 Agenda</div>
                <div className="space-y-1.5">
                  {selectedMeeting.agenda.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {selectedMeeting.attendees.length > 0 && (
                <div>
                  <div className="font-bold text-gray-900 mb-2">👥 Attendance ({selectedMeeting.attendees.length})</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedMeeting.attendees.map(id => (
                      <span key={id} className="bg-green-50 border border-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {getMemberName(id)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedMeeting.minutes && (
                <div>
                  <div className="font-bold text-gray-900 mb-2">📝 Meeting Minutes</div>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                    {selectedMeeting.minutes}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
                  📤 Share via WhatsApp
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
                  📄 Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Meeting Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 text-lg">Schedule New Meeting</h2>
              <button onClick={() => { setShowNew(false); setMeetingError(''); setMeetingSuccess(false); }} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>
            {meetingSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-4 text-sm font-semibold">
                ✅ Meeting scheduled! WhatsApp + SMS notifications sent to all members.
              </div>
            )}
            {meetingError && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-4 text-sm">
                {meetingError}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Meeting Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. January Monthly Meeting"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Date</label>
                  <input 
                    type="date" 
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400" 
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Time</label>
                  <input 
                    type="time" 
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400" 
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Venue</label>
                <input 
                  type="text" 
                  placeholder="Physical location or Zoom link"
                  value={newMeeting.venue}
                  onChange={(e) => setNewMeeting({ ...newMeeting, venue: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400" 
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Agenda Items (one per line)</label>
                <textarea 
                  rows={4} 
                  placeholder="Opening prayer&#10;Roll call & apologies&#10;Treasurer's report&#10;AOB"
                  value={newMeeting.agenda}
                  onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 resize-none" 
                />
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-2 text-sm text-green-800">
                <input type="checkbox" id="notify" defaultChecked className="accent-green-600" />
                <label htmlFor="notify">Send WhatsApp + SMS to all {members.filter(m => m.status === 'active').length} active members</label>
              </div>
              <button 
                onClick={() => {
                  if (!newMeeting.title.trim()) {
                    setMeetingError('Please enter meeting title');
                    return;
                  }
                  if (!newMeeting.date) {
                    setMeetingError('Please select a date');
                    return;
                  }
                  if (!newMeeting.venue.trim()) {
                    setMeetingError('Please enter a venue');
                    return;
                  }
                  try {
                    addMeeting({
                      title: newMeeting.title,
                      date: newMeeting.date,
                      time: newMeeting.time,
                      venue: newMeeting.venue,
                      agenda: newMeeting.agenda.split('\n').filter(a => a.trim()),
                    });
                    setMeetingSuccess(true);
                    setTimeout(() => {
                      setShowNew(false);
                      setMeetingSuccess(false);
                      setNewMeeting({ title: '', date: '', time: '10:00', venue: '', agenda: '' });
                    }, 2000);
                  } catch (err) {
                    setMeetingError('Failed to schedule meeting');
                  }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl mt-1 transition-colors"
              >
                📅 Schedule & Notify Members
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
