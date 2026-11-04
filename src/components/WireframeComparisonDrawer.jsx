import React from 'react';
import { X, CheckCircle2, ArrowRight, Lightbulb, Code2, Sparkles, Layers } from 'lucide-react';

export default function WireframeComparisonDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  const comparisonItems = [
    {
      id: 'wf1',
      title: 'Wireframe (1) — Campus Connect Sign In',
      sketchDescription: 'Hand-drawn sketch with "Campus Connect", "Sign in or login", "Username", "Pass", and "Forgot password?".',
      refinedImplementation: 'Transformed into the high-energy split-screen authentication experience from Inspiration Showcase 01: Left navy banner with "Your campus life, all in one place", live interactive workshop & community buttons, and clean SSO college email (.edu) form with remember me, forgot password, and 1-click persona switching.',
      apiLinked: 'Client session & persona authentication (Student vs Organizer)'
    },
    {
      id: 'wf2',
      title: 'Wireframe (2) & Showcase 02 — Events Discovery Grid',
      sketchDescription: 'Hand-drawn 6-card grid with event titles, banners, details, and action buttons; inspired by Showcase 02 "What’s happening on campus?".',
      refinedImplementation: 'Full discovery hub with instant search, category pill filter chips (Workshops, Social, Career, Sports, Culture, Volunteer), and pastel badge headers (DT, CC, AI, ♫, ↗, ♡), live seat meters, date/time chips, and circular arrow detail view triggers.',
      apiLinked: 'GET /api/events & GET /api/events/{id}'
    },
    {
      id: 'wf3',
      title: 'Wireframe (3) — Registration Form',
      sketchDescription: 'Hand-drawn form layout with fields: Name, Email, Age, Phone, Role/Occupation, and [Submit] button in dashed border container.',
      refinedImplementation: 'Modern modal pre-filled with the active student profile, student ID and department extensions, client-side validation, and instant conflict resolution handling for HTTP 409 responses.',
      apiLinked: 'POST /api/registrations (Handles 201 Created or 409 Conflict)'
    },
    {
      id: 'wf4',
      title: 'Wireframe (4) — Successfully Registered',
      sketchDescription: 'Hand-drawn screen with circled checkmark (✓) and "Successfully Registered" text.',
      refinedImplementation: 'Animated celebratory checkmark with particle confetti, dynamic QR pass code generation, Ticket Code (e.g. CC-DTL-4921), Add to Apple/Google Calendar (.ics), and integration into My Passes wallet.',
      apiLinked: 'GET /api/me/registrations & dynamic QR generation'
    },
    {
      id: 'tech_util',
      title: 'Technical Utility — Owning Organizer Only Attendee Roster',
      sketchDescription: 'Required business logic: GET /api/events/{id}/registrations restricted to owning organizer.',
      refinedImplementation: 'Role-based access control. Unauthorized requests return HTTP 403 Forbidden with security diagnostics. Owning organizers (e.g. Elena Rostova) unlock the live roster with check-in toggles and CSV export.',
      apiLinked: 'GET /api/events/{id}/registrations (403 vs 200) & PATCH check-in'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-600 uppercase">
                Wireframe Analysis & Refinement Map
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight font-heading">
                Design Evolution & Architecture
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Here is the breakdown of how your 3 hand-drawn sketches (1, 2, 3, 4) and 2 idea showcase pages (01, 02) were analyzed, refined, and connected to the required backend REST endpoints:
          </p>

          <div className="space-y-4 pt-2">
            {comparisonItems.map((item) => (
              <div 
                key={item.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    {item.title}
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    {item.apiLinked}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-3">
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Uploaded Wireframe / Idea Note:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {item.sketchDescription}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
                      Engineered & Refined Website Feature:
                    </span>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {item.refinedImplementation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Campus Connect • Built with Node.js, Express, React 19, & Tailwind CSS
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
          >
            Explore Application
          </button>
        </div>

      </div>
    </div>
  );
}
