import React, { useEffect, useState } from 'react';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Clock, 
  QrCode, 
  Download, 
  Trash2, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import { getMyRegistrations } from '../utils/api.js';

export default function MyPassesView({ 
  currentUser, 
  onSelectEvent, 
  onBackToDiscover 
}) {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState({});
  const [activeQrModal, setActiveQrModal] = useState(null);

  const fetchPasses = async () => {
    setIsLoading(true);
    try {
      const data = await getMyRegistrations(currentUser);
      setRegistrations(data.registrations || []);

      // Generate QR codes for all passes
      const qrs = {};
      for (const reg of data.registrations || []) {
        if (reg.qrData) {
          try {
            qrs[reg.id] = await QRCode.toDataURL(reg.qrData, {
              width: 200,
              margin: 1,
              color: { dark: '#0f172a', light: '#ffffff' }
            });
          } catch (e) {
            console.error('QR generation error:', e);
          }
        }
      }
      setQrCodes(qrs);
    } catch (err) {
      console.error('Failed to fetch user registrations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, [currentUser]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full mb-1">
            <span>GET /api/me/registrations</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-heading">
            My Campus Event Passes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Passes and admission vouchers issued to <strong className="text-slate-800">{currentUser.email}</strong>.
          </p>
        </div>

        <button
          onClick={onBackToDiscover}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Explore More Events</span>
        </button>
      </div>

      {/* Passes Listing */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-3xl border border-slate-200"></div>
          ))}
        </div>
      ) : registrations.length > 0 ? (
        <div className="space-y-6">
          {registrations.map((reg) => {
            const evt = reg.event || {};
            return (
              <div
                key={reg.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col md:flex-row justify-between"
              >
                {/* Left Pass Details */}
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {evt.tag || 'EVENT'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {reg.ticketCode}
                      </span>
                      {reg.checkedIn ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Checked In
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Confirmed Admission
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading mb-2">
                      {evt.title}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-600 my-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{evt.date} • {evt.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div>
                      Registered as: <strong className="text-slate-800">{reg.name}</strong> ({reg.role})
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Booked on: {new Date(reg.registeredAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Perforated Divider for Desktop */}
                <div className="hidden md:flex flex-col justify-between py-4 relative">
                  <div className="w-5 h-5 -mt-6 bg-[#f8fafc] rounded-full border border-slate-200/80"></div>
                  <div className="border-r border-dashed border-slate-200 h-full mx-2"></div>
                  <div className="w-5 h-5 -mb-6 bg-[#f8fafc] rounded-full border border-slate-200/80"></div>
                </div>

                {/* Right QR Gate Pass Section */}
                <div className="p-6 md:p-8 bg-slate-50/80 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col items-center justify-center shrink-0 w-full md:w-64 text-center">
                  {qrCodes[reg.id] ? (
                    <div className="p-2 bg-white rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:scale-105 transition" onClick={() => setActiveQrModal(reg)}>
                      <img src={qrCodes[reg.id]} alt="Gate QR" className="w-24 h-24" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-slate-200 rounded-2xl animate-pulse"></div>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">
                    Entry QR Pass
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {reg.ticketCode}
                  </span>

                  <button
                    onClick={() => onSelectEvent(evt)}
                    className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <span>View Event Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 font-heading">
            No Event Passes Yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            You haven’t registered for any campus events yet. Explore upcoming workshops, mixers, and tournaments!
          </p>
          <button
            onClick={onBackToDiscover}
            className="mt-6 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            Browse Campus Events
          </button>
        </div>
      )}

      {/* Enlarged QR Modal */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setActiveQrModal(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-base font-bold text-slate-900 mb-1">{activeQrModal.event?.title || 'Campus Event'}</h4>
            <p className="text-xs text-slate-500 mb-4">{activeQrModal.ticketCode}</p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block mb-4">
              <img src={qrCodes[activeQrModal.id]} alt="Large QR" className="w-48 h-48 mx-auto" />
            </div>
            <p className="text-xs text-slate-500 mb-4">Show this to the event organizer at the entrance gate.</p>
            <button
              onClick={() => setActiveQrModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
