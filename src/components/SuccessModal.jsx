import React, { useEffect, useState, useRef } from 'react';
import { 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  Download, 
  Share2, 
  Ticket, 
  ExternalLink,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';

export default function SuccessModal({ 
  isOpen, 
  onClose, 
  registration, 
  event,
  onViewMyPasses 
}) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Trigger festive confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
      });

      // Generate dynamic QR Code for ticket
      if (registration && registration.qrData) {
        QRCode.toDataURL(registration.qrData, {
          width: 180,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        }).then(url => setQrCodeUrl(url)).catch(err => console.error(err));
      }
    }
  }, [isOpen, registration]);

  if (!isOpen || !registration || !event) return null;

  // Download standard .ics calendar file
  const handleDownloadCalendar = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Campus Connect//Event Pass//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title} (Campus Connect)`,
      `DESCRIPTION:${event.description}\\nTicket: ${registration.ticketCode}`,
      `LOCATION:${event.location}`,
      `DTSTART:${event.isoDate ? event.isoDate.replace(/-/g, '') + 'T140000Z' : '20261104T140000Z'}`,
      `DTEND:${event.isoDate ? event.isoDate.replace(/-/g, '') + 'T170000Z' : '20261104T170000Z'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_pass.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[95vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* TOP CELEBRATION HEADER - Wireframe (4) 'Successfully Registered' */}
        <div className="p-8 pb-4 text-center bg-gradient-to-b from-emerald-50/80 via-white to-white">
          
          {/* Wireframe (4) Circled Checkmark (4) */}
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 border-4 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/20 mb-4 animate-in zoom-in-50 duration-300">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>

          <div className="inline-block text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-100/80 px-2.5 py-0.5 rounded-full mb-1">
            Wireframe (4) Refinement
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
            Successfully Registered
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Your spot has been reserved. A confirmation pass was sent to <strong className="text-slate-700">{registration.email}</strong>.
          </p>
        </div>

        {/* DIGITAL CAMPUS TICKET CARD */}
        <div className="px-6 py-2 overflow-y-auto">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            {/* Background geometric accents */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-2xl pointer-events-none"></div>

            {/* Ticket Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold">
                  C
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
                  Campus Connect Pass
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                {registration.ticketCode}
              </span>
            </div>

            {/* Ticket Event Details */}
            <div className="py-4 space-y-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">
                  {event.tag || 'EVENT'}
                </span>
                <h3 className="text-xl font-extrabold text-white font-heading leading-tight">
                  {event.title}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Date & Time</span>
                  <strong>{event.date} • {event.time}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Location</span>
                  <strong className="truncate block">{event.location}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Attendee</span>
                  <strong className="truncate block">{registration.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block">Role</span>
                  <strong className="truncate block">{registration.role}</strong>
                </div>
              </div>
            </div>

            {/* Perforated Divider with Notch Cutouts */}
            <div className="relative py-3">
              <div className="border-t border-dashed border-slate-700"></div>
              <div className="absolute -left-9 top-1.5 w-6 h-6 bg-white rounded-full"></div>
              <div className="absolute -right-9 top-1.5 w-6 h-6 bg-white rounded-full"></div>
            </div>

            {/* Ticket Footer with QR Code */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">Verification QR</span>
                <span className="text-[11px] text-slate-400">Scan at entrance scanner</span>
                <div className="mt-2 text-[9px] font-mono text-slate-500">
                  ID: {registration.id}
                </div>
              </div>

              {qrCodeUrl ? (
                <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
                  <img src={qrCodeUrl} alt="Ticket QR" className="w-20 h-20" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-slate-800 rounded-xl animate-pulse"></div>
              )}
            </div>

          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleDownloadCalendar}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Add to Calendar (.ics)</span>
          </button>

          <div className="w-full sm:w-auto flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onViewMyPasses();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
            >
              <Ticket className="w-4 h-4" />
              <span>View in My Passes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
