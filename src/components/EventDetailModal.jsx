import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Coffee, 
  Ticket, 
  Share2, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

export default function EventDetailModal({ 
  event, 
  onClose, 
  onRegisterClick, 
  isUserRegistered,
  currentUser,
  onOpenOrganizerView
}) {
  if (!event) return null;

  const seatsLeft = Math.max(0, event.capacity - event.registeredCount);
  const isSoldOut = seatsLeft === 0;
  const isHighDemand = seatsLeft > 0 && seatsLeft <= 5;
  const percentFilled = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Top Header Banner with Image & Category */}
        <div className="relative h-48 bg-slate-900 overflow-hidden shrink-0">
          <img 
            src={event.coverImage} 
            alt={event.title} 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge & Category Pill */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-900 font-black text-2xl shadow-lg font-heading">
                {event.badge}
              </div>
              <div>
                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/20">
                  {event.tag}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-heading mt-1">
                  {event.title}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Key Quick Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-start space-x-2.5">
              <Calendar className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Date & Time</span>
                <strong className="text-slate-800">{event.date} • {event.time}</strong>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Location</span>
                <strong className="text-slate-800">{event.location}</strong>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 col-span-2 sm:col-span-1">
              <Users className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-slate-400 font-medium block text-[10px] uppercase">Capacity</span>
                <strong className="text-slate-800">
                  {event.registeredCount} / {event.capacity} seats ({seatsLeft} left)
                </strong>
              </div>
            </div>
          </div>

          {/* Seat Capacity Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600">Event Capacity Tracker</span>
              <span className={isSoldOut ? 'text-rose-600 font-bold' : isHighDemand ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                {isSoldOut ? 'SOLD OUT' : `${percentFilled}% Reserved`}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isSoldOut ? 'bg-rose-500' : isHighDemand ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${percentFilled}%` }}
              ></div>
            </div>
          </div>

          {/* Narrative / About */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              About this event
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {event.fullDescription || event.description}
            </p>
          </div>

          {/* Perks & What to Expect */}
          {event.perks && event.perks.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Student Perks & Takeaways
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {event.perks.map((perk, idx) => (
                  <div key={idx} className="flex items-center space-x-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule / Agenda */}
          {event.agenda && event.agenda.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Event Agenda
              </h4>
              <div className="space-y-2 border-l-2 border-blue-200 pl-4 ml-2">
                {event.agenda.map((item, idx) => (
                  <div key={idx} className="relative text-xs">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white"></div>
                    <span className="font-bold text-blue-600 mr-2">{item.time}</span>
                    <span className="text-slate-700">{item.topic}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Host & Organizer Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Organized By
              </span>
              <strong className="text-xs text-slate-800">{event.organizer}</strong>
              <div className="text-[11px] text-slate-500">Contact: {event.organizerEmail}</div>
            </div>

            {/* If current user is the owning organizer of this event */}
            {currentUser && currentUser.organizerId === event.organizerId && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOrganizerView(event.id);
                }}
                className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-600 text-white shadow-xs hover:bg-purple-700 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Manage Attendees</span>
              </button>
            )}
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {isUserRegistered ? (
              <span className="inline-flex items-center text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                You are registered for this event
              </span>
            ) : isSoldOut ? (
              <span className="inline-flex items-center text-rose-600 font-bold">
                <AlertCircle className="w-4 h-4 mr-1" />
                Capacity full (409 Conflict test ready)
              </span>
            ) : (
              <span>Free with verified campus student ID</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {isUserRegistered ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRegisterClick(event); // Will show duplicate registration warning or ticket
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition"
              >
                Test 409 Duplicate
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRegisterClick(event);
                }}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-1.5 ${
                  isSoldOut
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>{isSoldOut ? 'Attempt Register (Test 409)' : 'Register Now'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
