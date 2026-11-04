import React from 'react';
import { ArrowRight, MapPin, Calendar, Users, CheckCircle, Flame, AlertCircle } from 'lucide-react';

export default function EventCard({ 
  event, 
  onSelectEvent, 
  onRegisterClick,
  isUserRegistered 
}) {
  const seatsLeft = Math.max(0, event.capacity - event.registeredCount);
  const isSoldOut = seatsLeft === 0;
  const isHighDemand = seatsLeft > 0 && seatsLeft <= 5;

  // Custom pastel card header styling matching Image 5
  const colorMap = {
    blue: {
      headerBg: 'bg-blue-100/70',
      initialsColor: 'text-blue-700',
      pillBg: 'bg-white text-blue-600 border-blue-200',
      accentDate: 'text-blue-700',
      arrowBg: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
    },
    green: {
      headerBg: 'bg-emerald-100/70',
      initialsColor: 'text-emerald-700',
      pillBg: 'bg-white text-emerald-700 border-emerald-200',
      accentDate: 'text-emerald-700',
      arrowBg: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
    },
    orange: {
      headerBg: 'bg-amber-100/70',
      initialsColor: 'text-amber-700',
      pillBg: 'bg-white text-amber-700 border-amber-200',
      accentDate: 'text-amber-700',
      arrowBg: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'
    },
    pink: {
      headerBg: 'bg-rose-100/70',
      initialsColor: 'text-rose-700',
      pillBg: 'bg-white text-rose-700 border-rose-200',
      accentDate: 'text-rose-700',
      arrowBg: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
    },
    purple: {
      headerBg: 'bg-purple-100/70',
      initialsColor: 'text-purple-700',
      pillBg: 'bg-white text-purple-700 border-purple-200',
      accentDate: 'text-purple-700',
      arrowBg: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'
    },
    teal: {
      headerBg: 'bg-teal-100/70',
      initialsColor: 'text-teal-700',
      pillBg: 'bg-white text-teal-700 border-teal-200',
      accentDate: 'text-teal-700',
      arrowBg: 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white'
    }
  };

  const currentTheme = colorMap[event.themeColor] || colorMap.blue;

  return (
    <div 
      className="group bg-white rounded-3xl border border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
      onClick={() => onSelectEvent(event)}
    >
      <div>
        {/* Top Pastel Badge Banner - Faithfully matching Image 5 */}
        <div className={`p-6 pb-5 ${currentTheme.headerBg} flex items-center justify-between border-b border-slate-100/80 transition-colors`}>
          
          {/* Bold Initials / Icon */}
          <div className="flex items-center space-x-2">
            <span className={`text-2xl font-black tracking-tight ${currentTheme.initialsColor} font-heading`}>
              {event.badge}
            </span>
            {isUserRegistered && (
              <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-2xs">
                <CheckCircle className="w-3 h-3" />
                <span>Registered</span>
              </span>
            )}
          </div>

          {/* Pill Category Badge */}
          <div className="flex items-center space-x-2">
            {isHighDemand && (
              <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Flame className="w-3 h-3 mr-1 text-amber-500 animate-pulse" />
                {seatsLeft} left
              </span>
            )}
            {isSoldOut && (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                FULL
              </span>
            )}
            <span className={`text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full border shadow-2xs ${currentTheme.pillBg}`}>
              {event.tag}
            </span>
          </div>

        </div>

        {/* Content Body */}
        <div className="p-6 pt-5">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-heading leading-tight mb-2">
            {event.title}
          </h3>

          {/* Date & Time */}
          <div className="flex items-center space-x-1.5 text-xs font-bold mb-1.5">
            <span className={`${currentTheme.accentDate} uppercase tracking-wide`}>
              {event.date} • {event.time}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>

          {/* Short Narrative */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Capacity meter preview */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center space-x-1.5">
              <Users className="w-3 h-3 text-slate-400" />
              <span>{event.registeredCount} / {event.capacity} registered</span>
            </div>
            <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${isSoldOut ? 'bg-rose-500' : isHighDemand ? 'bg-amber-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(100, Math.round((event.registeredCount / event.capacity) * 100))}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer (Matching Image 5) */}
      <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500 truncate max-w-[170px]">
          {event.host}
        </span>

        <div className="flex items-center space-x-2">
          {!isUserRegistered && !isSoldOut && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRegisterClick(event);
              }}
              className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition"
            >
              Register
            </button>
          )}

          {/* Arrow Action Button (Matching Image 5) */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${currentTheme.arrowBg}`}>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

    </div>
  );
}
