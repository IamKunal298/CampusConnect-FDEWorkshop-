import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Lock, 
  ArrowRight,
  Filter,
  RefreshCw,
  Mail,
  Phone
} from 'lucide-react';
import { getEventRegistrations, checkinAttendee } from '../utils/api.js';

export default function OrganizerView({ 
  events, 
  currentUser, 
  setCurrentUser, 
  userPersonas, 
  selectedEventId, 
  setSelectedEventId 
}) {
  const [activeEventId, setActiveEventId] = useState(selectedEventId || 'evt_1');
  const [attendeeData, setAttendeeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [forbiddenError, setForbiddenError] = useState(null);
  const [searchAttendee, setSearchAttendee] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, CHECKED_IN, PENDING

  const fetchRoster = async () => {
    setIsLoading(true);
    setForbiddenError(null);
    setAttendeeData(null);

    try {
      const data = await getEventRegistrations(activeEventId, currentUser);
      setAttendeeData(data);
    } catch (err) {
      console.error('Organizer access error:', err);
      if (err.status === 403) {
        setForbiddenError(err.data);
      } else {
        setForbiddenError({
          error: 'Error',
          message: err.message || 'Failed to fetch attendee data.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [activeEventId, currentUser]);

  const handleToggleCheckin = async (regId) => {
    try {
      await checkinAttendee(activeEventId, regId, currentUser);
      // Refresh local list
      fetchRoster();
    } catch (e) {
      alert(e.message || 'Checkin failed');
    }
  };

  const handleExportCsv = () => {
    if (!attendeeData || !attendeeData.attendees) return;
    const headers = ['Registration ID,Ticket Code,Name,Email,Phone,Age,Role,Department,Registered At,Checked In'];
    const rows = attendeeData.attendees.map(a => 
      `"${a.id}","${a.ticketCode}","${a.name}","${a.email}","${a.phone}",${a.age},"${a.role}","${a.department}","${a.registeredAt}",${a.checkedIn}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendees_${activeEventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentEvent = events.find(e => e.id === activeEventId) || events[0];

  const filteredAttendees = (attendeeData?.attendees || []).filter(a => {
    const query = searchAttendee.trim().toLowerCase();
    const matchQuery = !query || 
      a.name.toLowerCase().includes(query) || 
      a.email.toLowerCase().includes(query) || 
      a.ticketCode.toLowerCase().includes(query) ||
      a.role.toLowerCase().includes(query);

    const matchStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'CHECKED_IN' && a.checkedIn) ||
      (statusFilter === 'PENDING' && !a.checkedIn);

    return matchQuery && matchStatus;
  });

  const checkedInCount = (attendeeData?.attendees || []).filter(a => a.checkedIn).length;
  const totalCount = attendeeData?.attendees?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full mb-1">
            <Lock className="w-3 h-3" />
            <span>GET /api/events/{'{id}'}/registrations</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-heading">
            Organizer Management Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Attendee list is strictly protected and accessible to the <strong>owning organizer only</strong>.
          </p>
        </div>

        {/* Current Auth Badge & Quick Switch */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white ${
            currentUser.role === 'organizer' ? 'bg-purple-600' : 'bg-blue-600'
          }`}>
            {currentUser.avatarInitials}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">{currentUser.name}</div>
            <div className="text-[11px] text-slate-500 capitalize">
              Role: <strong className={currentUser.role === 'organizer' ? 'text-purple-600' : 'text-blue-600'}>{currentUser.role}</strong>
              {currentUser.organizerId && ` (${currentUser.organizerId})`}
            </div>
          </div>
        </div>
      </div>

      {/* Event Selector Tabs */}
      <div className="mb-8">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
          Select Event to Inspect Roster:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {events.slice(0, 3).map((evt) => {
            const isSelected = activeEventId === evt.id;
            const isOwner = currentUser.organizerId === evt.organizerId;
            return (
              <button
                key={evt.id}
                onClick={() => setActiveEventId(evt.id)}
                className={`p-4 rounded-2xl text-left border transition relative ${
                  isSelected
                    ? 'bg-white border-purple-600 shadow-md ring-2 ring-purple-500/20'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{evt.id}</span>
                  {isOwner ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      You Own This Event ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Owned by {evt.organizerName.split(' ')[0]}
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-slate-900 truncate font-heading">{evt.title}</div>
                <div className="text-xs text-slate-500 mt-1">{evt.date} • {evt.location}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area: 403 Forbidden vs 200 OK Attendee Roster */}
      {isLoading ? (
        <div className="h-64 bg-slate-100 rounded-3xl border border-slate-200 animate-pulse flex items-center justify-center">
          <span className="text-xs font-bold text-slate-400">Verifying organizer credentials...</span>
        </div>
      ) : forbiddenError ? (
        
        /* 403 FORBIDDEN DEMO DISPLAY */
        <div className="bg-white rounded-3xl border border-rose-200 shadow-lg p-8 sm:p-12 text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-50 border-2 border-rose-200 flex items-center justify-center text-rose-600 mb-6 shadow-sm">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="inline-block text-[10px] font-mono font-bold tracking-widest text-rose-700 uppercase bg-rose-100 px-3 py-1 rounded-full mb-3">
            HTTP 403 FORBIDDEN: ORGANIZER_ACCESS_ONLY
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-heading mb-2">
            Access Restricted to Owning Organizer
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {forbiddenError.message || 'Only the designated event organizer is authorized to inspect the attendee roster.'}
          </p>

          {/* Diagnostic comparison */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Target Event:</span>
              <strong className="text-slate-800">{currentEvent.title} ({currentEvent.id})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Owning Organizer:</span>
              <strong className="text-emerald-700">{currentEvent.organizerName} ({currentEvent.organizerId})</strong>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-500">Your Current Identity:</span>
              <strong className="text-rose-700">{currentUser.name} ({currentUser.role})</strong>
            </div>
          </div>

          {/* 1-Click Role Switch to Resolve 403 */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-3">
              Want to see the authorized attendee view? Switch to Elena Rostova:
            </p>
            <button
              onClick={() => {
                const organizerPersona = userPersonas.find(p => p.role === 'organizer') || userPersonas[1];
                setCurrentUser(organizerPersona);
                setActiveEventId('evt_1');
              }}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Switch to Organizer (Elena Rostova)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      ) : attendeeData ? (
        
        /* 200 OK AUTHORIZED ATTENDEE ROSTER VIEW */
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">Total Registrations</span>
              <div className="text-2xl font-black text-slate-900 font-heading mt-1">{totalCount}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">Gate Checked-In</span>
              <div className="text-2xl font-black text-emerald-600 font-heading mt-1">{checkedInCount} / {totalCount}</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">Capacity Limit</span>
              <div className="text-2xl font-black text-slate-900 font-heading mt-1">{currentEvent.capacity} seats</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">Roster Actions</span>
              <button
                onClick={handleExportCsv}
                className="mt-1 inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Roster CSV</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchAttendee}
                onChange={(e) => setSearchAttendee(e.target.value)}
                placeholder="Search attendee name, email, ticket..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <span className="text-xs text-slate-400 font-medium">Filter:</span>
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === 'ALL' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setStatusFilter('CHECKED_IN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === 'CHECKED_IN' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Checked In ({checkedInCount})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  statusFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Pending ({totalCount - checkedInCount})
              </button>
            </div>
          </div>

          {/* Attendee Roster Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Attendee Name</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Role & Dept</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Gate Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendees.length > 0 ? (
                    filteredAttendees.map((attendee) => (
                      <tr key={attendee.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {attendee.ticketCode}
                        </td>
                        <td className="py-3.5 px-4">
                          <strong className="text-slate-900 block text-xs">{attendee.name}</strong>
                          <span className="text-[10px] text-slate-400">{attendee.age} years old</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{attendee.email}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{attendee.phone}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <div>{attendee.role}</div>
                          <div className="text-[10px] text-slate-400">{attendee.department}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(attendee.registeredAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {attendee.checkedIn ? (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>CHECKED IN</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" />
                              <span>PENDING</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleToggleCheckin(attendee.id)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                              attendee.checkedIn
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                            }`}
                          >
                            {attendee.checkedIn ? 'Undo Check-in' : 'Gate Check-in'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        No attendees match your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      ) : null}

    </div>
  );
}
